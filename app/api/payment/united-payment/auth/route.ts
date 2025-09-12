import { NextRequest, NextResponse } from 'next/server'
import { getValidToken } from '@/lib/united-payment-auth'

// United Payment Authentication Configuration
const UNITED_PAYMENT_AUTH_CONFIG = {
  // Test environment
  testApiUrl: 'https://test-vpos.unitedpayment.az',
  productionApiUrl: 'https://vpos.unitedpayment.az',
  
  // Credentials (using email format)
  email: process.env.UNITED_PAYMENT_EMAIL,
  password: process.env.UNITED_PAYMENT_PASSWORD,
  partnerId: process.env.UNITED_PAYMENT_PARTNER_ID,
  
  // Environment
  isProduction: process.env.NODE_ENV === 'production' && process.env.UNITED_PAYMENT_ENV === 'production'
}

// In-memory token storage (in production, use Redis or database)
let tokenCache: {
  token: string | null
  expiresAt: number
  refreshToken: string | null
} = {
  token: null,
  expiresAt: 0,
  refreshToken: null
}

// Get API URL based on environment
function getApiUrl(): string {
  return UNITED_PAYMENT_AUTH_CONFIG.isProduction 
    ? UNITED_PAYMENT_AUTH_CONFIG.productionApiUrl 
    : UNITED_PAYMENT_AUTH_CONFIG.testApiUrl
}

// Login to get authentication token
export async function POST(request: NextRequest) {
  try {
    // Check if we have valid cached token
    if (tokenCache.token && tokenCache.expiresAt > Date.now()) {
      return NextResponse.json({
        success: true,
        token: tokenCache.token,
        expiresAt: tokenCache.expiresAt,
        fromCache: true
      })
    }

    // Validate credentials
    if (!UNITED_PAYMENT_AUTH_CONFIG.email || !UNITED_PAYMENT_AUTH_CONFIG.password) {
      return NextResponse.json(
        { 
          error: 'United Payment credentials not configured',
          message: 'Email and password are required'
        },
        { status: 500 }
      )
    }

    const apiUrl = getApiUrl()
    
    // Prepare login data (United Payment uses email/password format)
    const loginData = {
      email: UNITED_PAYMENT_AUTH_CONFIG.email,
      password: UNITED_PAYMENT_AUTH_CONFIG.password
    }

    console.log('Attempting login to:', `${apiUrl}/api/auth/`)
    console.log('Login data:', { ...loginData, password: '***' })

    // Make login request
    const response = await fetch(`${apiUrl}/api/auth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(loginData)
    })

    const result = await response.json()
    console.log('Login response:', result)

    if (!response.ok) {
      console.error('United Payment login error:', result)
      return NextResponse.json(
        { 
          error: 'Login failed', 
          details: result.message || result.error || 'Unknown error'
        },
        { status: response.status }
      )
    }

    // Extract token and expiration time
    const { token, expiresIn, refreshToken } = result
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token received from login response' },
        { status: 500 }
      )
    }

    // Cache token (expires in 1 hour by default, or use expiresIn from response)
    const expiresInSeconds = expiresIn || 3600 // Default 1 hour
    const expiresAt = Date.now() + (expiresInSeconds * 1000)

    tokenCache = {
      token,
      expiresAt,
      refreshToken: refreshToken || null
    }

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
      expiresIn: expiresInSeconds,
      fromCache: false
    })

  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Refresh token
export async function PUT(request: NextRequest) {
  try {
    // Check if we have a refresh token
    if (!tokenCache.refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 400 }
      )
    }

    const apiUrl = getApiUrl()
    
    // Prepare refresh data
    const refreshData = {
      refreshToken: tokenCache.refreshToken
    }

    console.log('Attempting token refresh')

    // Make refresh request
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(refreshData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Token refresh error:', result)
      // Clear invalid tokens
      tokenCache = { token: null, expiresAt: 0, refreshToken: null }
      
      return NextResponse.json(
        { 
          error: 'Token refresh failed', 
          details: result.message || result.error || 'Unknown error'
        },
        { status: response.status }
      )
    }

    // Update token cache
    const { token, expiresIn, refreshToken } = result
    const expiresInSeconds = expiresIn || 3600
    const expiresAt = Date.now() + (expiresInSeconds * 1000)

    tokenCache = {
      token,
      expiresAt,
      refreshToken: refreshToken || tokenCache.refreshToken
    }

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
      expiresIn: expiresInSeconds
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Get current token status
export async function GET() {
  try {
    const isValid = tokenCache.token && tokenCache.expiresAt > Date.now()
    
    return NextResponse.json({
      success: true,
      hasToken: !!tokenCache.token,
      isValid,
      expiresAt: tokenCache.expiresAt,
      expiresIn: Math.max(0, Math.floor((tokenCache.expiresAt - Date.now()) / 1000))
    })
  } catch (error) {
    console.error('Token status error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Utility function to get valid token (used by other API routes)
async function getValidToken(): Promise<string | null> {
  try {
    // Check if current token is valid
    if (tokenCache.token && tokenCache.expiresAt > Date.now()) {
      return tokenCache.token
    }

    // Try to refresh token
    if (tokenCache.refreshToken) {
      const apiUrl = getApiUrl()
      const refreshData = {
        refreshToken: tokenCache.refreshToken
      }

      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(refreshData)
      })

      if (response.ok) {
        const result = await response.json()
        const { token, expiresIn, refreshToken } = result
        const expiresInSeconds = expiresIn || 3600
        const expiresAt = Date.now() + (expiresInSeconds * 1000)

        tokenCache = {
          token,
          expiresAt,
          refreshToken: refreshToken || tokenCache.refreshToken
        }

        return token
      }
    }

    // If refresh fails, try to login again
    const loginData = {
      email: UNITED_PAYMENT_AUTH_CONFIG.email,
      password: UNITED_PAYMENT_AUTH_CONFIG.password
    }

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/api/auth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(loginData)
    })

    if (response.ok) {
      const result = await response.json()
      const { token, expiresIn, refreshToken } = result
      const expiresInSeconds = expiresIn || 3600
      const expiresAt = Date.now() + (expiresInSeconds * 1000)

      tokenCache = {
        token,
        expiresAt,
        refreshToken: refreshToken || null
      }

      return token
    }

    return null
  } catch (error) {
    console.error('Error getting valid token:', error)
    return null
  }
}
