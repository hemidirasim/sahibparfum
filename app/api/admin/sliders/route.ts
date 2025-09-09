import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: any = {}

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    // Get sliders
    const sliders = await prisma.slider.findMany({
      where,
      orderBy: {
        order: 'asc'
      }
    })

    // Format sliders
    const formattedSliders = sliders.map(slider => ({
      id: slider.id,
      title: slider.title,
      subtitle: slider.subtitle,
      description: slider.description,
      image: slider.image,
      link: slider.link,
      buttonText: slider.buttonText,
      isActive: slider.isActive,
      order: slider.order,
      status: slider.isActive ? 'active' : 'inactive',
      createdAt: slider.createdAt,
      updatedAt: slider.updatedAt
    }))

    return NextResponse.json(formattedSliders)
  } catch (error) {
    console.error('Sliders API error:', error)
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
      title,
      subtitle,
      description,
      image,
      link,
      buttonText,
      isActive,
      order
    } = body

    // Validate required fields
    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 })
    }

    // Get max order to place new slider at the end
    const maxOrder = await prisma.slider.aggregate({
      _max: {
        order: true
      }
    })

    const newOrder = (maxOrder._max.order || 0) + 1

    // Create slider
    const slider = await prisma.slider.create({
      data: {
        title,
        subtitle,
        description,
        image,
        link,
        buttonText,
        isActive: isActive !== false,
        order: order || newOrder
      }
    })

    return NextResponse.json({ 
      success: true, 
      slider: {
        id: slider.id,
        title: slider.title,
        order: slider.order
      }
    })
  } catch (error) {
    console.error('Slider creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
