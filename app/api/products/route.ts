import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    // Search filter
    const search = searchParams.get('search')
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Category filter
    const category = searchParams.get('category')
    if (category) {
      where.category = {
        name: { contains: category, mode: 'insensitive' }
      }
    }

    // Alphabetical filter (product name)
    const filter = searchParams.get('filter')
    if (filter) {
      where.name = {
        startsWith: filter,
        mode: 'insensitive'
      }
    }

    // Multiple brands filter (prioritize over single brand and brandFilter)
    const brands = searchParams.getAll('brands')
    const brand = searchParams.get('brand')
    const brandFilter = searchParams.get('brandFilter')
    
    if (brands.length > 0) {
      where.brand = {
        name: {
          in: brands
        }
      }
    } else if (brand) {
      where.brand = {
        name: { contains: brand, mode: 'insensitive' }
      }
    } else if (brandFilter) {
      where.brand = {
        name: {
          startsWith: brandFilter,
          mode: 'insensitive'
        }
      }
    }

    // New products filter
    const newProducts = searchParams.get('newProducts')
    if (newProducts === 'true') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      where.createdAt = {
        gte: thirtyDaysAgo
      }
    }

    // Sale filter
    const sale = searchParams.get('sale')
    if (sale === 'true') {
      where.salePrice = {
        not: null
      }
    }

    // Rating filter
    const minRating = searchParams.get('minRating')
    if (minRating) {
      where.averageRating = {
        gte: parseFloat(minRating)
      }
    }

    // Multiple price ranges filter (prioritize over single price range)
    const priceRanges = searchParams.getAll('priceRanges')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (priceRanges.length > 0) {
      const priceConditions = priceRanges.map(range => {
        switch (range) {
          case '0-50':
            return { price: { lte: 50 } }
          case '50-100':
            return { price: { gte: 50, lte: 100 } }
          case '100-200':
            return { price: { gte: 100, lte: 200 } }
          case '200-500':
            return { price: { gte: 200, lte: 500 } }
          case '500+':
            return { price: { gte: 500 } }
          default:
            return {}
        }
      }).filter(condition => Object.keys(condition).length > 0)
      
      if (priceConditions.length > 0) {
        where.OR = priceConditions
      }
    } else if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        where.price.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice)
      }
    }

    // Multiple volumes filter (prioritize over single volume)
    const volumes = searchParams.getAll('volumes')
    const volume = searchParams.get('volume')
    if (volumes.length > 0) {
      where.volume = {
        in: volumes
      }
    } else if (volume) {
      where.volume = {
        contains: volume,
        mode: 'insensitive'
      }
    }

    // Multiple category IDs filter
    const categoryIds = searchParams.getAll('categoryIds')
    if (categoryIds.length > 0) {
      where.categoryId = {
        in: categoryIds
      }
    }


    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          ratings: {
            select: {
              rating: true
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

    // Transform products with real rating data
    const transformedProducts = products.map(product => {
      // Calculate real average rating from ProductRating table
      const ratings = product.ratings.filter(r => r.rating !== null)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length 
        : 0
      
      return {
        ...product,
        price: parseFloat(product.price.toString()),
        salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
        images: product.images ? [product.images] : [],
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
        isNew: new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        onSale: product.salePrice !== null
      }
    })

    const response = NextResponse.json({
      success: true,
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

    // Disable caching for dynamic content
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')

    return response

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Məhsullar yüklənərkən xəta baş verdi', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}