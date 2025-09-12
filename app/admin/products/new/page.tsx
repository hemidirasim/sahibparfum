'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface Variant {
  id: string
  volume: string
  price: number
  salePrice?: number
  stock: number
  sku: string
}

interface Attribute {
  id: string
  name: string
  value: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [images, setImages] = useState<string[]>([])
  const [mainImageIndex, setMainImageIndex] = useState(0)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    categoryId: '',
    price: '0',
    salePrice: '',
    stockCount: '0',
    sku: '',
    isNew: false,
    isOnSale: false,
    isActive: true
  })

  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [brands, setBrands] = useState<string[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Categories fetch error:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true)
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        // Flatten all brands from all letters
        const allBrands: string[] = []
        Object.values(data.brands || {}).forEach((brandList: any) => {
          allBrands.push(...brandList)
        })
        setBrands(Array.from(new Set(allBrands)).sort()) // Remove duplicates and sort
      } else {
        console.error('Failed to fetch brands')
      }
    } catch (error) {
      console.error('Brands fetch error:', error)
    } finally {
      setBrandsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addVariant = () => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      volume: '',
      price: 0,
      salePrice: undefined,
      stock: 0,
      sku: ''
    }
    setVariants([...variants, newVariant])
  }

  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(prev => prev.map(variant => 
      variant.id === id ? { ...variant, [field]: value } : variant
    ))
  }

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(variant => variant.id !== id))
  }

  const addAttribute = () => {
    const newAttribute: Attribute = {
      id: Date.now().toString(),
      name: '',
      value: ''
    }
    setAttributes([...attributes, newAttribute])
  }

  const updateAttribute = (id: string, field: string, value: string) => {
    setAttributes(prev => prev.map(attr => 
      attr.id === id ? { ...attr, [field]: value } : attr
    ))
  }

  const removeAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id))
  }

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} şəkli deyil!`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} çox böyükdür! Maksimum 5MB olmalıdır.`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          uploadedUrls.push(result.url)
        } else {
          const error = await response.json()
          alert(`${file.name} yüklənərkən xəta: ${error.error}`)
        }
      }

      setImages(prev => [...prev, ...uploadedUrls])
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Şəkil yüklənərkən xəta baş verdi')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    
    // Əgər silinən şəkil əsas şəkil idisə, əsas şəkli yenilə
    if (mainImageIndex === index) {
      setMainImageIndex(0)
    } else if (mainImageIndex > index) {
      setMainImageIndex(mainImageIndex - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images,
          variants,
          attributes
        })
      })

      if (response.ok) {
        router.push('/admin/products')
      } else {
        const error = await response.json()
        console.error('Save error:', error)
        alert(`Məhsul əlavə edərkən xəta baş verdi: ${error.error || 'Naməlum xəta'}`)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Məhsul əlavə edərkən xəta baş verdi')
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
            <h1 className="text-2xl font-bold text-gray-900">Yeni Məhsul</h1>
            <p className="text-gray-600 mt-1">
              Yeni məhsul əlavə edin və variantlarını təyin edin
            </p>
          </div>
          <Link
            href="/admin/products"
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Ləğv Et
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Əsas Məlumatlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Məhsul Adı *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Məhsul adını daxil edin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marka
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Marka adını daxil edin və ya seçin"
                  list="brands-list"
                />
                <datalist id="brands-list">
                  {brands.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
                {brandsLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {brands.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {brands.length} mövcud marka. Yuxarıda yazaraq axtarın və ya yeni marka əlavə edin.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kateqoriya *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                disabled={categoriesLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">
                  {categoriesLoading ? 'Kateqoriyalar yüklənir...' : 'Kateqoriya seçin'}
                </option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Əsas Qiymət *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endirim Qiyməti
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => handleInputChange('salePrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SKU kodunu daxil edin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Əsas Stok
              </label>
              <input
                type="number"
                required
                value={formData.stockCount}
                onChange={(e) => handleInputChange('stockCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Təsvir
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Məhsul təsvirini daxil edin"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Məhsul Şəkilləri</h2>
          
          {/* Upload Area */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {uploadingImages ? 'Şəkillər yüklənir...' : 'Şəkil yüklə'}
                </p>
                <p className="text-sm text-gray-600">
                  PNG, JPG, JPEG formatında, maksimum 5MB
                </p>
              </label>
            </div>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Yüklənmiş şəkillər</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Məhsul şəkli ${index + 1}`}
                      className={`w-full h-32 object-cover rounded-lg border-2 ${
                        mainImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    />
                    
                    {/* Main Image Badge */}
                    {mainImageIndex === index && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Əsas
                      </div>
                    )}
                    
                    {/* Set as Main Button */}
                    {mainImageIndex !== index && (
                      <button
                        type="button"
                        onClick={() => setMainImageIndex(index)}
                        className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Əsas et
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Reorder Images */}
              {images.length > 1 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Şəkil sırasını dəyişdir</h4>
                  <div className="flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const newImages = [...images]
                          const [movedImage] = newImages.splice(index, 1)
                          newImages.splice(0, 0, movedImage)
                          setImages(newImages)
                          setMainImageIndex(0)
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                      >
                        <span>#{index + 1}</span>
                        <span>Əsas et</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {images.length === 0 && !uploadingImages && (
            <p className="text-gray-500 text-center py-8">
              Hələ heç bir şəkil yüklənməyib. Şəkil yükləmək üçün yuxarıdakı sahəyə klik edin.
            </p>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Variantlar</h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Variant Əlavə Et
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Hələ heç bir variant əlavə edilməyib. Variant əlavə etmək üçün düyməni basın.
            </p>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Variant {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Həcm *
                      </label>
                      <input
                        type="text"
                        required
                        value={variant.volume}
                        onChange={(e) => updateVariant(variant.id, 'volume', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="50ml, 100ml"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qiymət *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endirim Qiyməti
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.salePrice || ''}
                        onChange={(e) => updateVariant(variant.id, 'salePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stok *
                      </label>
                      <input
                        type="number"
                        required
                        value={variant.stock}
                        onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variant SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={variant.sku}
                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="SKU-50ML"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attributes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Xüsusiyyətlər</h2>
            <button
              type="button"
              onClick={addAttribute}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Xüsusiyyət Əlavə Et
            </button>
          </div>

          {attributes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Hələ heç bir xüsusiyyət əlavə edilməyib. Xüsusiyyət əlavə etmək üçün düyməni basın.
            </p>
          ) : (
            <div className="space-y-4">
              {attributes.map((attribute, index) => (
                <div key={attribute.id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={attribute.name}
                      onChange={(e) => updateAttribute(attribute.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Xüsusiyyət adı (məsələn: Aroma)"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={attribute.value}
                      onChange={(e) => updateAttribute(attribute.id, 'value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Xüsusiyyət dəyəri (məsələn: Floral)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttribute(attribute.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tənzimləmələr</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Yeni Məhsul</p>
                <p className="text-sm text-gray-600">Məhsulu "Yeni" kimi qeyd et</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => handleInputChange('isNew', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Endirim</p>
                <p className="text-sm text-gray-600">Məhsulu endirim kimi qeyd et</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOnSale}
                  onChange={(e) => handleInputChange('isOnSale', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Aktiv</p>
                <p className="text-sm text-gray-600">Məhsulu aktiv et</p>
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
            href="/admin/products"
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
                Saxlanılır...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Saxla
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
