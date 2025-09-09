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
        id: params.id
      },
      include: {
        category: true,
        variants: {
          where: {
            isActive: true
          },
          orderBy: {
            price: 'asc'
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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
      variants: product.variants.map(variant => ({
        ...variant,
        price: parseFloat(variant.price.toString()),
        salePrice: variant.salePrice ? parseFloat(variant.salePrice.toString()) : null
      })),
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length 
        : 0,
      reviewCount: product.reviews.length
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
