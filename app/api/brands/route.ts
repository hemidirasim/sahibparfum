import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all brands from brands table
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true
      },
      select: {
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Group brands by first letter
    const brandsByLetter: {[key: string]: string[]} = {}
    
    brands.forEach(brand => {
      const firstLetter = brand.name.charAt(0).toUpperCase()
      if (!brandsByLetter[firstLetter]) {
        brandsByLetter[firstLetter] = []
      }
      brandsByLetter[firstLetter].push(brand.name)
    })

    return NextResponse.json({
      success: true,
      brands: brandsByLetter
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Brands yüklənərkən xəta baş verdi', details: error.message },
      { status: 500 }
    )
  }
}
