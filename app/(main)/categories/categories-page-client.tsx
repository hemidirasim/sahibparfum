'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductFilters } from '@/components/products/product-filters'
import { useState, useCallback, useEffect } from 'react'

interface Category {
  id: string
  name: string
  description: string | null
  image: string | null
  isActive: boolean
  productCount: number
}

interface CategoriesPageClientProps {
  initialCategories: Category[]
  pageTitle: string
  pageDescription: string
}

export default function CategoriesPageClient({ 
  initialCategories, 
  pageTitle, 
  pageDescription 
}: CategoriesPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const filter = searchParams.get('filter') // Alphabetical filter
  const newProducts = searchParams.get('new')
  const sale = searchParams.get('sale')
  const brand = searchParams.get('brand')

  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRanges: [] as string[],
    volumes: [] as string[],
    ratings: [] as number[]
  })

  const [categoriesData, setCategoriesData] = useState<Category[]>(initialCategories)

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categoriesData.find(cat => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  // Fetch categories data if not provided
  useEffect(() => {
    if (initialCategories.length === 0) {
      const fetchCategories = async () => {
        try {
          const response = await fetch('/api/categories')
          const data = await response.json()
          setCategoriesData(data)
        } catch (error) {
          console.error('Error fetching categories:', error)
        }
      }
      fetchCategories()
    }
  }, [initialCategories])

  // Initialize activeFilters from URL parameters
  useEffect(() => {
    const newActiveFilters = {
      categories: [] as string[],
      brands: [] as string[],
      priceRanges: [] as string[],
      volumes: [] as string[],
      ratings: [] as number[]
    }

    // Parse categories from URL
    const categoryIds = searchParams.getAll('categoryIds')
    if (categoryIds.length > 0) {
      newActiveFilters.categories = categoryIds
    } else if (category) {
      // If single category parameter exists, add it
      newActiveFilters.categories = [category]
    }

    // Parse brands from URL
    const brands = searchParams.getAll('brands')
    const brandFilter = searchParams.get('brandFilter')
    if (brands.length > 0) {
      newActiveFilters.brands = brands
    } else if (brand) {
      // If single brand parameter exists, add it
      newActiveFilters.brands = [brand]
    } else if (brandFilter) {
      // If brandFilter parameter exists, we'll handle it in the filter component
      // For now, just set it as a special case
      newActiveFilters.brands = []
    }

    // Parse price ranges from URL
    const priceRanges = searchParams.getAll('priceRanges')
    if (priceRanges.length > 0) {
      newActiveFilters.priceRanges = priceRanges
    } else {
      // Parse from minPrice/maxPrice parameters
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')
      if (minPrice && maxPrice) {
        newActiveFilters.priceRanges = [`${minPrice}-${maxPrice}`]
      } else if (minPrice) {
        newActiveFilters.priceRanges = [`${minPrice}+`]
      } else if (maxPrice) {
        newActiveFilters.priceRanges = [`0-${maxPrice}`]
      }
    }

    // Parse volumes from URL
    const volumes = searchParams.getAll('volumes')
    if (volumes.length > 0) {
      newActiveFilters.volumes = volumes
    } else if (searchParams.get('volume')) {
      newActiveFilters.volumes = [searchParams.get('volume')!]
    }

    // Parse ratings from URL
    const minRating = searchParams.get('minRating')
    if (minRating) {
      newActiveFilters.ratings = [parseInt(minRating)]
    }

    setActiveFilters(newActiveFilters)
  }, [searchParams, category, brand])

  const handleFiltersChange = useCallback((filters: {
    categories: string[]
    brands: string[]
    priceRanges: string[]
    volumes: string[]
    ratings: number[]
  }) => {
    setActiveFilters(filters)
    
    // Update URL parameters based on filters
    const newParams = new URLSearchParams(searchParams.toString())
    
    // Clear existing filter parameters
    newParams.delete('category')
    newParams.delete('brand')
    newParams.delete('minPrice')
    newParams.delete('maxPrice')
    newParams.delete('volume')
    newParams.delete('minRating')
    newParams.delete('categoryIds')
    newParams.delete('brands')
    newParams.delete('priceRanges')
    newParams.delete('volumes')
    
    // Add new filter parameters
    if (filters.categories.length > 0) {
      filters.categories.forEach(catId => newParams.append('categoryIds', catId))
    }
    if (filters.brands.length > 0) {
      filters.brands.forEach(brand => newParams.append('brands', brand))
    }
    if (filters.priceRanges.length > 0) {
      filters.priceRanges.forEach(range => newParams.append('priceRanges', range))
    }
    if (filters.volumes.length > 0) {
      filters.volumes.forEach(volume => newParams.append('volumes', volume))
    }
    if (filters.ratings.length > 0) {
      const minRating = Math.min(...filters.ratings)
      newParams.set('minRating', minRating.toString())
    }
    
    // Navigate to new URL
    const newUrl = newParams.toString() ? `/categories?${newParams.toString()}` : '/categories'
    router.push(newUrl)
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-2">
            {pageDescription}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilters 
              onFiltersChange={handleFiltersChange}
              activeFilters={activeFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <ProductGrid 
              search={search}
              category={category}
              filter={filter}
              brand={brand}
              newProducts={newProducts === 'true'}
              sale={sale === 'true'}
              minPrice={searchParams.get('minPrice')}
              maxPrice={searchParams.get('maxPrice')}
              volume={searchParams.get('volume')}
              minRating={searchParams.get('minRating')}
              activeFilters={activeFilters}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
