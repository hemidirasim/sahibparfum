import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Handle payment callback from United Payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Payment callback received:', body)

    // Extract callback data (format may vary based on United Payment documentation)
    const { 
      clientOrderId, 
      transactionId, 
      status, 
      amount, 
      currency,
      message,
      // Additional fields that might come from United Payment
      orderId,
      paymentId
    } = body

    // Use clientOrderId as primary order identifier
    const orderIdToUpdate = clientOrderId || orderId

    // Update order status based on payment result
    let orderStatus = 'PENDING'
    let paymentStatus = 'PENDING'

    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'approved':
        orderStatus = 'PAID'
        paymentStatus = 'COMPLETED'
        break
      case 'failed':
      case 'declined':
      case 'rejected':
        orderStatus = 'PAYMENT_FAILED'
        paymentStatus = 'FAILED'
        break
      case 'pending':
      case 'processing':
        orderStatus = 'PENDING'
        paymentStatus = 'PENDING'
        break
      case 'cancelled':
      case 'canceled':
        orderStatus = 'CANCELLED'
        paymentStatus = 'CANCELLED'
        break
      default:
        console.warn('Unknown payment status:', status)
        orderStatus = 'PENDING'
        paymentStatus = 'PENDING'
    }

    // Update order in database
    try {
      const updatedOrder = await prisma.order.update({
        where: { orderNumber: orderIdToUpdate },
        data: {
          status: orderStatus,
          paymentStatus: paymentStatus,
          updatedAt: new Date()
        }
      })

      console.log('Order updated successfully:', updatedOrder.id)

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

        console.log('Product stock updated for order:', orderIdToUpdate)
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Callback processed successfully',
        orderId: orderIdToUpdate,
        status: orderStatus 
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
  return NextResponse.json({ 
    message: 'Payment callback endpoint is working',
    method: 'GET'
  })
}
