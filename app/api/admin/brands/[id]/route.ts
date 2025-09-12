import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, logo } = await request.json()
    const brandId = params.id

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Marka adı tələb olunur' },
        { status: 400 }
      )
    }

    // Check if new brand name already exists
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: name.trim(),
        NOT: {
          id: brandId
        }
      }
    })

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Bu marka adı artıq mövcuddur' },
        { status: 400 }
      )
    }

    // Update brand
    const updatedBrand = await prisma.brand.update({
      where: {
        id: brandId
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        logo: logo?.trim() || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Marka uğurla yeniləndi',
      brand: updatedBrand
    })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      { error: 'Marka yenilənərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id

    // Check if brand has products
    const productsWithBrand = await prisma.product.findMany({
      where: {
        brandId: brandId
      },
      select: {
        id: true
      }
    })

    if (productsWithBrand.length > 0) {
      // Delete all products with this brand (CASCADE will handle this automatically)
      await prisma.product.deleteMany({
        where: {
          brandId: brandId
        }
      })
    }

    // Delete the brand
    await prisma.brand.delete({
      where: {
        id: brandId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Marka və ona aid məhsullar uğurla silindi'
    })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      { error: 'Marka silərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}
