import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user orders
    const orders = await prisma.order.findMany({
      where: {
        userId: params.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                brand: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format orders
    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        product: {
          name: item.product.name,
          brand: item.product.brand,
          image: JSON.parse(item.product.images || '[]')[0] || null
        }
      }))
    }))

    return NextResponse.json({
      orders: formattedOrders
    })
  } catch (error) {
    console.error('User orders fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
