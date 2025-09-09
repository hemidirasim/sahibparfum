import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const filter = searchParams.get('filter')
    const newProducts = searchParams.get('newProducts')
    const sale = searchParams.get('sale')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      inStock: true
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Category filter
    if (category) {
      where.category = {
        name: {
          contains: category,
          mode: 'insensitive'
        }
      }
    }

    // Alphabet filter
    if (filter) {
      where.OR = [
        { name: { startsWith: filter, mode: 'insensitive' } },
        { brand: { startsWith: filter, mode: 'insensitive' } }
      ]
    }

    // New products filter (created in last 30 days)
    if (newProducts === 'true') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      where.createdAt = {
        gte: thirtyDaysAgo
      }
    }

    // Sale filter
    if (sale === 'true') {
      where.salePrice = {
        not: null
      }
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          reviews: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.count({ where })
    ])

    // Transform products to include calculated fields
    const transformedProducts = products.map(product => ({
      ...product,
      price: parseFloat(product.price.toString()),
      salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length 
        : 0,
      reviewCount: product.reviews.length,
      isNew: new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      onSale: product.salePrice !== null
    }))

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Məhsullar yüklənərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}
