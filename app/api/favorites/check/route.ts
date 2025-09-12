import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Check if product is in user's favorites
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, isFavorite: false })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Məhsul ID tələb olunur' }, { status: 400 })
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      isFavorite: !!favorite 
    })
  } catch (error) {
    console.error('Error checking favorite status:', error)
    return NextResponse.json(
      { success: false, message: 'Favorit statusu yoxlanarkən xəta baş verdi' },
      { status: 500 }
    )
  }
}
