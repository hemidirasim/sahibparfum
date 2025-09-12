import { NextRequest, NextResponse } from 'next/server'
import { getValidToken } from '@/lib/united-payment-auth'

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

// Create payment session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, currency = 'AZN', description, customerInfo } = body

    // Log request details for debugging
    console.log('Payment request received:', {
      orderId,
      amount,
      currency,
      hasCredentials: !!(UNITED_PAYMENT_CONFIG.email && UNITED_PAYMENT_CONFIG.password),
      isProduction: UNITED_PAYMENT_CONFIG.isProduction,
      apiUrl: getApiUrl()
    })

    // Validate required fields
    if (!orderId || !amount || !customerInfo) {
      console.log('Validation failed - missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerInfo' },
        { status: 400 }
      )
    }

    // Check if credentials are configured
    if (!UNITED_PAYMENT_CONFIG.email || !UNITED_PAYMENT_CONFIG.password) {
      console.log('United Payment credentials not configured, using mock mode')
      
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
    console.log('Attempting to get authentication token...')
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
    
    console.log('Authentication token obtained successfully')

    // Prepare payment data according to United Payment API format
    const paymentData: any = {
      clientOrderId: orderId,
      amount: amount, // Keep amount in AZN (no conversion needed)
      language: "AZ", // Azerbaijani
      successUrl: UNITED_PAYMENT_CONFIG.successUrl,
      cancelUrl: UNITED_PAYMENT_CONFIG.cancelUrl,
      declineUrl: UNITED_PAYMENT_CONFIG.declineUrl,
      description: description || `Sifariş #${orderId}`,
      memberId: customerInfo.phone || customerInfo.email || 'Guest',
      additionalInformation: `Order: ${orderId}`,
      email: customerInfo.email || '',
      phoneNumber: customerInfo.phone || '',
      clientName: customerInfo.name || 'Guest',
      currency: "944", // AZN currency code
      addcard: false // Don't save card by default
    }

    // Log payment data structure for debugging
    console.log('Payment data structure:', {
      hasClientOrderId: !!paymentData.clientOrderId,
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

    // Add partnerId only if it's configured and not a placeholder
    if (UNITED_PAYMENT_CONFIG.partnerId && UNITED_PAYMENT_CONFIG.partnerId !== 'your_partner_id') {
      paymentData.partnerId = UNITED_PAYMENT_CONFIG.partnerId
    }

    const apiUrl = getApiUrl()
    console.log('Making request to:', `${apiUrl}/api/transactions/checkout`)
    console.log('Payment data:', paymentData)
    console.log('Auth token:', authToken ? 'Present' : 'Missing')
    console.log('Partner ID configured:', UNITED_PAYMENT_CONFIG.partnerId ? 'Yes' : 'No')
    console.log('Partner ID value:', UNITED_PAYMENT_CONFIG.partnerId)

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
    console.log('United Payment API Response:', result)
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

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
      orderId: orderId,
      amount: amount,
      currency: currency,
      status: result.status,
      isMock: false, // Real payment
      // Additional details for debugging
      paymentDetails: {
        clientOrderId: result.clientOrderId,
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
