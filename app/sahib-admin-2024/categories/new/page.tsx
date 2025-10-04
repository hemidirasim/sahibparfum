'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setFormData(prev => ({ ...prev, image: data.url }))
        } else {
          console.error('Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
      } finally {
        setUploading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/sahib-admin-2024/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/sahib-admin-2024/categories')
      } else {
        const error = await response.json()
        console.error('Create error:', error)
        alert('Kateqoriya yaradılarkən xəta baş verdi')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Kateqoriya yaradılarkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Kateqoriya</h1>
            <p className="text-gray-600 mt-1">
              Yeni kateqoriya yaradın
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/sahib-admin-2024/categories"
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Link>
            <Link
              href="/sahib-admin-2024/categories"
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Ləğv Et
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Əsas Məlumatlar</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kateqoriya Adı *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kateqoriya adını daxil edin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Təsvir
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kateqoriya təsvirini daxil edin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kateqoriya Şəkli
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className={`flex items-center justify-center w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="text-center">
                      <Upload className="mx-auto h-6 w-6 text-gray-400" />
                      <p className="text-xs text-gray-500 mt-1">
                        {uploading ? 'Yüklənir...' : 'Şəkil yüklə'}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {formData.image && (
                    <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="Və ya şəkil URL-i daxil edin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Aktiv</p>
                <p className="text-sm text-gray-600">Kateqoriyanı aktiv et</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/sahib-admin-2024/categories"
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Ləğv Et
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Yaradılır...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Yarat
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
