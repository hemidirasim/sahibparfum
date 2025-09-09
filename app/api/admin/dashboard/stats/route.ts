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

    // Get current date and last month date
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)

    // Total sales (all time)
    const totalSalesResult = await prisma.order.aggregate({
      where: {
        status: 'DELIVERED'
      },
      _sum: {
        totalAmount: true
      }
    })

    // Current month sales
    const currentMonthSalesResult = await prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        totalAmount: true
      }
    })

    // Last month sales
    const lastMonthSalesResult = await prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth
        }
      },
      _sum: {
        totalAmount: true
      }
    })

    // Total orders
    const totalOrders = await prisma.order.count()

    // Total products
    const totalProducts = await prisma.product.count({
      where: {
        isActive: true
      }
    })

    // Total customers (users)
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'USER'
      }
    })

    // Active sliders
    const activeSliders = await prisma.slider.count({
      where: {
        isActive: true
      }
    })

    // Calculate monthly growth
    const currentMonthSales = Number(currentMonthSalesResult._sum.totalAmount || 0)
    const lastMonthSales = Number(lastMonthSalesResult._sum.totalAmount || 0)
    const monthlyGrowth = lastMonthSales > 0 
      ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 
      : 0

    const stats = {
      totalSales: Number(totalSalesResult._sum.totalAmount || 0),
      totalOrders,
      totalProducts,
      totalCustomers,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      activeSliders
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
