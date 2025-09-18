import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // Test email data
    const testOrderData = {
      orderId: 'TEST-001',
      customerName: 'Test Müştəri',
      customerEmail: email,
      orderItems: [
        {
          id: 'test-1',
          name: 'Test Parfüm',
          price: 50.00,
          quantity: 1,
          volume: '100ml'
        },
        {
          id: 'test-2',
          name: 'Test Ətir',
          price: 75.00,
          quantity: 2,
          volume: '50ml'
        }
      ],
      subtotal: 200.00,
      shipping: 0,
      total: 200.00,
      deliveryAddress: 'Test Ünvan\nBakı şəhəri\n+994 50 123 45 67',
      orderDate: new Date()
    }

    const result = await sendOrderConfirmationEmail(testOrderData)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email uğurla göndərildi',
        data: result.data 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Email göndərilmədi',
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
