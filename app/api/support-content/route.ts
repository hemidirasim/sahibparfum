import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch support content by page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')

    if (!page) {
      return NextResponse.json({ error: 'Page parameter is required' }, { status: 400 })
    }

    const supportContent = await prisma.supportContent.findMany({
      where: { page },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(supportContent)
  } catch (error) {
    console.error('Error fetching support content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
