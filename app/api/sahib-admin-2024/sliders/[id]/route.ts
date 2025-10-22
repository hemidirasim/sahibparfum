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

    const slider = await prisma.slider.findUnique({
      where: {
        id: params.id
      }
    })

    if (!slider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 })
    }

    return NextResponse.json(slider)
  } catch (error) {
    console.error('Slider fetch error:', error)
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
      title,
      subtitle,
      description,
      image,
      link,
      buttonText,
      isActive,
      order
    } = body

    // If only order is being updated, skip validation
    const isOrderOnlyUpdate = Object.keys(body).length === 1 && body.hasOwnProperty('order')
    
    // Validate required fields only for full updates
    if (!isOrderOnlyUpdate && (!title || !image)) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 })
    }

    // Build update data object
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (description !== undefined) updateData.description = description
    if (image !== undefined) updateData.image = image
    if (link !== undefined) updateData.link = link
    if (buttonText !== undefined) updateData.buttonText = buttonText
    if (isActive !== undefined) updateData.isActive = isActive
    if (order !== undefined) updateData.order = order


    // Update slider
    const slider = await prisma.slider.update({
      where: {
        id: params.id
      },
      data: updateData
    })

    return NextResponse.json({ 
      success: true, 
      slider: {
        id: slider.id,
        title: slider.title,
        subtitle: slider.subtitle,
        description: slider.description,
        image: slider.image,
        link: slider.link,
        buttonText: slider.buttonText,
        isActive: slider.isActive,
        order: slider.order,
        createdAt: slider.createdAt,
        updatedAt: slider.updatedAt
      }
    })
  } catch (error) {
    console.error('Slider update error:', error)
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

    // Delete slider
    await prisma.slider.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Slider deleted successfully'
    })
  } catch (error) {
    console.error('Slider delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}