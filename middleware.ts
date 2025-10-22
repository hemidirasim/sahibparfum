import { NextRequest, NextResponse } from 'next/server'

// Blocked IPs list (add suspicious IPs here)
const BLOCKED_IPS = new Set<string>([
  // Add suspicious IPs here
  // '192.168.1.100',
  // '10.0.0.50'
])

// Suspicious patterns to detect
const SUSPICIOUS_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /php/i,
  /java/i,
  /node/i,
  /postman/i,
  /insomnia/i,
  /httpie/i
]

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function
function checkRateLimit(ip: string, endpoint: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 20 // Max 20 requests per 15 minutes per IP
  
  const key = `${ip}-${endpoint}`
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

// Check if request is suspicious
function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const origin = request.headers.get('origin') || ''
  
  // Check for suspicious user agents
  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(userAgent))) {
    return true
  }
  
  // Check for missing or suspicious referer
  if (!referer && !origin && request.method === 'POST') {
    return true
  }
  
  // Check for suspicious referer patterns
  if (referer && !referer.includes('localhost') && !referer.includes('sahibparfum.az')) {
    return true
  }
  
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
  
  // Log all requests to payment endpoints
  if (pathname.startsWith('/api/payment/')) {
      path: pathname,
      method: request.method,
      ip: clientIP,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      timestamp: new Date().toISOString()
    })
  }
  
  // Block specific IPs
  if (BLOCKED_IPS.has(clientIP)) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }
  
  // Check for suspicious requests
  if (isSuspiciousRequest(request)) {
      ip: clientIP,
      path: pathname,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    })
    return NextResponse.json(
      { error: 'Suspicious activity detected' },
      { status: 403 }
    )
  }
  
  // Rate limiting for payment endpoints
  if (pathname.startsWith('/api/payment/')) {
    if (!checkRateLimit(clientIP, pathname)) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/payment/:path*',
    '/api/orders/:path*',
    '/api/admin/:path*'
  ]
}
