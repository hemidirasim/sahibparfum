import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all products with their brand and category info
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all brands
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        isActive: product.isActive,
        brandId: product.brandId,
        brandName: product.brand?.name || 'No Brand',
        categoryName: product.category?.name || 'No Category',
        createdAt: product.createdAt
      })),
      brands: brands.map(brand => ({
        id: brand.id,
        name: brand.name,
        isActive: brand.isActive
      })),
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      productsWithBrands: products.filter(p => p.brandId).length,
      productsWithoutBrands: products.filter(p => !p.brandId).length
    })

  } catch (error) {
    console.error('Debug products error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
