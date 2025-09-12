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
  isProduction: process.env.UNITED_PAYMENT_ENV === 'production'
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

// Utility function to get valid token (used by other API routes)
export async function getValidToken(): Promise<string | null> {
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

// Export token cache for other uses
export { tokenCache }
