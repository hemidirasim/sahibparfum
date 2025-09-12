'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  images: string[]
  inStock: boolean
  stockCount: number
  sku: string
  volume?: string
  isNew: boolean
  isOnSale: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    slug: string
  }
  brand?: {
    id: string
    name: string
  }
  averageRating: number
  reviewCount: number
}

interface Favorite {
  id: string
  product: Product
  createdAt: string
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [removingFromFavorites, setRemovingFromFavorites] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchFavorites()
  }, [session, status, router])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      const data = await response.json()
      
      if (data.success) {
        setFavorites(data.favorites)
      } else {
        toast.error(data.message || 'Favorit məhsullar yüklənərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast.error('Favorit məhsullar yüklənərkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  const removeFromFavorites = async (productId: string) => {
    setRemovingFromFavorites(productId)
    try {
      const response = await fetch(`/api/favorites?productId=${productId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        setFavorites(prev => prev.filter(fav => fav.product.id !== productId))
        toast.success('Məhsul favoritlərdən silindi')
      } else {
        toast.error(data.message || 'Favoritlərdən silərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
      toast.error('Favoritlərdən silərkən xəta baş verdi')
    } finally {
      setRemovingFromFavorites(null)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Məhsul səbətə əlavə edildi')
      } else {
        toast.error(data.message || 'Səbətə əlavə edərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Səbətə əlavə edərkən xəta baş verdi')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Favorit Məhsullarım</h1>
          <p className="mt-2 text-gray-600">
            Sevdiyiniz məhsulları burada görə bilərsiniz
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Hələ favorit məhsulunuz yoxdur
            </h3>
            <p className="text-gray-600 mb-6">
              Məhsulları sevdiyiniz zaman burada görünəcək
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Məhsullara bax
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative">
                  <Link href={`/products/${favorite.product.id}`}>
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
                      <img
                        src={favorite.product.images[0] || '/placeholder.jpg'}
                        alt={favorite.product.name}
                        className="h-64 w-full object-cover object-center hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </Link>
                  
                  {/* Labels */}
                  <div className="absolute top-2 left-2">
                    {favorite.product.isNew && (
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                        Yeni
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    {favorite.product.isOnSale && (
                      <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                        Endirim
                      </span>
                    )}
                  </div>

                  {/* Heart Icon */}
                  <button
                    onClick={() => removeFromFavorites(favorite.product.id)}
                    disabled={removingFromFavorites === favorite.product.id}
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        removingFromFavorites === favorite.product.id 
                          ? 'text-gray-400' 
                          : 'text-red-500 fill-current'
                      }`} 
                    />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <Link 
                      href={`/products/${favorite.product.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors duration-200"
                    >
                      {favorite.product.name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      {favorite.product.brand?.name || 'Brend məlumatı yoxdur'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= favorite.product.averageRating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({favorite.product.reviewCount})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {favorite.product.salePrice ? (
                        <>
                          <span className="text-lg font-bold text-red-600">
                            ₼{favorite.product.salePrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₼{favorite.product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          ₼{favorite.product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {favorite.product.volume && (
                      <span className="text-sm text-gray-500">
                        {favorite.product.volume}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(favorite.product.id)}
                    disabled={!favorite.product.inStock}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Səbətə At
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
