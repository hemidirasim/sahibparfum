import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Payment test API is working',
    timestamp: new Date().toISOString(),
    env: {
      hasAuthToken: !!process.env.UNITED_PAYMENT_AUTH_TOKEN,
      nodeEnv: process.env.NODE_ENV
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Test API called')
    
    const body = await request.json()
    console.log('Test request body:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Test POST API is working',
      receivedData: body,
      timestamp: new Date().toISOString(),
      env: {
        hasAuthToken: !!process.env.UNITED_PAYMENT_AUTH_TOKEN,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
