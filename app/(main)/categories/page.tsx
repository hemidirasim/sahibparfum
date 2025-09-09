'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  isActive: boolean
  productCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          // Only show active categories
          const activeCategories = data.filter((cat: Category) => cat.isActive)
          setCategories(activeCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bütün Kateqoriyalar
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hər zövqə uyğun parfüm kateqoriyalarımızı kəşf edin
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.name.toLowerCase()
                  .replace(/ç/g, 'c')
                  .replace(/ğ/g, 'g')
                  .replace(/ı/g, 'i')
                  .replace(/ö/g, 'o')
                  .replace(/ş/g, 's')
                  .replace(/ü/g, 'u')
                  .replace(/\s+/g, '-')}-${category.id}`}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-transform group-hover:scale-105 group-hover:shadow-md">
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={category.image || '/placeholder.jpg'}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-200">{category.description || 'Parfüm kateqoriyası'}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {category.productCount} məhsul
                      </span>
                      <span className="text-sm text-blue-600 group-hover:text-blue-700">
                        Bax →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Kateqoriya yoxdur
            </h3>
            <p className="text-gray-600">
              Hələ heç bir kateqoriya əlavə edilməyib.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
