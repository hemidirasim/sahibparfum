import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      UNITED_PAYMENT_EMAIL: process.env.UNITED_PAYMENT_EMAIL ? 'Present' : 'Missing',
      UNITED_PAYMENT_PASSWORD: process.env.UNITED_PAYMENT_PASSWORD ? 'Present' : 'Missing',
      UNITED_PAYMENT_ENV: process.env.UNITED_PAYMENT_ENV || 'Not set',
      UNITED_PAYMENT_PARTNER_ID: process.env.UNITED_PAYMENT_PARTNER_ID ? 'Present' : 'Missing',
      DATABASE_URL: process.env.DATABASE_URL ? 'Present' : 'Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set'
    }

    // Test authentication
    let authTest: any = null
    try {
      const loginData = {
        email: process.env.UNITED_PAYMENT_EMAIL,
        password: process.env.UNITED_PAYMENT_PASSWORD
      }
      
      const response = await fetch('https://vpos.unitedpayment.az/api/auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData)
      })
      
      authTest = {
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      }
      
      if (response.ok) {
        const result = await response.json()
        authTest.tokenReceived = !!result.token
        authTest.tokenPreview = result.token ? result.token.substring(0, 20) + '...' : null
      } else {
        const errorText = await response.text()
        authTest.error = errorText
      }
    } catch (error) {
      authTest = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      environment: envCheck,
      authentication: authTest,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
