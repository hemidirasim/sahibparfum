'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Package, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  description: string | null
  image: string | null
  isActive: boolean
  productCount: number
  status: string
  createdAt: string
  updatedAt: string
}

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/sahib-admin-2024/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Failed to fetch categories')
        setCategories([])
      }
    } catch (error) {
      console.error('Categories fetch error:', error)
      setCategories([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (categoryId: string, categoryName: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    const productCount = category?.productCount || 0
    
    let confirmMessage = `"${categoryName}" kateqoriyasını silmək istədiyinizə əminsiniz?`
    if (productCount > 0) {
      confirmMessage += `\n\nBu kateqoriyada ${productCount} məhsul var və onlar da silinəcək. Bu əməliyyat geri alına bilməz.`
    }
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setDeleting(categoryId)
      const response = await fetch(`/api/sahib-admin-2024/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId))
        const deletedCategory = categories.find(cat => cat.id === categoryId)
        const productCount = deletedCategory?.productCount || 0
        
        let successMessage = 'Kateqoriya uğurla silindi'
        if (productCount > 0) {
          successMessage += `\n${productCount} məhsul da silindi`
        }
        alert(successMessage)
      } else {
        const error = await response.json()
        console.error('Delete API error:', error)
        alert(`Kateqoriya silinərkən xəta baş verdi: ${error.error || 'Naməlum xəta'}${error.details ? `\n\nƏtraflı: ${error.details}` : ''}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert(`Kateqoriya silinərkən xəta baş verdi: ${error instanceof Error ? error.message : 'Naməlum xəta'}`)
    } finally {
      setDeleting(null)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kateqoriyalar</h1>
              <p className="text-gray-600 mt-1">
                Aktiv kateqoriyaları idarə edin və yeni kateqoriyalar əlavə edin
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Yalnız aktiv kateqoriyalar və məhsulu olan kateqoriyalar göstərilir
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                disabled
                className="flex items-center px-4 py-2 text-gray-400 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Yenilə
              </button>
              <Link
                href="/sahib-admin-2024/categories/new"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kateqoriya
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kateqoriyalar</h1>
            <p className="text-gray-600 mt-1">
              Aktiv kateqoriyaları idarə edin və yeni kateqoriyalar əlavə edin
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Yalnız aktiv kateqoriyalar və məhsulu olan kateqoriyalar göstərilir
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchCategories}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yenilə
            </button>
            <Link
              href="/sahib-admin-2024/categories/new"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kateqoriya
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Kateqoriya axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description || 'Təsvir yoxdur'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Link
                  href={`/sahib-admin-2024/categories/${category.id}/edit`}
                  className="text-green-600 hover:text-green-900 p-1"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button 
                  onClick={() => handleDelete(category.id, category.name)}
                  disabled={deleting === category.id}
                  className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                >
                  {deleting === category.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Məhsul sayı</p>
                  <p className="text-lg font-semibold text-gray-900">{category.productCount}</p>
                </div>
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(category.status)}`}>
                    {category.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/sahib-admin-2024/products?category=${encodeURIComponent(category.name)}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Məhsulları gör →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {searchTerm ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Kateqoriya tapılmadı</h3>
              <p className="text-gray-600 mb-4">
                "{searchTerm}" axtarışına uyğun kateqoriya tapılmadı.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Bütün kateqoriyaları göstər
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Kateqoriya yoxdur</h3>
              <p className="text-gray-600 mb-4">
                Hələ heç bir kateqoriya yaradılmayıb.
              </p>
              <Link
                href="/sahib-admin-2024/categories/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Kateqoriyanı Yarat
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
