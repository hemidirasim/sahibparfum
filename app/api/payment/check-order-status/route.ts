import { NextRequest, NextResponse } from 'next/server'

const UNITED_PAYMENT_CONFIG = {
  baseUrl: 'https://test-vpos.unitedpayment.az',
  authToken: process.env.UNITED_PAYMENT_AUTH_TOKEN
}

export async function POST(request: NextRequest) {
  try {
    console.log('Payment check-order-status API called')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { orderId } = body

    if (!orderId) {
      console.log('No orderId provided')
      return NextResponse.json({ 
        success: false, 
        error: 'Order ID is required' 
      }, { status: 400 })
    }

    console.log('Checking payment status for orderId:', orderId)
    console.log('Auth token configured:', !!UNITED_PAYMENT_CONFIG.authToken)

    // Always return mock response for now (until auth token is configured in production)
    console.log('Returning mock response for orderId:', orderId)
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
      rawData: { test: true, orderId }
    })

  } catch (error) {
    console.error('Error checking order status:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
