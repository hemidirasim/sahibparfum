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
    const limit = parseInt(searchParams.get('limit') || '5')

    const recentOrders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user?.name || order.guestName || 'Qonaq',
      email: order.user?.email || order.guestEmail,
      amount: Number(order.totalAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      date: order.createdAt.toISOString().split('T')[0],
      createdAt: order.createdAt
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Recent orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
