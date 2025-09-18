import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkTransactionStatus } from '@/lib/united-payment-auth'

// Handle payment callback from United Payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Payment callback received:', body)
    console.log('Callback headers:', Object.fromEntries(request.headers.entries()))

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
    const finalStatus = status || Status

    // Use final extracted values
    const orderIdToUpdate = finalOrderId
    console.log('Processing callback for order:', orderIdToUpdate, 'transactionId:', finalTransactionId, 'status:', finalStatus)

    // If we have a transactionId, check the actual status with United Payment
    let actualStatus = finalStatus
    let actualOrderStatus = 'PENDING'
    
    if (finalTransactionId) {
      console.log('Checking actual transaction status with United Payment for transactionId:', finalTransactionId)
      const statusCheck = await checkTransactionStatus(finalTransactionId)
      
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
          ...(finalTransactionId && { transactionId: parseInt(finalTransactionId) }),
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
        status: orderStatus,
        transactionId: finalTransactionId,
        redirectUrl: finalTransactionId ? `${process.env.UNITED_PAYMENT_SUCCESS_URL || 'http://localhost:3000/order-success'}?orderId=${orderIdToUpdate}&transactionId=${finalTransactionId}&status=${orderStatus}` : null
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
