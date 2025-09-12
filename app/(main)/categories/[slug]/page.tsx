'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Heart, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useSession } from 'next-auth/react'
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
  brand?: {
    id: string
    name: string
  }
  volume?: string
  category: {
    id: string
    name: string
    description?: string
  }
  averageRating: number
  reviewCount: number
  isNew: boolean
  onSale: boolean
  createdAt?: string
}

interface Category {
  id: string
  name: string
  description?: string
  image?: string
}

interface FilterData {
  brands: { name: string; count: number }[]
  priceRanges: { min: number; max: number | null; count: number }[]
  volumes: { volume: string; count: number }[]
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterData, setFilterData] = useState<FilterData>({
    brands: [],
    priceRanges: [],
    volumes: []
  })
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [] as string[],
    priceRanges: [] as string[],
    volumes: [] as string[],
    ratings: [] as number[],
    sortBy: 'name'
  })
  const [expandedSections, setExpandedSections] = useState({
    brands: true,
    price: true,
    volume: true,
    rating: true,
    sort: true
  })
  const { addItem } = useCart()
  const { data: session } = useSession()
  const [favoriteStatus, setFavoriteStatus] = useState<{[key: string]: boolean}>({})
  const [updatingFavorites, setUpdatingFavorites] = useState<string | null>(null)

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
    const fetchCategoryData = async () => {
      try {
        setLoading(true)
        
        // Fetch category info
        const categoryResponse = await fetch('/api/categories')
        const categories = await categoryResponse.json()
        
        // Try to find by ID first (if slug contains ID)
        let foundCategory = categories.find((cat: Category) => slug.includes(cat.id))
        
        // If not found by ID, try by slug
        if (!foundCategory) {
          foundCategory = categories.find((cat: Category) => {
            const categorySlug = cat.name.toLowerCase()
              .replace(/ç/g, 'c')
              .replace(/ğ/g, 'g')
              .replace(/ı/g, 'i')
              .replace(/ö/g, 'o')
              .replace(/ş/g, 's')
              .replace(/ü/g, 'u')
              .replace(/\s+/g, '-')
            
            return categorySlug === slug
          })
        }
        
        if (foundCategory) {
          setCategory(foundCategory)
          
          // Fetch products for this category
          const productsResponse = await fetch(`/api/products?category=${encodeURIComponent(foundCategory.name)}`)
          const data = await productsResponse.json()
          const categoryProducts = data.products || []
          setProducts(categoryProducts)
          setFilteredProducts(categoryProducts)
          
          // Check favorite status for all products
          if (session?.user?.id) {
            const productIds = categoryProducts.map((p: any) => p.id)
            checkFavoriteStatus(productIds)
          }
          
          // Generate filter data from products
          generateFilterData(categoryProducts)
        } else {
          setProducts([])
          setFilteredProducts([])
        }
      } catch (error) {
        console.error('Error fetching category data:', error)
        toast.error('Kateqoriya məlumatları yüklənərkən xəta baş verdi')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCategoryData()
    }
  }, [slug])

  const generateFilterData = (products: Product[]) => {
    // Generate brands
    const brandCounts: { [key: string]: number } = {}
    const priceCounts: { [key: string]: number } = {}
    const volumeCounts: { [key: string]: number } = {}

    products.forEach(product => {
      // Count brands
      if (product.brand?.name) {
        brandCounts[product.brand.name] = (brandCounts[product.brand.name] || 0) + 1
      }
      
      // Count volumes
      if (product.volume) {
        volumeCounts[product.volume] = (volumeCounts[product.volume] || 0) + 1
      }
      
      // Count price ranges
      const price = product.salePrice || product.price
      if (price <= 50) priceCounts['0-50'] = (priceCounts['0-50'] || 0) + 1
      else if (price <= 100) priceCounts['50-100'] = (priceCounts['50-100'] || 0) + 1
      else if (price <= 200) priceCounts['100-200'] = (priceCounts['100-200'] || 0) + 1
      else if (price <= 500) priceCounts['200-500'] = (priceCounts['200-500'] || 0) + 1
      else priceCounts['500+'] = (priceCounts['500+'] || 0) + 1
    })

    setFilterData({
      brands: Object.entries(brandCounts).map(([name, count]) => ({ name, count })),
      priceRanges: [
        { min: 0, max: 50, count: priceCounts['0-50'] || 0 },
        { min: 50, max: 100, count: priceCounts['50-100'] || 0 },
        { min: 100, max: 200, count: priceCounts['100-200'] || 0 },
        { min: 200, max: 500, count: priceCounts['200-500'] || 0 },
        { min: 500, max: null, count: priceCounts['500+'] || 0 }
      ],
      volumes: Object.entries(volumeCounts).map(([volume, count]) => ({ volume, count }))
    })
  }

  useEffect(() => {
    let filtered = [...products]

    // Apply brand filter
    if (selectedFilters.brands.length > 0) {
      filtered = filtered.filter(product => 
        selectedFilters.brands.includes(product.brand?.name || '')
      )
    }

    // Apply price range filter
    if (selectedFilters.priceRanges.length > 0) {
      filtered = filtered.filter(product => {
        const price = product.salePrice || product.price
        return selectedFilters.priceRanges.some(range => {
          const [min, max] = range.split('-').map(Number)
          if (max === null) return price >= min
          return price >= min && price <= max
        })
      })
    }

    // Apply volume filter
    if (selectedFilters.volumes.length > 0) {
      filtered = filtered.filter(product => 
        product.volume && selectedFilters.volumes.includes(product.volume)
      )
    }

    // Apply rating filter
    if (selectedFilters.ratings.length > 0) {
      filtered = filtered.filter(product => 
        selectedFilters.ratings.some(rating => product.averageRating >= rating)
      )
    }

    // Apply sorting
    switch (selectedFilters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-low':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
        break
      case 'price-high':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
        break
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedFilters])

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0] || '/placeholder-product.jpg',
      quantity: 1,
      sku: product.sku
    })
    toast.success('Məhsul səbətə əlavə edildi')
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleBrandChange = (brand: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }))
  }

  const handlePriceRangeChange = (range: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.includes(range)
        ? prev.priceRanges.filter(r => r !== range)
        : [...prev.priceRanges, range]
    }))
  }

  const handleVolumeChange = (volume: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      volumes: prev.volumes.includes(volume)
        ? prev.volumes.filter(v => v !== volume)
        : [...prev.volumes, volume]
    }))
  }

  const handleRatingChange = (rating: number) => {
    setSelectedFilters(prev => ({
      ...prev,
      ratings: prev.ratings.includes(rating)
        ? prev.ratings.filter(r => r !== rating)
        : [...prev.ratings, rating]
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({
      brands: [],
      priceRanges: [],
      volumes: [],
      ratings: [],
      sortBy: 'name'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Kateqoriya tapılmadı</h1>
            <p className="text-gray-600 mb-6">Axtardığınız kateqoriya mövcud deyil.</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Bütün Məhsullara Qayıt
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Ana Səhifə</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">Məhsullar</Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {filteredProducts.length} məhsul tapıldı
              </p>
            </div>
            {category.image && (
              <div className="hidden md:block">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={200}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtrlər</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Təmizlə
                </button>
              </div>

              {/* Brands */}
              {filterData.brands.length > 0 && (
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <button
                    onClick={() => toggleSection('brands')}
                    className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
                  >
                    Markalar
                    {expandedSections.brands ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections.brands && (
                    <div className="space-y-2">
                      {filterData.brands.map((brand) => (
                        <label key={brand.name} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedFilters.brands.includes(brand.name)}
                            onChange={() => handleBrandChange(brand.name)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {brand.name} ({brand.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Range */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <button
                  onClick={() => toggleSection('price')}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
                >
                  Qiymət Aralığı
                  {expandedSections.price ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
        {expandedSections.price && (
          <div className="space-y-2">
            {filterData.priceRanges.map((range, index) => {
              const rangeKey = range.max ? `${range.min}-${range.max}` : `${range.min}+`
              const rangeName = range.max ? `${range.min} - ${range.max} ₼` : `${range.min}+ ₼`
              
              return (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFilters.priceRanges.includes(rangeKey)}
                    onChange={() => handlePriceRangeChange(rangeKey)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {rangeName} ({range.count})
                  </span>
                </label>
              )
            })}
          </div>
        )}
              </div>

              {/* Volume */}
              {filterData.volumes.length > 0 && (
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <button
                    onClick={() => toggleSection('volume')}
                    className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
                  >
                    Həcm
                    {expandedSections.volume ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
        {expandedSections.volume && (
          <div className="space-y-2">
            {filterData.volumes.map((volume) => (
              <label key={volume.volume} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.volumes.includes(volume.volume)}
                  onChange={() => handleVolumeChange(volume.volume)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {volume.volume} ({volume.count})
                </span>
              </label>
            ))}
          </div>
        )}
                </div>
              )}

              {/* Rating */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <button
                  onClick={() => toggleSection('rating')}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
                >
                  Dəyərləndirmə
                  {expandedSections.rating ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.ratings.includes(rating)}
                  onChange={() => handleRatingChange(rating)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {rating}+ ulduz
                </span>
              </label>
            ))}
          </div>
        )}
              </div>

              {/* Sort */}
              <div className="pb-4">
                <button
                  onClick={() => toggleSection('sort')}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
                >
                  Sıralama
                  {expandedSections.sort ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.sort && (
                  <div className="space-y-2">
                    {[
                      { value: 'name', label: 'Ad (A-Z)' },
                      { value: 'price-low', label: 'Qiymət (Aşağıdan)' },
                      { value: 'price-high', label: 'Qiymət (Yuxarıdan)' },
                      { value: 'rating', label: 'Dəyərləndirmə' },
                      { value: 'newest', label: 'Ən yeni' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="sort"
                          checked={selectedFilters.sortBy === option.value}
                          onChange={() => setSelectedFilters(prev => ({ ...prev, sortBy: option.value }))}
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <Link href={`/products/${product.id}`}>
                        <div className={`relative ${viewMode === 'list' ? 'h-48 w-full' : 'h-64 w-full'}`}>
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
                                className={`absolute inset-0 bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-medium ${
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
                                  <div>Şəkil yoxdur</div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div 
                              className={`absolute inset-0 bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-medium ${
                                viewMode === 'list' ? 'h-48 w-full' : 'w-full h-64'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-gray-400 mb-2">
                                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>Şəkil yoxdur</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
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
                        <p className="text-sm text-gray-500">{product.brand?.name || 'Brend məlumatı yoxdur'}</p>
                        <Link 
                          href={`/products/${product.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500">{product.category.name}</p>
                      </div>

                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.averageRating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill={i < Math.floor(product.averageRating) ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          ({product.reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {product.salePrice ? (
                            <>
                              <span className="text-lg font-bold text-red-600">
                                ₼{product.salePrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ₼{product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              ₼{product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {product.inStock ? 'Səbətə' : 'Stokda yox'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Filtrə uyğun məhsul tapılmadı
                </h3>
                <p className="text-gray-600 mb-4">
                  Seçdiyiniz filtrlərə uyğun məhsul yoxdur. Filtrləri dəyişdirin və ya təmizləyin.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Filtrləri Təmizlə
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}