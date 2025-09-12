import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get only active sliders, ordered by order field
    const sliders = await prisma.slider.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Format sliders for public use
    const formattedSliders = sliders.map(slider => ({
      id: slider.id,
      title: slider.title,
      subtitle: slider.subtitle,
      description: slider.description,
      image: slider.image,
      link: slider.link,
      buttonText: slider.buttonText,
      order: slider.order
    }))

    return NextResponse.json(formattedSliders)
  } catch (error) {
    console.error('Sliders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
