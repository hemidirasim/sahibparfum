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

    const slider = await prisma.slider.findUnique({
      where: { id: params.id }
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

    // Check if slider exists
    const existingSlider = await prisma.slider.findUnique({
      where: { id: params.id }
    })

    if (!existingSlider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 })
    }

    // Update slider
    const slider = await prisma.slider.update({
      where: { id: params.id },
      data: {
        title,
        subtitle,
        description,
        image,
        link,
        buttonText,
        isActive,
        order
      }
    })

    return NextResponse.json({ 
      success: true, 
      slider: {
        id: slider.id,
        title: slider.title
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

    // Check if slider exists
    const existingSlider = await prisma.slider.findUnique({
      where: { id: params.id }
    })

    if (!existingSlider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 })
    }

    // Delete slider
    await prisma.slider.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Slider deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
