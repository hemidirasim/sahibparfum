import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST DB API ===')
    
    // Test database connection
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    // Test order creation
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        totalAmount: 100.0,
        paymentMethod: 'CASH',
        status: 'PENDING',
        notes: 'Test order for debugging'
      }
    })
    
    console.log('Test order created:', testOrder)
    
    return NextResponse.json({
      success: true,
      userCount,
      testOrder: {
        id: testOrder.id,
        orderNumber: testOrder.orderNumber,
        totalAmount: testOrder.totalAmount,
        status: testOrder.status
      }
    })
  } catch (error) {
    console.error('Test DB error:', error)
    return NextResponse.json({ 
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
