import { NextRequest, NextResponse } from 'next/server'
import { getValidToken } from '@/lib/united-payment-auth'
import { prisma } from '@/lib/prisma'

// United Payment API configuration
const UNITED_PAYMENT_CONFIG = {
  // Test environment URLs
  testApiUrl: 'https://test-vpos.unitedpayment.az',
  productionApiUrl: 'https://vpos.unitedpayment.az',
  
  // API Configuration
  email: process.env.UNITED_PAYMENT_EMAIL,
  password: process.env.UNITED_PAYMENT_PASSWORD,
  partnerId: process.env.UNITED_PAYMENT_PARTNER_ID, // Optional parameter
  
  // URLs
  callbackUrl: process.env.UNITED_PAYMENT_CALLBACK_URL || 'http://localhost:3000/api/payment/callback',
  successUrl: process.env.UNITED_PAYMENT_SUCCESS_URL || 'http://localhost:3000/order-success',
  failureUrl: process.env.UNITED_PAYMENT_FAILURE_URL || 'http://localhost:3000/checkout?payment=failed',
  cancelUrl: process.env.UNITED_PAYMENT_CANCEL_URL || 'http://localhost:3000/checkout?payment=cancelled',
  declineUrl: process.env.UNITED_PAYMENT_DECLINE_URL || 'http://localhost:3000/checkout?payment=declined',
  
  // Environment - Use production environment with provided credentials
  isProduction: process.env.UNITED_PAYMENT_ENV === 'production'
}

