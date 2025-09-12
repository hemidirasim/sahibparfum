import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const { searchParams } = new URL(request.url)
    const guestSessionId = searchParams.get('guestSessionId')
    const userId = searchParams.get('userId')

    // Məhsulun mövcudluğunu yoxla
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Məhsul tapılmadı' }, { status: 404 })
    }

    // Əgər userId və ya guestSessionId varsa, bu istifadəçinin rating-ini yoxla
    let userRating = null
    if (userId) {
      userRating = await prisma.productRating.findFirst({
        where: { 
          productId,
          userId 
        }
      })
    } else if (guestSessionId) {
      userRating = await prisma.productRating.findFirst({
        where: { 
          productId,
          guestSessionId 
        }
      })
    }

    // Dəyərləndirmələri və statistikaları al
    const ratings = await prisma.productRating.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Statistikaları hesabla
    const stats = {
      total: ratings.length,
      relationship: {} as Record<string, number>,
      duration: {} as Record<string, number>,
      distance: {} as Record<string, number>,
      age: {} as Record<string, number>,
      season: {} as Record<string, number>,
      time: {} as Record<string, number>
    }

    ratings.forEach(rating => {
      if (rating.relationship) {
        stats.relationship[rating.relationship] = (stats.relationship[rating.relationship] || 0) + 1
      }
      if (rating.longevity) {
        stats.duration[rating.longevity] = (stats.duration[rating.longevity] || 0) + 1
      }
      if (rating.sillage) {
        stats.distance[rating.sillage] = (stats.distance[rating.sillage] || 0) + 1
      }
      if (rating.ageGroup) {
        stats.age[rating.ageGroup] = (stats.age[rating.ageGroup] || 0) + 1
      }
      if (rating.season) {
        stats.season[rating.season] = (stats.season[rating.season] || 0) + 1
      }
      if (rating.timeOfDay) {
        stats.time[rating.timeOfDay] = (stats.time[rating.timeOfDay] || 0) + 1
      }
    })

    return NextResponse.json({
      ratings,
      stats,
      userRating // İstifadəçinin mövcud rating-i
    })

  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { 
        error: 'Daxili server xətası', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const body = await request.json()

    // Məhsulun mövcudluğunu yoxla
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Məhsul tapılmadı' }, { status: 404 })
    }

    // Rating məlumatlarını qəbul et
    const { 
      rating, 
      comment, 
      userId, 
      guestSessionId,
      relationship,
      longevity,
      sillage,
      ageGroup,
      season,
      timeOfDay
    } = body

    // Ən azı bir rating field-i olmalıdır
    if (!rating && !relationship && !longevity && !sillage && !ageGroup && !season && !timeOfDay) {
      return NextResponse.json({ error: 'Ən azı bir dəyərləndirmə məlumatı tələb olunur' }, { status: 400 })
    }

    // Əgər sadə rating varsa, 1-5 arasında olmalıdır
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Etibarlı qiymətləndirmə tələb olunur (1-5)' }, { status: 400 })
    }

    // Mövcud dəyərləndirməni tap
    let whereClause: any = { productId }
    if (userId) {
      whereClause.userId = userId
    } else if (guestSessionId) {
      whereClause.guestSessionId = guestSessionId
    } else {
      return NextResponse.json({ error: 'İstifadəçi identifikasiyası tələb olunur' }, { status: 400 })
    }

    let productRating = await prisma.productRating.findFirst({
      where: whereClause
    })

    if (productRating) {
      // Mövcud dəyərləndirməni yenilə
      const updateData: any = {}
      if (rating !== undefined) updateData.rating = rating
      if (comment !== undefined) updateData.comment = comment
      if (relationship !== undefined) updateData.relationship = relationship
      if (longevity !== undefined) updateData.longevity = longevity
      if (sillage !== undefined) updateData.sillage = sillage
      if (ageGroup !== undefined) updateData.ageGroup = ageGroup
      if (season !== undefined) updateData.season = season
      if (timeOfDay !== undefined) updateData.timeOfDay = timeOfDay

      productRating = await prisma.productRating.update({
        where: { id: productRating.id },
        data: updateData
      })
    } else {
      // Yeni dəyərləndirmə yarad
      const createData: any = {
        productId
      }
      
      if (rating !== undefined) createData.rating = rating
      if (comment !== undefined) createData.comment = comment
      if (relationship !== undefined) createData.relationship = relationship
      if (longevity !== undefined) createData.longevity = longevity
      if (sillage !== undefined) createData.sillage = sillage
      if (ageGroup !== undefined) createData.ageGroup = ageGroup
      if (season !== undefined) createData.season = season
      if (timeOfDay !== undefined) createData.timeOfDay = timeOfDay
      
      if (userId) {
        createData.userId = userId
      } else if (guestSessionId) {
        createData.guestSessionId = guestSessionId
      }
      
      productRating = await prisma.productRating.create({
        data: createData
      })
    }

    return NextResponse.json({
      message: 'Dəyərləndirmə uğurla yadda saxlandı',
      rating: productRating
    })

  } catch (error) {
    console.error('Error creating rating:', error)
    return NextResponse.json(
      { 
        error: 'Daxili server xətası', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}