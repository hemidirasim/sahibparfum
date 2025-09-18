import { NextRequest, NextResponse } from 'next/server'

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
    console.error('Error in payment status API:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}