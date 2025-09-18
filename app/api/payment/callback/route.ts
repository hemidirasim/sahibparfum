import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkTransactionStatus } from '@/lib/united-payment-auth'

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

    // If we have a transactionId, check the actual status with United Payment
    let actualStatus = status
    let actualOrderStatus = 'PENDING'
    
    if (transactionId) {
      console.log('Checking actual transaction status with United Payment for transactionId:', transactionId)
      const statusCheck = await checkTransactionStatus(transactionId)
      
      if (statusCheck.success) {
        actualStatus = statusCheck.status
        actualOrderStatus = statusCheck.orderStatus || 'PENDING'
        console.log('Actual transaction status:', actualStatus, 'Order status:', actualOrderStatus)
      } else {
        console.error('Failed to check transaction status:', statusCheck.error)
      }
    }

    // Update order status based on payment result
    let orderStatus = 'PENDING'
    let paymentStatus = 'PENDING'

    // Use actual status from United Payment if available
    const finalStatus = actualOrderStatus || status

    switch (finalStatus?.toLowerCase()) {
      case 'approved':
      case 'success':
      case 'completed':
        orderStatus = 'PAID'
        paymentStatus = 'COMPLETED'
        break
      case 'declined':
      case 'failed':
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
        console.warn('Unknown payment status:', finalStatus)
        orderStatus = 'PENDING'
        paymentStatus = 'PENDING'
    }

    console.log('Final order status:', orderStatus, 'Payment status:', paymentStatus)

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
