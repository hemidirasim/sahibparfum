import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD API REQUEST START ===')
    
    // Admin authentication check
    const session = await getServerSession(authOptions)
    console.log('Session check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'ADMIN'
    })
    
    if (!session?.user?.email || session.user?.role !== 'ADMIN') {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    console.error('Upload error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

