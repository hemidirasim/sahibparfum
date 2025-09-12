// Debug script to check environment variables
console.log('=== Environment Variables Check ===')
console.log('UNITED_PAYMENT_EMAIL:', process.env.UNITED_PAYMENT_EMAIL ? 'Present' : 'Missing')
console.log('UNITED_PAYMENT_PASSWORD:', process.env.UNITED_PAYMENT_PASSWORD ? 'Present' : 'Missing')
console.log('UNITED_PAYMENT_ENV:', process.env.UNITED_PAYMENT_ENV || 'Not set')
console.log('UNITED_PAYMENT_PARTNER_ID:', process.env.UNITED_PAYMENT_PARTNER_ID ? 'Present' : 'Missing')
console.log('=====================================')

// Test authentication
async function testAuth() {
  try {
    const loginData = {
      email: process.env.UNITED_PAYMENT_EMAIL,
      password: process.env.UNITED_PAYMENT_PASSWORD
    }
    
    console.log('Testing authentication with:', {
      email: loginData.email,
      password: loginData.password ? 'Present' : 'Missing'
    })
    
    const response = await fetch('https://vpos.unitedpayment.az/api/auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(loginData)
    })
    
    console.log('Auth response status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('Auth successful, token received:', !!result.token)
    } else {
      const error = await response.text()
      console.log('Auth failed:', error)
    }
  } catch (error) {
    console.error('Auth test error:', error)
  }
}

testAuth()
