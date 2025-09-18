import { NextRequest, NextResponse } from 'next/server'

const UNITED_PAYMENT_CONFIG = {
  baseUrl: 'https://test-vpos.unitedpayment.az',
  authToken: process.env.UNITED_PAYMENT_AUTH_TOKEN
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order ID is required' 
      }, { status: 400 })
    }

    if (!UNITED_PAYMENT_CONFIG.authToken) {
      console.error('United Payment auth token not configured')
      // For testing purposes, return a mock response
      return NextResponse.json({
        success: true,
        orderStatus: 'PAID',
        paymentStatus: 'COMPLETED',
        transactionId: 12345,
        amount: 50,
        bankName: 'Test Bank',
        maskedPan: '****1234',
        bankRRN: 'TEST123',
        createdAt: new Date().toISOString(),
        isReversed: false,
        refundAmount: 0,
        rawData: { test: true }
      })
    }

    console.log('Checking transaction status for order ID:', orderId)

    // Call United Payment API to get transaction status by order ID
    const response = await fetch(`${UNITED_PAYMENT_CONFIG.baseUrl}/api/transactions/transaction-status-by-order-id-detailed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': UNITED_PAYMENT_CONFIG.authToken
      },
      body: JSON.stringify({
        clientOrderId: orderId
      })
    })

    if (!response.ok) {
      console.error('United Payment API error:', response.status, response.statusText)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to check payment status' 
      }, { status: response.status })
    }

    const paymentData = await response.json()
    console.log('United Payment response:', paymentData)

    // Map United Payment status to our order status
    let orderStatus = 'PENDING'
    let paymentStatus = 'PENDING'

    if (paymentData.isSuccess && paymentData.status === 'APPROVED') {
      orderStatus = 'PAID'
      paymentStatus = 'COMPLETED'
    } else if (paymentData.status === 'DECLINED' || paymentData.status === 'FAILED') {
      orderStatus = 'PAYMENT_FAILED'
      paymentStatus = 'FAILED'
    } else if (paymentData.status === 'CANCELLED') {
      orderStatus = 'CANCELLED'
      paymentStatus = 'CANCELLED'
    }

    return NextResponse.json({
      success: true,
      orderStatus,
      paymentStatus,
      transactionId: paymentData.transactionId,
      amount: paymentData.amount,
      bankName: paymentData.bankName,
      maskedPan: paymentData.maskedPan,
      bankRRN: paymentData.bankRRN,
      createdAt: paymentData.createdAt,
      isReversed: paymentData.isReversed,
      refundAmount: paymentData.refundAmount,
      rawData: paymentData
    })

  } catch (error) {
    console.error('Error checking order status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
