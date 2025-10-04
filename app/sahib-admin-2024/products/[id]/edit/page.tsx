'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react'
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

interface Product {
  id: string
  name: string
  description: string
  brand: string
  categoryId: string
  price: number
  salePrice?: number
  stockCount: number
  sku: string
  isNew: boolean
  isOnSale: boolean
  isActive: boolean
  variants: Variant[]
  attributes: Attribute[]
  images: string[]
}

export default function EditProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    categoryId: '',
    price: '',
    salePrice: '',
    stockCount: '',
    sku: '',
    isNew: false,
    isOnSale: false,
    isActive: true
  })


  useEffect(() => {
    if (status === 'loading') return
    if (session?.user?.role === 'ADMIN' && productId) {
      fetchProduct()
      fetchCategories()
      fetchBrands()
    }
  }, [productId, session, status])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sahib-admin-2024/products/${productId}`)
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
        setFormData({
          name: productData.name,
          description: productData.description,
          brand: productData.brand?.name || '',
          categoryId: productData.categoryId,
          price: productData.price.toString(),
          salePrice: productData.salePrice?.toString() || '',
          stockCount: productData.stockCount.toString(),
          sku: productData.sku,
          isNew: productData.isNew,
          isOnSale: productData.isOnSale,
          isActive: productData.isActive
        })
        setVariants(productData.variants || [])
        setAttributes(productData.attributes || [])
        // Handle images - convert comma-separated string to array if needed
        const imagesArray = Array.isArray(productData.images) 
          ? productData.images 
          : productData.images 
            ? productData.images.split(',').filter((img: string) => img.trim() !== '')
            : []
        setImages(imagesArray)
        console.log('Product images loaded:', imagesArray)
      } else {
        console.error('Failed to fetch product')
        router.push('/sahib-admin-2024/products')
      }
    } catch (error) {
      console.error('Product fetch error:', error)
      router.push('/sahib-admin-2024/products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/sahib-admin-2024/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Categories fetch error:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true)
      const response = await fetch('/api/sahib-admin-2024/brands')
      if (response.ok) {
        const data = await response.json()
        // Extract brand names from admin brands API
        const brandNames = data.brands?.map((brand: any) => brand.name) || []
        setBrands(brandNames.sort())
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        return result.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      console.log('Uploaded URLs:', uploadedUrls)
      
      setImages(prev => {
        const newImages = [...prev, ...uploadedUrls]
        console.log('Updated images array:', newImages)
        return newImages
      })
      
      // Clear the input field after successful upload
      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Şəkil yüklənərkən xəta baş verdi: ${error instanceof Error ? error.message : 'Naməlum xəta'}`)
    } finally {
      setUploading(false)
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
    setSaving(true)

    try {
      // Handle brand - convert brand name to brandId if provided
      let brandId = null
      if (formData.brand && formData.brand.trim()) {
        // First, try to find existing brand
        const brandsResponse = await fetch('/api/sahib-admin-2024/brands')
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json()
          const existingBrand = brandsData.brands?.find((brand: any) => 
            brand.name.toLowerCase() === formData.brand.toLowerCase()
          )
          
          if (existingBrand) {
            brandId = existingBrand.id
          } else {
            // Create new brand if it doesn't exist
            const createBrandResponse = await fetch('/api/sahib-admin-2024/brands', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: formData.brand.trim(),
                description: ''
              })
            })
            
            if (createBrandResponse.ok) {
              const newBrandData = await createBrandResponse.json()
              brandId = newBrandData.brand.id
            } else {
              console.error('Failed to create brand:', await createBrandResponse.json())
            }
          }
        }
      }

      // Prepare the data to send, excluding the brand field and using brandId instead
      const { brand, ...formDataWithoutBrand } = formData
      
      const requestData = {
        ...formDataWithoutBrand,
        brandId, // Use brandId instead of brand
        variants,
        attributes,
        images
      }
      
      console.log('Updating product with data:', JSON.stringify(requestData, null, 2))
      
      const response = await fetch(`/api/sahib-admin-2024/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        router.push('/sahib-admin-2024/products')
      } else {
        const error = await response.json()
        console.error('Update error:', error)
        alert(`Məhsul yenilənərkən xəta baş verdi: ${error.error || 'Naməlum xəta'}`)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Məhsul yenilənərkən xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Məhsulu Yenilə</h1>
              <p className="text-gray-600 mt-1">
                Məhsul məlumatlarını yeniləyin
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Məhsul tapılmadı</h1>
            <p className="text-gray-600 mt-1">
              Axtardığınız məhsul mövcud deyil
            </p>
            <Link
              href="/sahib-admin-2024/products"
              className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Məhsullara qayıt
            </Link>
          </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Məhsulu Yenilə</h1>
            <p className="text-gray-600 mt-1">
              "{product.name}" məhsulunun məlumatlarını yeniləyin
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/sahib-admin-2024/products"
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Link>
            <Link
              href="/sahib-admin-2024/products"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Kateqoriya seçin</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {formData.categoryId && (
                <p className="text-sm text-green-600 mt-1">
                  Seçili kateqoriya: {categories.find(c => c.id === formData.categoryId)?.name}
                </p>
              )}
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
                Əsas Stok *
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Şəkillər</h2>
          
          {/* Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şəkil Yüklə
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
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
                      Şəkilləri buraya sürükləyin və ya <span className="text-blue-600">seçmək üçün klikləyin</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF formatları dəstəklənir
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Yüklənmiş şəkillər</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
            href="/sahib-admin-2024/products"
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Ləğv Et
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
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
