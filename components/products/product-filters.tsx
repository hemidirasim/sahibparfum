'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FilterData {
  categories: { id: string; name: string; count: number }[]
  brands: { name: string; count: number }[]
  priceRanges: { min: number; max: number | null; count: number }[]
  volumes: { volume: string; count: number }[]
}

interface ProductFiltersProps {
  onFiltersChange?: (filters: {
    categories: string[]
    brands: string[]
    priceRanges: string[]
    volumes: string[]
    ratings: number[]
  }) => void
}

export function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    volume: true,
    rating: true
  })

  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRanges: [] as string[],
    volumes: [] as string[],
    ratings: [] as number[]
  })

  const [filterData, setFilterData] = useState<FilterData>({
    categories: [],
    brands: [],
    priceRanges: [
      { min: 0, max: 50, count: 0 },
      { min: 50, max: 100, count: 0 },
      { min: 100, max: 200, count: 0 },
      { min: 200, max: 500, count: 0 },
      { min: 500, max: null, count: 0 }
    ],
    volumes: []
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories')
        const categoriesData = await categoriesResponse.json()
        
        // Fetch products for counts
        const productsResponse = await fetch('/api/products')
        const productsData = await productsResponse.json()
        const products = productsData.products || []

        // Calculate counts
        const brandCounts: { [key: string]: number } = {}
        const volumeCounts: { [key: string]: number } = {}
        const priceCounts: { [key: string]: number } = {
          '0-50': 0,
          '50-100': 0,
          '100-200': 0,
          '200-500': 0,
          '500+': 0
        }

        products.forEach((product: any) => {
          // Count brands
          brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1

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
          categories: categoriesData.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            count: products.filter((p: any) => p.category?.id === cat.id).length
          })),
          brands: Object.entries(brandCounts).map(([name, count]) => ({ name, count })),
          volumes: Object.entries(volumeCounts).map(([volume, count]) => ({ volume, count })),
          priceRanges: [
            { min: 0, max: 50, count: priceCounts['0-50'] },
            { min: 50, max: 100, count: priceCounts['50-100'] },
            { min: 100, max: 200, count: priceCounts['100-200'] },
            { min: 200, max: 500, count: priceCounts['200-500'] },
            { min: 500, max: null, count: priceCounts['500+'] }
          ]
        })
      } catch (error) {
        console.error('Error fetching filter data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterData()
  }, [])

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        categories: selectedFilters.categories,
        brands: selectedFilters.brands,
        priceRanges: selectedFilters.priceRanges,
        volumes: selectedFilters.volumes,
        ratings: selectedFilters.ratings
      })
    }
  }, [selectedFilters, onFiltersChange])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
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
      categories: [],
      brands: [],
      priceRanges: [],
      volumes: [],
      ratings: []
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
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

      {/* Categories */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('categories')}
          className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
        >
          Kateqoriyalar
          {expandedSections.categories ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {filterData.categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.categories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {category.name} ({category.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
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
      <div className="pb-4">
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
    </div>
  )
}