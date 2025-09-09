import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const transformedCategories = categories.map(category => ({
      ...category,
      productCount: category._count.products
    }))

    return NextResponse.json(transformedCategories)

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Kateqoriyalar yüklənərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}
