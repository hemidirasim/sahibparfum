import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        isActive: true
      },
      include: {
        category: true,
        brand: true,
        variants: {
          where: {
            isActive: true
          },
          orderBy: {
            price: 'asc'
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Məhsul tapılmadı' },
        { status: 404 }
      )
    }

    // Transform product to include calculated fields
    const transformedProduct = {
      ...product,
      price: parseFloat(product.price.toString()),
      salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
      images: product.images ? [product.images] : [],
      variants: product.variants.map(variant => ({
        ...variant,
        price: parseFloat(variant.price.toString()),
        salePrice: variant.salePrice ? parseFloat(variant.salePrice.toString()) : null
      })),
      averageRating: 0, // Reviews table yoxdur, default 0
      reviewCount: 0 // Reviews table yoxdur, default 0
    }

    return NextResponse.json(transformedProduct)

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Məhsul yüklənərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}
