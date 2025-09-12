'use client'

import { useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductFilters } from '@/components/products/product-filters'
import { useState, useCallback } from 'react'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const filter = searchParams.get('filter') // Alphabetical filter
  const newProducts = searchParams.get('new') === 'true'
  const sale = searchParams.get('sale') === 'true'

  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRanges: [] as string[],
    volumes: [] as string[],
    ratings: [] as number[]
  })

  const handleFiltersChange = useCallback((filters: {
    categories: string[]
    brands: string[]
    priceRanges: string[]
    volumes: string[]
    ratings: number[]
  }) => {
    setActiveFilters(filters)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Məhsullar</h1>
          <p className="text-gray-600 mt-2">
            Bütün parfüm kolleksiyamızı kəşf edin
          </p>
          
          {/* Active Filters Display */}
          {(search || category || filter || newProducts || sale || 
            activeFilters.categories.length > 0 || 
            activeFilters.brands.length > 0 || 
            activeFilters.priceRanges.length > 0 || 
            activeFilters.volumes.length > 0 || 
            activeFilters.ratings.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Axtarış: {search}
                </span>
              )}
              {category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Kateqoriya: {category}
                </span>
              )}
              {filter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Hərf: {filter}
                </span>
              )}
              {newProducts && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Yeni Gələnlər
                </span>
              )}
              {sale && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                  Endirimlər
                </span>
              )}
              {activeFilters.categories.map(catId => (
                <span key={catId} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Kateqoriya: {catId}
                </span>
              ))}
              {activeFilters.brands.map(brand => (
                <span key={brand} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Marka: {brand}
                </span>
              ))}
              {activeFilters.priceRanges.map((range) => (
                <span key={range} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  Qiymət: {range}
                </span>
              ))}
              {activeFilters.volumes.map((volume) => (
                <span key={volume} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Həcm: {volume}
                </span>
              ))}
              {activeFilters.ratings.map((rating) => (
                <span key={rating} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  Dəyərləndirmə: {rating}+ ulduz
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <ProductFilters onFiltersChange={handleFiltersChange} />
          </aside>
          <div className="lg:col-span-3">
            <ProductGrid
              search={search}
              category={category}
              filter={filter}
              newProducts={newProducts}
              sale={sale}
              activeFilters={activeFilters}
            />
          </div>
        </div>
      </div>
    </div>
  )
}