'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Heart, Grid, List } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface ProductGridProps {
  search?: string | null
  category?: string | null
  filter?: string | null
  brandFilter?: string | null
  brand?: string | null
  newProducts?: boolean
  sale?: boolean
  minPrice?: string | null
  maxPrice?: string | null
  volume?: string | null
  minRating?: string | null
  activeFilters?: {
    categories: string[]
    brands: string[]
    priceRanges: string[]
    volumes: string[]
    ratings: number[]
  }
}

export function ProductGrid({ 
  search, 
  category, 
  filter, 
  brandFilter, 
  brand, 
  newProducts, 
  sale, 
  minPrice,
  maxPrice,
  volume,
  minRating,
  activeFilters 
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteStatus, setFavoriteStatus] = useState<{[key: string]: boolean}>({})
  const [updatingFavorites, setUpdatingFavorites] = useState<string | null>(null)
  const { addItem } = useCart()
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

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        if (search) params.append('search', search)
        if (category) params.append('category', category)
        if (filter) params.append('filter', filter)
        if (brandFilter) params.append('brandFilter', brandFilter)
        if (brand) params.append('brand', brand)
        if (newProducts) params.append('newProducts', 'true')
        if (sale) params.append('sale', 'true')
        if (minPrice) params.append('minPrice', minPrice)
        if (maxPrice) params.append('maxPrice', maxPrice)
        if (volume) params.append('volume', volume)
        if (minRating) params.append('minRating', minRating)
        
        // Add filter parameters
        if (activeFilters?.categories && activeFilters.categories.length > 0) {
          activeFilters.categories.forEach(catId => params.append('categoryIds', catId))
        }
        if (activeFilters?.brands && activeFilters.brands.length > 0) {
          activeFilters.brands.forEach(brand => params.append('brands', brand))
        }
        if (activeFilters?.priceRanges && activeFilters.priceRanges.length > 0) {
          activeFilters.priceRanges.forEach(range => params.append('priceRanges', range))
        }
        if (activeFilters?.volumes && activeFilters.volumes.length > 0) {
          activeFilters.volumes.forEach(volume => params.append('volumes', volume))
        }
        if (activeFilters?.ratings && activeFilters.ratings.length > 0) {
          activeFilters.ratings.forEach(rating => params.append('ratings', rating.toString()))
        }
        
        const response = await fetch(`/api/products?${params.toString()}`)
        const data = await response.json()
        
        if (response.ok) {
          const fetchedProducts = data.products || []
          setProducts(fetchedProducts)
          
          // Check favorite status for all products
          if (session?.user?.id) {
            const productIds = fetchedProducts.map((p: any) => p.id)
            checkFavoriteStatus(productIds)
          }
        } else {
          console.error('Error fetching products:', data.error)
          toast.error('Məhsullar yüklənərkən xəta baş verdi')
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        toast.error('Məhsullar yüklənərkən xəta baş verdi')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [search, category, filter, brandFilter, brand, newProducts, sale, minPrice, maxPrice, volume, minRating, activeFilters])


  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images?.[0] || product.image || '/placeholder.jpg',
      quantity: 1,
      sku: product.sku || product.id
    })
    toast.success('Məhsul səbətə əlavə edildi')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {products.length} məhsul tapıldı
          {(search || category || filter || brandFilter || brand || newProducts || sale) && (
            <span className="text-primary-600 ml-2">
              (filtrlənmiş)
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* No Results */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Heç bir məhsul tapılmadı
          </h3>
          <p className="text-gray-600 mb-4">
            Axtarış kriteriyalarınızı dəyişdirin və ya bütün məhsulları görün.
          </p>
          <Link
            href="/products"
            className="btn btn-primary"
          >
            Bütün Məhsulları Gör
          </Link>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0 h-48' : 'h-64 w-full'}`}>
                {product.images && product.images.length > 0 ? (
                  <>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={400}
                      height={400}
                      className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        viewMode === 'list' ? 'h-48 w-full' : 'w-full h-64'
                      }`}
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
                    <div 
                      className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${
                        viewMode === 'list' ? 'h-48 w-full' : 'w-full h-64'
                      }`}
                      style={{ display: 'none' }}
                    >
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
                  <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${
                    viewMode === 'list' ? 'h-48 w-full' : 'w-full h-64'
                  }`}>
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
                {product.onSale && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Endirim
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Yeni
                  </div>
                )}
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

              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-1">{product.brand?.name || 'Brend məlumatı yoxdur'}</p>
                  <Link 
                    href={`/products/${product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors block mb-2"
                  >
                    {product.name}
                  </Link>
                  <Link 
                    href={`/categories/${product.category?.name?.toLowerCase()
                      .replace(/ç/g, 'c')
                      .replace(/ğ/g, 'g')
                      .replace(/ı/g, 'i')
                      .replace(/ö/g, 'o')
                      .replace(/ş/g, 's')
                      .replace(/ü/g, 'u')
                      .replace(/\s+/g, '-')}-${product.category?.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors block"
                  >
                    {product.category?.name}
                  </Link>
                </div>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.averageRating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.reviewCount || 0})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {product.onSale && product.salePrice ? (
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
      )}
    </div>
  )
}
