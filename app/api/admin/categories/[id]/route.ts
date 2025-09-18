import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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

    const category = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Category fetch error:', error)
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
      image,
      isActive
    } = body

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if name already exists (if changed)
    if (name && name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: { name }
      })

      if (nameExists) {
        return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        description,
        image,
        isActive: isActive !== false
      }
    })

    return NextResponse.json({ 
      success: true, 
      category: {
        id: category.id,
        name: category.name
      }
    })
  } catch (error) {
    console.error('Category update error:', error)
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

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    console.log(`Deleting category: ${existingCategory.name} with ${existingCategory._count.products} products`)

    // Delete all products in this category first (soft delete - set isActive to false)
    if (existingCategory._count.products > 0) {
      await prisma.product.updateMany({
        where: { categoryId: params.id },
        data: { isActive: false }
      })
      console.log(`Soft deleted ${existingCategory._count.products} products from category: ${existingCategory.name}`)
    }

    // Delete category
    await prisma.category.delete({
      where: { id: params.id }
    })

    console.log(`Successfully deleted category: ${existingCategory.name}`)

    // Revalidate category-related pages
    try {
      revalidatePath('/api/categories')
      revalidatePath('/')
      revalidatePath('/categories')
      console.log('Revalidated category paths after deletion')
    } catch (revalidateError) {
      console.error('Revalidation error:', revalidateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
