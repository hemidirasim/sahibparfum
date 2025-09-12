import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Giriş tələb olunur' }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        product: {
          include: {
            category: true,
            brand: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedFavorites = favorites.map(fav => ({
      id: fav.id,
      product: {
        id: fav.product.id,
        name: fav.product.name,
        description: fav.product.description,
        price: fav.product.price,
        salePrice: fav.product.salePrice,
        images: fav.product.images ? [fav.product.images] : [],
        inStock: fav.product.inStock,
        stockCount: fav.product.stockCount,
        sku: fav.product.sku,
        volume: fav.product.volume,
        isNew: fav.product.isNew,
        isOnSale: fav.product.isOnSale,
        isActive: fav.product.isActive,
        createdAt: fav.product.createdAt.toISOString(),
        updatedAt: fav.product.updatedAt.toISOString(),
        category: fav.product.category,
        brand: fav.product.brand,
        averageRating: 0,
        reviewCount: 0
      },
      createdAt: fav.createdAt.toISOString()
    }))

    return NextResponse.json({ success: true, favorites: formattedFavorites })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { success: false, message: 'Favorit məhsullar yüklənərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}

// POST - Add product to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Giriş tələb olunur' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Məhsul ID tələb olunur' }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ success: false, message: 'Məhsul tapılmadı' }, { status: 404 })
    }

    // Check if already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json({ success: false, message: 'Məhsul artıq favoritlərdədir' }, { status: 400 })
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        productId: productId
      },
      include: {
        product: {
          include: {
            category: true,
            brand: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Məhsul favoritlərə əlavə edildi',
      favorite: favorite
    })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json(
      { success: false, message: 'Favoritlərə əlavə edərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}

// DELETE - Remove product from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Giriş tələb olunur' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Məhsul ID tələb olunur' }, { status: 400 })
    }

    // Remove from favorites
    await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        productId: productId
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Məhsul favoritlərdən silindi'
    })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json(
      { success: false, message: 'Favoritlərdən silərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}
