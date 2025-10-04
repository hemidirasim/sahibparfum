'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, Edit2, Search, X, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Brand {
  id: string
  name: string
  description?: string
  logo?: string
  productCount: number
  createdAt: string
}

export default function BrandsPage() {
  const { data: session, status } = useSession()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandDescription, setNewBrandDescription] = useState('')
  const [newBrandLogo, setNewBrandLogo] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  useEffect(() => {
    if (status === 'loading') return
    if (session?.user?.role === 'ADMIN') {
      fetchBrands()
    }
  }, [session, status])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sahib-admin-2024/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands || [])
      } else {
        console.error('Failed to fetch brands')
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setNewBrandLogo(data.url)
        setLogoPreview(data.url)
        return data.url
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Şəkil yüklənərkən xəta baş verdi')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      
      // Create preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Auto upload the file
      try {
        console.log('Auto uploading brand logo:', file.name)
        const uploadedUrl = await handleFileUpload(file)
        if (uploadedUrl) {
          console.log('Brand logo uploaded successfully:', uploadedUrl)
          setNewBrandLogo(uploadedUrl)
          setLogoPreview(uploadedUrl)
        }
      } catch (error) {
        console.error('Auto upload failed:', error)
      }
    }
  }

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrandName.trim()) return

    try {
      setSaving(true)
      
      console.log('Adding brand with data:', {
        name: newBrandName.trim(),
        description: newBrandDescription.trim(),
        logo: newBrandLogo.trim()
      })

      const response = await fetch('/api/sahib-admin-2024/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newBrandName.trim(),
          description: newBrandDescription.trim(),
          logo: newBrandLogo.trim()
        }),
      })

      if (response.ok) {
        console.log('Brand added successfully')
        setNewBrandName('')
        setNewBrandDescription('')
        setNewBrandLogo('')
        setLogoFile(null)
        setLogoPreview('')
        setShowAddModal(false)
        fetchBrands()
      } else {
        const error = await response.json()
        console.error('Brand add error:', error)
        alert(`Marka əlavə edərkən xəta: ${error.error}`)
      }
    } catch (error) {
      console.error('Error adding brand:', error)
      alert('Marka əlavə edərkən xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const handleEditBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBrand || !newBrandName.trim()) return

    try {
      setSaving(true)
      
      console.log('Editing brand with data:', {
        id: editingBrand.id,
        name: newBrandName.trim(),
        description: newBrandDescription.trim(),
        logo: newBrandLogo.trim()
      })

      const response = await fetch(`/api/sahib-admin-2024/brands/${editingBrand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newBrandName.trim(),
          description: newBrandDescription.trim(),
          logo: newBrandLogo.trim()
        }),
      })

      if (response.ok) {
        console.log('Brand edited successfully')
        setNewBrandName('')
        setNewBrandDescription('')
        setNewBrandLogo('')
        setLogoFile(null)
        setLogoPreview('')
        setEditingBrand(null)
        setShowEditModal(false)
        fetchBrands()
      } else {
        const error = await response.json()
        console.error('Brand edit error:', error)
        alert(`Marka redaktə edərkən xəta: ${error.error}`)
      }
    } catch (error) {
      console.error('Error editing brand:', error)
      alert('Marka redaktə edərkən xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Bu markanı silmək istədiyinizə əminsiniz?')) return

    try {
      const response = await fetch(`/api/sahib-admin-2024/brands/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBrands()
      } else {
        const error = await response.json()
        alert(`Marka silərkən xəta: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
      alert('Marka silərkən xəta baş verdi')
    }
  }

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand)
    setNewBrandName(brand.name)
    setNewBrandDescription(brand.description || '')
    setNewBrandLogo(brand.logo || '')
    setLogoFile(null)
    setLogoPreview('')
    setShowEditModal(true)
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Markalar</h1>
            <p className="text-gray-600 mt-1">
              Məhsul markalarını idarə edin
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Marka
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Marka axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Brands List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredBrands.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Marka tapılmadı' : 'Hələ marka yoxdur'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Axtarış sorğunuza uyğun marka tapılmadı'
                : 'İlk markanızı əlavə edin'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Marka
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loqo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marka Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Təsvir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Məhsul Sayı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarix
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {brand.logo && (brand.logo.startsWith('http') || brand.logo.startsWith('/')) ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {brand.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {brand.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {brand.productCount} məhsul
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(brand.createdAt).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(brand)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Yeni Marka</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewBrandName('')
                  setNewBrandDescription('')
                  setNewBrandLogo('')
                  setLogoFile(null)
                  setLogoPreview('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddBrand}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marka Adı *
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Marka adını daxil edin"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Təsvir
                </label>
                <textarea
                  value={newBrandDescription}
                  onChange={(e) => setNewBrandDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Marka təsvirini daxil edin"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loqo
                </label>
                
                {/* Şəkil Upload */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şəkil Yüklə
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                          <p className="text-sm text-gray-600">Yüklənir...</p>
                        </>
                      ) : (
                        <>
                          <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-600">
                            Loqonu buraya sürükləyin və ya <span className="text-blue-600">seçmək üçün klikləyin</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF formatları dəstəklənir
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                  
                  {logoPreview && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Yüklənmiş loqo</h3>
                      <div className="relative inline-block">
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          width={100}
                          height={100}
                          className="rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null)
                            setLogoPreview('')
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewBrandName('')
                    setNewBrandDescription('')
                    setNewBrandLogo('')
                    setLogoFile(null)
                    setLogoPreview('')
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saxlanılır...' : 'Əlavə et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditModal && editingBrand && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Marka Redaktə Et</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingBrand(null)
                  setNewBrandName('')
                  setNewBrandDescription('')
                  setNewBrandLogo('')
                  setLogoFile(null)
                  setLogoPreview('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditBrand}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marka Adı *
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Marka adını daxil edin"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Təsvir
                </label>
                <textarea
                  value={newBrandDescription}
                  onChange={(e) => setNewBrandDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Marka təsvirini daxil edin"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loqo
                </label>
                
                {/* Şəkil Upload */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şəkil Yüklə
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                      id="logo-upload-edit"
                    />
                    <label
                      htmlFor="logo-upload-edit"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                          <p className="text-sm text-gray-600">Yüklənir...</p>
                        </>
                      ) : (
                        <>
                          <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-600">
                            Loqonu buraya sürükləyin və ya <span className="text-blue-600">seçmək üçün klikləyin</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF formatları dəstəklənir
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                  
                  {logoPreview && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Yüklənmiş loqo</h3>
                      <div className="relative inline-block">
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          width={100}
                          height={100}
                          className="rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null)
                            setLogoPreview('')
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingBrand(null)
                    setNewBrandName('')
                    setNewBrandDescription('')
                    setNewBrandLogo('')
                    setLogoFile(null)
                    setLogoPreview('')
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saxlanılır...' : 'Yadda Saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
