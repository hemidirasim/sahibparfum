'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, Heart, ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import toast from 'react-hot-toast'

interface ProductVariant {
  id: string
  volume: string
  price: number
  salePrice?: number
  stock: number
  sku: string
  isActive: boolean
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  images: string[]
  inStock: boolean
  stockCount: number
  sku: string
  brand?: string
  volume?: string
  category: {
    name: string
  }
  variants: ProductVariant[]
  reviews: {
    id: string
    rating: number
    comment?: string
    user: {
      name: string
    }
    createdAt: string
  }[]
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantities, setQuantities] = useState<{[key: string]: number}>({})
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()
      
      if (response.ok) {
        setProduct(data)
      } else {
        console.error('Error fetching product:', data.error)
        toast.error('Məhsul yüklənərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Məhsul yüklənərkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      setAddingToCart(true)
      addItem({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images[0],
        quantity,
        sku: product.sku
      })
      toast.success('Məhsul səbətə əlavə edildi')
    } catch (error) {
      toast.error('Səbətə əlavə edilərkən xəta baş verdi')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleQuantityChange = (variantId: string, type: 'increase' | 'decrease') => {
    const currentQuantity = quantities[variantId] || 1
    const variant = product?.variants.find(v => v.id === variantId)
    
    if (type === 'increase' && currentQuantity < (variant?.stock || 1)) {
      setQuantities(prev => ({ ...prev, [variantId]: currentQuantity + 1 }))
    } else if (type === 'decrease' && currentQuantity > 1) {
      setQuantities(prev => ({ ...prev, [variantId]: currentQuantity - 1 }))
    }
  }

  const handleAddToCartVariant = async (variant: ProductVariant) => {
    if (!product) return
    
    const quantity = quantities[variant.id] || 1
    
    try {
      setAddingToCart(true)
      addItem({
        id: `${product.id}-${variant.id}`,
        name: `${product.name} - ${variant.volume}`,
        price: variant.salePrice || variant.price,
        image: product.images[0],
        quantity,
        sku: variant.sku
      })
      toast.success(`${product.name} - ${variant.volume} səbətə əlavə edildi`)
    } catch (error) {
      toast.error('Səbətə əlavə edilərkən xəta baş verdi')
    } finally {
      setAddingToCart(false)
    }
  }

  const averageRating = product?.reviews.length 
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Məhsul tapılmadı</h1>
          <button
            onClick={() => router.push('/products')}
            className="btn btn-primary"
          >
            Məhsullara qayıt
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                Ana Səhifə
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => router.push('/products')}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-primary-600 md:ml-2"
                >
                  Məhsullar
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-gray-400">📷</span>
                    </div>
                    <p className="text-gray-500">Şəkil yoxdur</p>
                  </div>
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{product.brand}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= (product.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.reviews.length} rəy)
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kateqoriya:</span>
                <span className="font-medium">{product.category.name}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Təsvir</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Variantlar</h3>
                <div className="space-y-3">
                  {product.variants.filter(variant => variant.isActive).map((variant) => (
                    <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Product Icon */}
                          <div className="w-8 h-8 bg-gradient-to-b from-blue-900 to-blue-400 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">P</span>
                          </div>
                          
                          {/* Volume */}
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              {variant.volume}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* Price */}
                          <div className="text-right">
                            {variant.salePrice ? (
                              <div>
                                <span className="text-lg font-bold text-red-600">
                                  {variant.salePrice.toFixed(2)} ₼
                                </span>
                                <div className="text-sm text-gray-500 line-through">
                                  {variant.price.toFixed(2)} ₼
                                </div>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                {variant.price.toFixed(2)} ₼
                              </span>
                            )}
                          </div>
                          
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(variant.id, 'decrease')}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              disabled={(quantities[variant.id] || 1) <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                              {quantities[variant.id] || 1}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(variant.id, 'increase')}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              disabled={(quantities[variant.id] || 1) >= variant.stock}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Add to Cart Button */}
                          <button
                            onClick={() => handleAddToCartVariant(variant)}
                            disabled={addingToCart || variant.stock === 0}
                            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {variant.stock === 0 ? 'Stokda yoxdur' : 'AL'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Stock Info */}
                      <div className="mt-2 text-sm text-gray-600">
                        Stok: {variant.stock} ədəd
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Sharing */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Paylaş:</span>
                <div className="flex space-x-2">
                  <button className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                    <span className="text-xs font-bold">f</span>
                  </button>
                  <button className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                    <span className="text-xs">🐦</span>
                  </button>
                  <button className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                    <span className="text-xs font-bold">G</span>
                  </button>
                </div>
              </div>
            </div>

            {/* One-Click Order */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bir kliklə sifariş</h3>
              <div className="space-y-3">
                <input
                  type="tel"
                  placeholder="+994 (___) ___-____"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  SİFARİŞ ET
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Müştəri Rəyləri</h2>
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{review.rating}/5</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('az-AZ')}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-medium text-gray-900">{review.user.name}</span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-600">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
