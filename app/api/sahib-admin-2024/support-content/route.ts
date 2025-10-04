import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all support content
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supportContent = await prisma.supportContent.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(supportContent)
  } catch (error) {
    console.error('Error fetching support content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new support content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, page, order } = body

    if (!title || !content || !page) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supportContent = await prisma.supportContent.create({
      data: {
        title,
        content,
        page,
        order: order || 0
      }
    })

    return NextResponse.json(supportContent)
  } catch (error) {
    console.error('Error creating support content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
