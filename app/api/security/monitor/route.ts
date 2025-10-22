import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Security monitoring endpoint
export async function GET(request: NextRequest) {
  try {
    // Check if request is from admin
    const authHeader = request.headers.get('authorization')
    const adminKey = process.env.ADMIN_SECURITY_KEY
    
    if (!authHeader || !adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get recent orders for monitoring
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        guestEmail: true,
        guestPhone: true,
        guestName: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })
    
    // Get payment statistics
    const paymentStats = await prisma.order.groupBy({
      by: ['status', 'paymentStatus'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        id: true
      }
    })
    
    // Get total revenue
    const totalRevenue = await prisma.order.aggregate({
      where: {
        status: 'PAID',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      _sum: {
        totalAmount: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        recentOrders,
        paymentStats,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        timestamp: new Date().toISOString(),
        serverTime: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Security monitoring error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Log security events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, details, severity = 'info' } = body
    
      event,
      details,
      severity,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Security event logged'
    })
    
  } catch (error) {
    console.error('Security logging error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
