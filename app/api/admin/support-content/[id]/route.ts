import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch specific support content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supportContent = await prisma.supportContent.findUnique({
      where: { id: params.id }
    })

    if (!supportContent) {
      return NextResponse.json({ error: 'Support content not found' }, { status: 404 })
    }

    return NextResponse.json(supportContent)
  } catch (error) {
    console.error('Error fetching support content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update support content
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const supportContent = await prisma.supportContent.update({
      where: { id: params.id },
      data: {
        title,
        content,
        page,
        order: order || 0
      }
    })

    return NextResponse.json(supportContent)
  } catch (error) {
    console.error('Error updating support content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete support content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.supportContent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Support content deleted successfully' })
  } catch (error) {
    console.error('Error deleting support content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
