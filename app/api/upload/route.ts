import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    
    // Environment variables check
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
    
      referer,
      origin,
      allowedDomains
    })
    
    const isValidDomain = allowedDomains.some(domain => 
      referer?.includes(domain) || origin?.includes(domain)
    )
    
    if (!isValidDomain && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized domain' }, { status: 403 })
    }
    
    // Admin authentication check
    const session = await getServerSession(authOptions)
      hasSession: !!session,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'ADMIN',
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : []
    })
    
    if (!session?.user?.email || session.user?.role !== 'ADMIN') {
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

      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    })

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 10MB for ID cards)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size must be less than 10MB',
        details: `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Max allowed: 10MB`
      }, { status: 413 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `products/${timestamp}-${randomString}.${fileExtension}`

    // Check if we're in development or production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      // Use local file system for development
      
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadsDir, { recursive: true })
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Write file to local filesystem
      const filePath = join(uploadsDir, filename)
      await writeFile(filePath, buffer)
      
      // Return local URL
      const localUrl = `/uploads/${filename}`
      
        localUrl,
        filename,
        filePath
      })
      
      return NextResponse.json({ 
        success: true, 
        url: localUrl,
        filename: filename
      })
    } else {
      // Use Vercel Blob for production
        filename,
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
        blobTokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10) + '...'
      })

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
      })

        blobUrl: blob.url,
        filename: blob.pathname
      })

      return NextResponse.json({ 
        success: true, 
        url: blob.url,
        filename: filename
      })
    }

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

