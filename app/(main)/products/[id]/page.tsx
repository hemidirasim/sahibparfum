'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, Heart, ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import ProductRating from '@/components/products/product-rating'
import ProductReviews from '@/components/products/product-reviews'
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
  brand?: {
    name: string
  }
  volume?: string
  averageRating: number
  reviewCount: number
  isOnSale?: boolean
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
  const [productRating, setProductRating] = useState({ average: 0, count: 0 })

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
        
        // Rating məlumatlarını da yüklə
        const ratingResponse = await fetch(`/api/products/${id}/ratings`)
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json()
          const ratings = ratingData.ratings.filter((r: any) => r.rating).map((r: any) => r.rating)
          if (ratings.length > 0) {
            const avg = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
            setProductRating({ average: avg, count: ratings.length })
          }
        }
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
        productId: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images[0],
        quantity: 1,
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
        productId: product.id,
        productVariantId: variant.id,
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

  const averageRating = product?.averageRating || 0

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
                <>
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
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
                  <div className="absolute inset-0 flex items-center justify-center h-full" style={{ display: 'none' }}>
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">Şəkil yoxdur</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Şəkil yoxdur</p>
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
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
                      <div className="text-center">
                        <div className="text-gray-400 mb-1">
                          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-500">Yoxdur</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{product.brand?.name || 'Brend məlumatı yoxdur'}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= productRating.average ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {productRating.average > 0 ? `${productRating.average.toFixed(1)} (${productRating.count} rəy)` : 'Hələ qiymətləndirilməyib'}
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

            {/* Main Product - Always show */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Əsas Məhsul</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Product Icon */}
                    <div className="w-8 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                      <div className="text-xs text-gray-500">
                        SKU: {product.sku}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Price */}
                    <div className="text-right">
                      {product.isOnSale && product.salePrice ? (
                        <div>
                          <span className="text-lg font-bold text-primary-600">
                            {product.salePrice.toFixed(2)} ₼
                          </span>
                          <div className="text-sm text-gray-500 line-through">
                            {product.price.toFixed(2)} ₼
                          </div>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {product.price.toFixed(2)} ₼
                        </span>
                      )}
                    </div>
                    
                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || !product.inStock}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {!product.inStock ? 'Stokda yoxdur' : 'Səbətə At'}
                    </button>
                  </div>
                </div>
                
                {/* Stock Info */}
                <div className="mt-2 text-sm text-gray-600">
                  Stok: {product.stockCount} ədəd
                </div>
              </div>
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
                            <span className="text-white text-xs font-bold">V</span>
                          </div>
                          
                          {/* Volume */}
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              {variant.volume}
                            </span>
                            <div className="text-xs text-gray-500">
                              SKU: {variant.sku}
                            </div>
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
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {variant.stock === 0 ? 'Stokda yoxdur' : 'Səbətə At'}
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

          </div>
        </div>

        {/* Product Rating Section */}
        <div className="mt-16">
          <ProductRating productId={product.id} />
        </div>

        {/* Product Reviews Section */}
        <div className="mt-8">
          <ProductReviews 
            productId={product.id}
            productName={product.name}
            productImage={product.images[0] || '/placeholder-product.jpg'}
          />
        </div>
      </div>
    </div>
  )
}
