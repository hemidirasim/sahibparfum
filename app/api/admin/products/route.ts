import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { sku: { contains: search } }
      ]
    }

    if (category) {
      where.category = {
        name: category
      }
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    // Get products with category and variants
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          where: { isActive: true }
        },
        attributes: true
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get total count for pagination
    const total = await prisma.product.count({ where })

    // Format products
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      stock: product.stockCount,
      status: product.isActive ? 'active' : 'inactive',
      image: product.images || '/images/placeholder.jpg',
      images: product.images ? [product.images] : [],
      sku: product.sku,
      brand: typeof product.brand === 'string' ? product.brand : product.brand?.name || 'Brend məlumatı yoxdur',
      category: product.category.name,
      isNew: product.isNew,
      isOnSale: product.isOnSale,
      variants: product.variants.map(variant => ({
        id: variant.id,
        volume: variant.volume,
        price: Number(variant.price),
        salePrice: variant.salePrice ? Number(variant.salePrice) : null,
        stock: variant.stock,
        sku: variant.sku
      })),
      attributes: product.attributes.map(attr => ({
        id: attr.id,
        name: attr.name,
        value: attr.value
      })),
      createdAt: product.createdAt
    }))

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      brand,
      categoryId,
      price,
      salePrice,
      stockCount,
      sku,
      isNew,
      isOnSale,
      isActive,
      images,
      variants,
      attributes
    } = body

    // Validate required fields
    if (!name || !description || !categoryId || !sku) {
      return NextResponse.json({ error: 'Name, description, category and SKU are required' }, { status: 400 })
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    })

    if (existingProduct) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        brand,
        categoryId,
        price: price ? parseFloat(price) : 0,
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stockCount: parseInt(stockCount) || 0,
        sku,
        isNew: isNew || false,
        isOnSale: isOnSale || false,
        isActive: isActive !== false,
        images: JSON.stringify(images || [])
      }
    })

    // Create variants if provided
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            volume: variant.volume,
            price: parseFloat(variant.price),
            salePrice: variant.salePrice ? parseFloat(variant.salePrice) : null,
            stock: parseInt(variant.stock) || 0,
            sku: variant.sku,
            isActive: true
          }
        })
      }
    }

    // Create attributes if provided
    if (attributes && attributes.length > 0) {
      for (const attribute of attributes) {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            name: attribute.name,
            value: attribute.value
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku
      }
    })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
