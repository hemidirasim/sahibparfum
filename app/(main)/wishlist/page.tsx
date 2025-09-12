'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
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

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [removingFromFavorites, setRemovingFromFavorites] = useState<string | null>(null)
  const { addItem } = useCart()

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

  const addToCart = async (product: Product) => {
    try {
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images[0] || '/placeholder.jpg',
        quantity: 1,
        sku: product.id // Using product ID as SKU for now
      })
      toast.success('Məhsul səbətə əlavə edildi')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Səbətə əlavə edərkən xəta baş verdi')
    }
  }

  const handleMoveAllToCart = async () => {
    try {
      for (const favorite of favorites.filter(fav => fav.product.inStock)) {
        addItem({
          id: favorite.product.id,
          name: favorite.product.name,
          price: favorite.product.salePrice || favorite.product.price,
          image: favorite.product.images[0] || '/placeholder.jpg',
          quantity: 1
        })
      }
      toast.success('Bütün məhsullar səbətə əlavə edildi')
    } catch (error) {
      console.error('Error adding all to cart:', error)
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

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="mx-auto h-16 w-16" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Favoriləriniz boşdur
            </h1>
            <p className="text-gray-600 mb-8">
              Sevimli məhsullarınızı favorilərə əlavə edin və sonra burada görə bilərsiniz.
            </p>
            <Link
              href="/products"
              className="btn btn-primary"
            >
              Məhsullara Bax
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Favorilərim ({favorites.length})
          </h1>
          <p className="text-gray-600">
            Sevimli məhsullarınızı burada saxlayın və istədiyiniz zaman səbətə əlavə edin.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={handleMoveAllToCart}
              disabled={!favorites.some(fav => fav.product.inStock)}
              className="btn btn-primary"
            >
              Hamısını Səbətə At
            </button>
          </div>
          
          <Link
            href="/products"
            className="btn btn-outline"
          >
            Məhsullara Qayıt
          </Link>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div 
              key={favorite.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group"
            >
              <div className="relative">
                <Image
                  src={favorite.product.images[0] || '/placeholder.jpg'}
                  alt={favorite.product.name}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {favorite.product.isOnSale && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Endirim
                  </div>
                )}
                {favorite.product.isNew && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Yeni
                  </div>
                )}
                <button 
                  onClick={() => removeFromFavorites(favorite.product.id)}
                  disabled={removingFromFavorites === favorite.product.id}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-500">{favorite.product.brand?.name || 'Brend məlumatı yoxdur'}</p>
                  <Link 
                    href={`/products/${favorite.product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {favorite.product.name}
                  </Link>
                </div>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(favorite.product.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({favorite.product.reviewCount})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {favorite.product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-primary-600">
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
                  
                  <span className={`text-sm px-2 py-1 rounded ${
                    favorite.product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {favorite.product.inStock ? 'Stokda var' : 'Stokda yoxdur'}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(favorite.product)}
                  disabled={!favorite.product.inStock}
                  className={`w-full btn btn-sm flex items-center justify-center gap-2 ${
                    favorite.product.inStock ? 'btn-primary' : 'btn-disabled'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Səbətə At
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

