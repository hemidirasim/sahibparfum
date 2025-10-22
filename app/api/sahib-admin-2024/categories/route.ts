import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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

    // Build where clause - show all categories for admin (not filtered by products)
    const where: any = {
      isActive: true
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ]
        }
      ]
    }

    // Get categories with product count (only active products)
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Format categories
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      productCount: category._count.products,
      status: category.isActive ? 'active' : 'inactive',
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('Categories API error:', error)
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
      image,
      isActive
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if category name already exists
    const existingCategory = await prisma.category.findFirst({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        isActive: isActive !== false
      }
    })

    // Revalidate category-related pages
    try {
      revalidatePath('/api/categories')
      revalidatePath('/')
      revalidatePath('/categories')
    } catch (revalidateError) {
      console.error('Revalidation error:', revalidateError)
    }

    return NextResponse.json({ 
      success: true, 
      category: {
        id: category.id,
        name: category.name
      }
    })
  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
