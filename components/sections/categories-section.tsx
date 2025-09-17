'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  isActive: boolean
  productCount: number
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Add cache busting parameter
        const timestamp = Date.now()
        const response = await fetch(`/api/categories?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          
          console.log('Categories Section: Categories fetched:', {
            timestamp: new Date().toISOString(),
            categoriesCount: data?.length || 0,
            url: `/api/categories?_t=${timestamp}`,
            categories: data?.map((cat: any) => ({ name: cat.name, productCount: cat.productCount }))
          })
          // Show only first 4 categories (API already filters for active categories with products)
          const activeCategories = data.slice(0, 4)
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kateqoriyalar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hər zövqə uyğun parfüm kateqoriyalarımızı kəşf edin
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            Kateqoriyalar
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hər zövqə uyğun parfüm kateqoriyalarımızı kəşf edin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories?categoryIds=${category.id}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-100 transition-transform group-hover:scale-105 h-48">
                {category.image ? (
                  <>
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="absolute inset-0 w-full h-full object-cover"
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
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                      <div className="text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-500 font-medium">Şəkil yoxdur</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-500 font-medium">Şəkil yoxdur</div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-200">{category.description || 'Parfüm kateqoriyası'}</p>
                  <p className="text-xs text-gray-300 mt-1">{category.productCount} məhsul</p>
                  <div className="mt-2">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                      Məhsulları Gör
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="btn btn-primary btn-lg"
          >
            Bütün Kateqoriyaları Gör
          </Link>
        </div>
      </div>
    </section>
  )
}
