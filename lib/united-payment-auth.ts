// United Payment Authentication Configuration
const UNITED_PAYMENT_AUTH_CONFIG = {
  // Test environment
  testApiUrl: 'https://test-vpos.unitedpayment.az',
  productionApiUrl: 'https://vpos.unitedpayment.az',
  
  // Credentials (using email format)
  email: process.env.UNITED_PAYMENT_EMAIL,
  password: process.env.UNITED_PAYMENT_PASSWORD,
  partnerId: process.env.UNITED_PAYMENT_PARTNER_ID,
  
  // Environment - Use production environment with provided credentials
  isProduction: process.env.UNITED_PAYMENT_ENV === 'production'
}

// Get API URL based on environment
function getApiUrl(): string {
  return UNITED_PAYMENT_AUTH_CONFIG.isProduction 
    ? UNITED_PAYMENT_AUTH_CONFIG.productionApiUrl 
    : UNITED_PAYMENT_AUTH_CONFIG.testApiUrl
}

// Always get fresh token for each request
// United Payment API requires fresh token for each transaction
export async function getValidToken(): Promise<string | null> {
  try {
    console.log('Getting fresh authentication token...')
    
    // Check if credentials are configured
    if (!UNITED_PAYMENT_AUTH_CONFIG.email || !UNITED_PAYMENT_AUTH_CONFIG.password) {
      console.error('United Payment credentials not configured')
      return null
    }

    const loginData = {
      email: UNITED_PAYMENT_AUTH_CONFIG.email,
      password: UNITED_PAYMENT_AUTH_CONFIG.password
    }

    const apiUrl = getApiUrl()
    console.log('Making authentication request to:', `${apiUrl}/api/auth/`)
    
    const response = await fetch(`${apiUrl}/api/auth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(loginData)
    })

    console.log('Authentication response status:', response.status)

    if (response.ok) {
      const result = await response.json()
      console.log('Authentication successful, token received')
      
      if (result.token) {
        console.log('Token obtained successfully')
        return result.token
      } else {
        console.error('No token in response:', result)
        return null
      }
    } else {
      const errorText = await response.text()
      console.error('Authentication failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      return null
    }
  } catch (error) {
    console.error('Error getting fresh token:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}