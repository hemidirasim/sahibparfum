import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Rate limiting storage for callbacks
const callbackRateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function for callbacks
function checkCallbackRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 5 * 60 * 1000 // 5 minutes
  const maxRequests = 50 // Max 50 callbacks per 5 minutes (United Payment might send multiple)
  
  const key = ip
  const current = callbackRateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    callbackRateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// Handle payment callback from United Payment
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    // Rate limiting check
    if (!checkCallbackRateLimit(clientIP)) {
      console.error('Callback rate limit exceeded for IP:', clientIP)
      return NextResponse.json(
        { error: 'Too many callback requests', message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    const body = await request.json()

    // Extract callback data
    const { 
      clientOrderId, 
      transactionId, 
      status, 
      amount, 
      currency,
      message,
      // Additional fields that might come from United Payment
      orderId,
      paymentId,
      // United Payment specific fields
      OrderId,
      TransactionId,
      Status,
      Transaction
    } = body

    // Use different field names that United Payment might send
    const finalTransactionId = transactionId || TransactionId || Transaction
    const finalOrderId = clientOrderId || orderId || OrderId
    const initialStatus = status || Status


    if (!finalOrderId) {
      console.error('No order ID found in callback')
      return NextResponse.json({ 
        success: false, 
        error: 'No order ID provided' 
      }, { status: 400 })
    }

    // Map United Payment status to our order status
    let orderStatus = 'PENDING'
    let paymentStatus = 'PENDING'

    const statusStr = (initialStatus || '').toString().toLowerCase()
    
    if (statusStr === 'approved' || statusStr === 'success' || statusStr === 'completed') {
      orderStatus = 'PAID'
      paymentStatus = 'COMPLETED'
    } else if (statusStr === 'declined' || statusStr === 'failed' || statusStr === 'rejected') {
      orderStatus = 'PAYMENT_FAILED'
      paymentStatus = 'FAILED'
    } else if (statusStr === 'cancelled' || statusStr === 'canceled') {
      orderStatus = 'CANCELLED'
      paymentStatus = 'CANCELLED'
    }


    // Update order in database
    try {
      const updatedOrder = await prisma.order.update({
        where: { orderNumber: finalOrderId },
        data: {
          status: orderStatus,
          paymentStatus: paymentStatus,
          ...(finalTransactionId && { transactionId: parseInt(finalTransactionId.toString()) }),
          updatedAt: new Date()
        }
      })


      // If payment successful, reduce product stock
      if (orderStatus === 'PAID') {
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: updatedOrder.id },
          include: { product: true }
        })

        for (const item of orderItems) {
          if (item.product && item.product.stockCount !== null) {
            await prisma.product.update({
              where: { id: item.product.id },
              data: {
                stockCount: Math.max(0, item.product.stockCount - item.quantity)
              }
            })
          }
        }

      }

      return NextResponse.json({ 
        success: true, 
        message: 'Callback processed successfully',
        orderId: finalOrderId,
        status: orderStatus,
        transactionId: finalTransactionId
      })

    } catch (dbError) {
      console.error('Database error updating order:', dbError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Callback processing error:', error)
    return NextResponse.json({ 
      error: 'Callback processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const testOrderId = searchParams.get('orderId')
  const testTransactionId = searchParams.get('transactionId')
  
  return NextResponse.json({ 
    message: 'Payment callback endpoint is working',
    method: 'GET',
    testData: {
      orderId: testOrderId,
      transactionId: testTransactionId,
      timestamp: new Date().toISOString()
    }
  })
}