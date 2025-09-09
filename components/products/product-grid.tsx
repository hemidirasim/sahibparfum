'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Heart, Grid, List } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import toast from 'react-hot-toast'

interface ProductGridProps {
  searchQuery?: string | null
  categoryFilter?: string | null
  alphabetFilter?: string | null
  newProducts?: string | null
  sale?: string | null
  filters?: {
    categories: string[]
    brands: string[]
    priceRanges: string[]
    volumes: string[]
    ratings: number[]
  }
}

export function ProductGrid({ 
  searchQuery, 
  categoryFilter, 
  alphabetFilter, 
  newProducts, 
  sale,
  filters 
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        if (searchQuery) params.append('search', searchQuery)
        if (categoryFilter) params.append('category', categoryFilter)
        if (alphabetFilter) params.append('filter', alphabetFilter)
        if (newProducts === 'true') params.append('newProducts', 'true')
        if (sale === 'true') params.append('sale', 'true')
        
        const response = await fetch(`/api/products?${params.toString()}`)
        const data = await response.json()
        
        if (response.ok) {
          const fetchedProducts = data.products || []
          setProducts(fetchedProducts)
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
  }, [searchQuery, categoryFilter, alphabetFilter, newProducts, sale])

  // Apply filters when they change
  useEffect(() => {
    if (filters) {
      setProducts(prevProducts => {
        let filteredProducts = [...prevProducts]
        
        // Apply category filter
        if (filters.categories.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) => 
            filters.categories.includes(product.category?.id)
          )
        }
        
        // Apply brand filter
        if (filters.brands.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) => 
            filters.brands.includes(product.brand)
          )
        }
        
        // Apply price range filter
        if (filters.priceRanges.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) => {
            const price = product.salePrice || product.price
            return filters.priceRanges.some(range => {
              const [min, max] = range.split('-').map(Number)
              if (max === null) return price >= min
              return price >= min && price <= max
            })
          })
        }
        
        // Apply volume filter
        if (filters.volumes.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) => 
            filters.volumes.includes(product.volume)
          )
        }
        
        // Apply rating filter
        if (filters.ratings.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) => 
            filters.ratings.some(rating => product.averageRating >= rating)
          )
        }
        
        return filteredProducts
      })
    }
  }, [filters])

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
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
          {(searchQuery || categoryFilter || alphabetFilter || newProducts || sale) && (
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
              <div className={`relative bg-gray-100 ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={400}
                    height={400}
                    className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                      viewMode === 'list' ? 'h-48 w-full' : 'w-full h-64'
                    }`}
                  />
                ) : (
                  <div className={`flex items-center justify-center ${
                    viewMode === 'list' ? 'h-48 w-full' : 'w-full h-64'
                  }`}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xl text-gray-400">📷</span>
                      </div>
                      <p className="text-xs text-gray-500">Şəkil yoxdur</p>
                    </div>
                  </div>
                )}
                {product.onSale && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Endirim
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Yeni
                  </div>
                )}
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="mb-2">
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <Link 
                    href={`/products/${product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
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
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
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
                  Səbətə Əlavə Et
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
