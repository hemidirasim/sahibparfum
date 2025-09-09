import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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

    return NextResponse.json(product)
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
      variants,
      attributes
    } = body

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
        brand,
        categoryId,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stockCount: parseInt(stockCount) || 0,
        sku,
        isNew: isNew || false,
        isOnSale: isOnSale || false,
        isActive: isActive !== false
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

    // Delete product (cascades to variants and attributes)
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