// Get API URL based on environment
function getApiUrl(): string {
  return UNITED_PAYMENT_CONFIG.isProduction 
    ? UNITED_PAYMENT_CONFIG.productionApiUrl 
    : UNITED_PAYMENT_CONFIG.testApiUrl
}

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 10 // Max 10 requests per 15 minutes
  
  const key = ip
  const current = rateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// Create payment session
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      console.error('Rate limit exceeded for IP:', clientIP)
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    
    const { orderId, amount, currency = 'AZN', description, customerInfo, retry, source } = body


    // Handle retry payment - fetch order data from database
    if (retry && orderId) {
      
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })

        orderExists: !!existingOrder,
        orderId: existingOrder?.id,
        totalAmount: existingOrder?.totalAmount,
        orderNumber: existingOrder?.orderNumber,
        guestName: existingOrder?.guestName,
        guestEmail: existingOrder?.guestEmail,
        guestPhone: existingOrder?.guestPhone
      })

      if (!existingOrder) {
        return NextResponse.json(
          { error: 'Sifariş tapılmadı' },
          { status: 404 }
        )
      }

      // Use existing order data for retry
      const retryData = {
        orderId: existingOrder.id,
        amount: existingOrder.totalAmount,
        currency: 'AZN',
        description: `Sifariş #${existingOrder.orderNumber} - Yenidən ödəniş`,
        customerInfo: {
          name: existingOrder.guestName || 'Müştəri',
          email: existingOrder.guestEmail || 'customer@example.com',
          phone: existingOrder.guestPhone || '+994501234567'
        }
      }


      // Update body with retry data
      Object.assign(body, retryData)
      
    }

    // Validate required fields (use updated body after retry logic)
    const finalOrderId = body.orderId || orderId
    const finalAmount = body.amount || amount
    const finalCustomerInfo = body.customerInfo || customerInfo
    
      finalOrderId: !!finalOrderId,
      finalAmount: !!finalAmount,
      finalCustomerInfo: !!finalCustomerInfo,
      originalOrderId: !!orderId,
      originalAmount: !!amount,
      originalCustomerInfo: !!customerInfo,
      isRetry: retry
    })
    
    if (!finalOrderId || !finalAmount || !finalCustomerInfo) {
        orderId: finalOrderId,
        amount: finalAmount,
        customerInfo: finalCustomerInfo
      })
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerInfo' },
        { status: 400 }
      )
    }

    // Check if credentials are configured
    if (!UNITED_PAYMENT_CONFIG.email || !UNITED_PAYMENT_CONFIG.password) {
      
      // Return mock payment URL for testing
      return NextResponse.json({
        success: true,
        paymentUrl: `/order-success?orderId=${orderId}&status=PAID&paymentId=mock_${Date.now()}`,
        paymentId: `mock_${Date.now()}`,
        orderId: orderId,
        amount: amount,
        currency: currency,
        isMock: true
      })
    }

    // Get valid authentication token
    const authToken = await getValidToken()
    
    if (!authToken) {
      console.error('Failed to get valid authentication token')
      console.error('Credentials check:', {
        email: UNITED_PAYMENT_CONFIG.email ? 'Present' : 'Missing',
        password: UNITED_PAYMENT_CONFIG.password ? 'Present' : 'Missing',
        isProduction: UNITED_PAYMENT_CONFIG.isProduction
      })
      
      return NextResponse.json(
        { 
          error: 'Authentication failed',
          message: 'Ödəniş sistemi ilə əlaqə qura bilmədi. Administratorla əlaqə saxlayın.',
          code: 'AUTH_FAILED',
          details: 'Environment variables may not be configured properly'
        },
        { status: 500 }
      )
    }
    

    // Determine cancel URL based on payment source
    let cancelUrl = UNITED_PAYMENT_CONFIG.cancelUrl
    if (source === 'orders') {
      cancelUrl = `${process.env.NEXTAUTH_URL || 'https://sahibparfum.az'}/orders`
    } else if (source === 'checkout') {
      cancelUrl = `${process.env.NEXTAUTH_URL || 'https://sahibparfum.az'}/checkout`
    } else if (source === 'checkout-guest') {
      cancelUrl = `${process.env.NEXTAUTH_URL || 'https://sahibparfum.az'}/checkout/guest`
    }

      source,
      cancelUrl,
      successUrl: UNITED_PAYMENT_CONFIG.successUrl,
      declineUrl: UNITED_PAYMENT_CONFIG.declineUrl
    })

    // Prepare payment data according to United Payment API format
    const paymentData: any = {
      orderId: finalOrderId, // United Payment API expects 'orderId' not 'clientOrderId'
      amount: finalAmount, // Keep amount in AZN (no conversion needed)
      language: "AZ", // Azerbaijani
      successUrl: `${UNITED_PAYMENT_CONFIG.successUrl}?orderId=${finalOrderId}&status=PAID&paymentId=${finalOrderId}`,
      cancelUrl: cancelUrl,
      declineUrl: UNITED_PAYMENT_CONFIG.declineUrl,
      description: description || `Sifariş #${finalOrderId}`,
      memberId: finalCustomerInfo.phone || finalCustomerInfo.email || 'Guest',
      additionalInformation: `Order: ${finalOrderId}`,
      email: finalCustomerInfo.email || '',
      phoneNumber: finalCustomerInfo.phone || '',
      clientName: finalCustomerInfo.name || 'Guest',
      currency: "944", // AZN currency code
      addcard: false // Don't save card by default
    }

    // Add partnerId if configured (required for production API)
    if (UNITED_PAYMENT_CONFIG.partnerId) {
      paymentData.partnerId = UNITED_PAYMENT_CONFIG.partnerId
    }

    // Log payment data structure for debugging
      hasOrderId: !!paymentData.orderId,
      hasAmount: !!paymentData.amount,
      hasLanguage: !!paymentData.language,
      hasSuccessUrl: !!paymentData.successUrl,
      hasCancelUrl: !!paymentData.cancelUrl,
      hasDeclineUrl: !!paymentData.declineUrl,
      hasDescription: !!paymentData.description,
      hasMemberId: !!paymentData.memberId,
      hasEmail: !!paymentData.email,
      hasPhoneNumber: !!paymentData.phoneNumber,
      hasClientName: !!paymentData.clientName,
      hasCurrency: !!paymentData.currency,
      hasAddcard: !!paymentData.addcard
    })


    const apiUrl = getApiUrl()

    // Make request to United Payment API
    const response = await fetch(`${apiUrl}/api/transactions/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': authToken,
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })

    const result = await response.json()
    
    // Debug response structure
      hasUrl: 'url' in result,
      hasPaymentUrl: 'paymentUrl' in result,
      hasRedirectUrl: 'redirectUrl' in result,
      hasCheckoutUrl: 'checkoutUrl' in result,
      hasFormUrl: 'formUrl' in result,
      hasPaymentLink: 'paymentLink' in result,
      resultKeys: Object.keys(result),
      resultUrl: result.url,
      resultPaymentUrl: result.paymentUrl,
      resultRedirectUrl: result.redirectUrl,
      resultCheckoutUrl: result.checkoutUrl,
      resultFormUrl: result.formUrl,
      resultPaymentLink: result.paymentLink
    })

    if (!response.ok) {
      console.error('United Payment API Error:', result)
      return NextResponse.json(
        { 
          error: 'Payment creation failed', 
          details: result.message || result.error || 'Unknown error',
          code: result.code || 'API_ERROR'
        },
        { status: response.status }
      )
    }

    // Return payment URL and details
    return NextResponse.json({
      success: true,
      paymentUrl: result.url,
      transactionId: result.transactionId,
      orderId: finalOrderId,
      amount: finalAmount,
      currency: currency,
      status: result.status,
      isMock: false, // Real payment
      // Additional details for debugging
      paymentDetails: {
        orderId: result.orderId || result.clientOrderId,
        transactionType: result.transactionType,
        description: paymentData.description,
        customerName: paymentData.clientName,
        customerEmail: paymentData.email,
        customerPhone: paymentData.phoneNumber
      }
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { 
        error: 'Payment creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'API_ERROR'
      },
      { status: 500 }
    )
  }
}

// Get payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')
    const orderId = searchParams.get('orderId')

    if (!transactionId && !orderId) {
      return NextResponse.json(
        { error: 'transactionId or orderId is required' },
        { status: 400 }
      )
    }

    // Get valid authentication token
    const authToken = await getValidToken()
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }

    const apiUrl = getApiUrl()
    
    // For now, we'll return a basic status check
    // United Payment might have a different status endpoint
    return NextResponse.json({
      success: true,
      message: 'Status check endpoint - implementation depends on United Payment API documentation',
      transactionId,
      orderId
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
