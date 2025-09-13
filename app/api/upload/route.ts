import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD API REQUEST START ===')
    
    // Environment variables check
    console.log('Environment variables check:', {
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobTokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length,
      blobTokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20) + '...',
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: !!process.env.DATABASE_URL,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET
    })
    
    // Domain validation
    const allowedDomains = [
      'sahibparfum.az',
      'localhost:3000',
      'vercel.app'
    ]
    
    const referer = request.headers.get('referer')
    const origin = request.headers.get('origin')
    
    console.log('Domain check:', {
      referer,
      origin,
      allowedDomains
    })
    
    const isValidDomain = allowedDomains.some(domain => 
      referer?.includes(domain) || origin?.includes(domain)
    )
    
    if (!isValidDomain && process.env.NODE_ENV === 'production') {
      console.log('Unauthorized domain access')
      return NextResponse.json({ error: 'Unauthorized domain' }, { status: 403 })
    }
    
    // Admin authentication check
    console.log('Starting session check...')
    const session = await getServerSession(authOptions)
    console.log('Session check result:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'ADMIN',
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : []
    })
    
    if (!session?.user?.email || session.user?.role !== 'ADMIN') {
      console.log('Unauthorized access attempt - redirecting to login')
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Admin authentication required',
        session: {
          hasSession: !!session,
          userEmail: session?.user?.email,
          userRole: session?.user?.role
        }
      }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    console.log('File received:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    })

    if (!file) {
      console.log('No file in request')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `products/${timestamp}-${randomString}.${fileExtension}`

    console.log('Uploading to Vercel Blob:', {
      filename,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobTokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10) + '...'
    })

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    })

    console.log('Upload successful:', {
      blobUrl: blob.url,
      filename: blob.pathname
    })

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      filename: filename
    })

  } catch (error) {
    console.error('=== UPLOAD ERROR START ===')
    console.error('Upload error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    // Environment check
    console.error('Environment check:', {
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobTokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length,
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL
    })
    
    // Check if it's a Vercel Blob error
    if (error instanceof Error) {
      if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
        console.error('BLOB_READ_WRITE_TOKEN error detected')
        return NextResponse.json({ 
          error: 'Blob token configuration error',
          details: 'BLOB_READ_WRITE_TOKEN is missing or invalid'
        }, { status: 500 })
      }
      
      if (error.message.includes('Unauthorized')) {
        console.error('Unauthorized error detected')
        return NextResponse.json({ 
          error: 'Unauthorized access',
          details: 'Admin authentication required'
        }, { status: 401 })
      }
    }
    
    console.error('=== UPLOAD ERROR END ===')
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

