import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all brands with product count
    const brands = await prisma.brand.findMany({
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

    // Transform the data
    const brandsWithCount = brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      description: brand.description,
      logo: brand.logo,
      productCount: brand._count.products,
      createdAt: brand.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      brands: brandsWithCount
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Brands yüklənərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, logo } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Marka adı tələb olunur' },
        { status: 400 }
      )
    }

    // Check if brand already exists
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: name.trim()
      }
    })

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Bu marka artıq mövcuddur' },
        { status: 400 }
      )
    }

    // Create new brand
    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        logo: logo?.trim() || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Marka uğurla əlavə edildi',
      brand: brand
    })
  } catch (error) {
    console.error('Error adding brand:', error)
    return NextResponse.json(
      { error: 'Marka əlavə edərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}
