import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total counts
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count()
    ])

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID'
      },
      _sum: {
        totalAmount: true
      }
    })

    const totalRevenue = revenueResult._sum.totalAmount || 0

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
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

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: Number(totalRevenue),
      recentOrders,
      recentUsers
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
