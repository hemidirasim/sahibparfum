import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: true,
        attributes: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Parse images field - handle comma-separated string and convert to array
    const transformedProduct = {
      ...product,
      images: product.images 
        ? (typeof product.images === 'string' 
            ? product.images.split(',').filter(img => img.trim() !== '')
            : Array.isArray(product.images) 
              ? product.images 
              : [])
        : []
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    console.log('Product update request body:', JSON.stringify(body, null, 2))
    
    const {
      name,
      description,
      brandId,
      categoryId,
      price,
      salePrice,
      stockCount,
      sku,
      isNew,
      isOnSale,
      isActive,
      variants,
      attributes,
      images
    } = body

    // Handle simple restore request (only isActive field)
    if (Object.keys(body).length === 1 && 'isActive' in body) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: params.id }
      })

      if (!existingProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const updatedProduct = await prisma.product.update({
        where: { id: params.id },
        data: {
          isActive: isActive
        }
      })

      return NextResponse.json({ 
        success: true, 
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          isActive: updatedProduct.isActive
        }
      })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if SKU already exists (if changed)
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku }
      })

      if (skuExists) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 400 })
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        brandId,
        categoryId,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stockCount: parseInt(stockCount) || 0,
        sku,
        isNew: isNew || false,
        isOnSale: isOnSale || false,
        isActive: isActive !== false,
        images: Array.isArray(images) ? images.join(',') : images || ''
      }
    })

    // Update variants if provided
    if (variants) {
      // Delete existing variants
      await prisma.productVariant.deleteMany({
        where: { productId: params.id }
      })

      // Create new variants
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            productId: params.id,
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

    // Update attributes if provided
    if (attributes) {
      // Delete existing attributes
      await prisma.productAttribute.deleteMany({
        where: { productId: params.id }
      })

      // Create new attributes
      for (const attribute of attributes) {
        await prisma.productAttribute.create({
          data: {
            productId: params.id,
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
    console.error('Product update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Soft delete product (set isActive to false)
    await prisma.product.update({
      where: { id: params.id },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product deletion error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
