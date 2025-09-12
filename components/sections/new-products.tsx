'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

interface NewProduct {
  id: string
  name: string
  brand: {
    id: string
    name: string
    description?: string
    logo?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  price: number
  salePrice?: number
  images: string[]
  rating: number
  reviewCount: number
  sku: string
  createdAt: string
}

export function NewProducts() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<NewProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteStatus, setFavoriteStatus] = useState<{[key: string]: boolean}>({})
  const [updatingFavorites, setUpdatingFavorites] = useState<string | null>(null)
  const { data: session } = useSession()

  // Check favorite status for all products
  const checkFavoriteStatus = async (productIds: string[]) => {
    if (!session?.user?.id) return
    
    try {
      const promises = productIds.map(async (productId) => {
        const response = await fetch(`/api/favorites/check?productId=${productId}`)
        const data = await response.json()
        return { productId, isFavorite: data.isFavorite }
      })
      
      const results = await Promise.all(promises)
      const statusMap: {[key: string]: boolean} = {}
      results.forEach(({ productId, isFavorite }) => {
        statusMap[productId] = isFavorite
      })
      setFavoriteStatus(statusMap)
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  // Toggle favorite status
  const toggleFavorite = async (productId: string) => {
    if (!session?.user?.id) {
      toast.error('Favoritlərə əlavə etmək üçün giriş edin')
      return
    }

    setUpdatingFavorites(productId)
    try {
      const isCurrentlyFavorite = favoriteStatus[productId]
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?productId=${productId}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        
        if (data.success) {
          setFavoriteStatus(prev => ({ ...prev, [productId]: false }))
          toast.success('Məhsul favoritlərdən silindi')
        } else {
          toast.error(data.message || 'Favoritlərdən silərkən xəta baş verdi')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId })
        })
        const data = await response.json()
        
        if (data.success) {
          setFavoriteStatus(prev => ({ ...prev, [productId]: true }))
          toast.success('Məhsul favoritlərə əlavə edildi')
        } else {
          toast.error(data.message || 'Favoritlərə əlavə edərkən xəta baş verdi')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Favorit statusu dəyişdirərkən xəta baş verdi')
    } finally {
      setUpdatingFavorites(null)
    }
  }

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const response = await fetch('/api/products?new=true')
        const data = await response.json()
        
        if (data.products) {
          // Son 30 gün ərzində əlavə edilmiş məhsulları götür
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          
          const newProducts = data.products
            .filter((product: any) => {
              const productDate = new Date(product.createdAt)
              return productDate >= thirtyDaysAgo
            })
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8) // İlk 8 yeni məhsul
          
          setProducts(newProducts)
          
          // Check favorite status for all products
          if (session?.user?.id) {
            const productIds = newProducts.map((p: any) => p.id)
            checkFavoriteStatus(productIds)
          }
        }
      } catch (error) {
        console.error('Error fetching new products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNewProducts()
  }, [])

  const handleAddToCart = (product: NewProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] || '/images/placeholder.jpg',
      quantity: 1,
      sku: product.sku
    })
    toast.success(`${product.name} səbətə əlavə edildi`)
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Yeni Məhsullar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ən son əlavə edilmiş parfümləri kəşf edin
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Yeni Məhsullar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hal-hazırda yeni məhsul yoxdur
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Yeni Məhsullar
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ən son əlavə edilmiş parfümləri kəşf edin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
              <div className="relative h-64 w-full">
                {product.images && product.images.length > 0 ? (
                  <>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                        if (placeholder) {
                          placeholder.style.display = 'flex'
                        }
                      }}
                      onLoad={(e) => {
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                        if (placeholder) {
                          placeholder.style.display = 'none'
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" style={{ display: 'none' }}>
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-sm text-gray-500 font-medium">Şəkil yoxdur</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">Şəkil yoxdur</div>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Yeni
                </div>
                <button 
                  onClick={() => toggleFavorite(product.id)}
                  disabled={updatingFavorites === product.id}
                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favoriteStatus[product.id] 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-600'
                    }`} 
                  />
                </button>
              </div>

              <div className="p-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-500">{product.brand?.name || 'Brend məlumatı yoxdur'}</p>
                  <Link 
                    href={`/products/${product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                </div>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.reviewCount})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-primary-600">
                          {product.salePrice.toFixed(2)} ₼
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.price.toFixed(2)} ₼
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {product.price.toFixed(2)} ₼
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Səbətə At
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products?new=true"
            className="btn btn-primary btn-lg"
          >
            Bütün Yeni Məhsulları Gör
          </Link>
        </div>
      </div>
    </section>
  )
}
