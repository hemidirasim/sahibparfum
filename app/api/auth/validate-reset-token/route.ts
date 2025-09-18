import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token tələb olunur' }, { status: 400 })
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token hasn't expired
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Etibarsız və ya müddəti bitmiş token' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Token etibarlıdır',
      email: user.email 
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
