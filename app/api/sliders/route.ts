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

      count: sliders.length,
      orders: sliders.map(s => ({ id: s.id, order: s.order, title: s.title }))
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

      count: formattedSliders.length,
      orders: formattedSliders.map(s => ({ id: s.id, order: s.order, title: s.title }))
    })

    const response = NextResponse.json(formattedSliders)

    // Disable caching for dynamic content
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')

    return response
  } catch (error) {
    console.error('Sliders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
