'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, Heart, ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus, Share2 } from 'lucide-react'
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

interface ProductAttribute {
  id: string
  name: string
  value: string
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
  attributes: ProductAttribute[]
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

interface ProductDetailClientProps {
  initialProduct: Product
}

export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const router = useRouter()
  const { addItem } = useCart()
  
  const [product, setProduct] = useState<Product>(initialProduct)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantities, setQuantities] = useState<{[key: string]: number}>({})
  const [mainProductQuantity, setMainProductQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [productRating, setProductRating] = useState({ average: 0, count: 0 })

  useEffect(() => {
    // Rating məlumatlarını yüklə
    const fetchRatings = async () => {
      try {
        const ratingResponse = await fetch(`/api/products/${product.id}/ratings`)
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json()
          const ratings = ratingData.ratings.filter((r: any) => r.rating).map((r: any) => r.rating)
          if (ratings.length > 0) {
            const avg = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
            setProductRating({ average: avg, count: ratings.length })
          }
        }
      } catch (error) {
        console.error('Error fetching ratings:', error)
      }
    }

    fetchRatings()
  }, [product.id])

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      setAddingToCart(true)
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images[0],
        quantity: mainProductQuantity,
        sku: product.sku
      })
      toast.success(`${mainProductQuantity} ədəd məhsul səbətə əlavə edildi`)
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

  const handleMainProductQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase' && mainProductQuantity < product.stockCount) {
      setMainProductQuantity(prev => prev + 1)
    } else if (type === 'decrease' && mainProductQuantity > 1) {
      setMainProductQuantity(prev => prev - 1)
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
        price: variant.price,
        salePrice: variant.salePrice,
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

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = product.name
    const text = `${product.name} - ${product.brand?.name || 'Parfüm'}`
    
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text,
              url
            })
            return
          } catch (error) {
          }
        }
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(url)
          toast.success('Link kopyalandı')
          return
        } catch (error) {
          console.error('Failed to copy to clipboard')
        }
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
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
                    className="object-contain"
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
                      className="object-contain"
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

            {/* Product Attributes */}
            {product.attributes && product.attributes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Xüsusiyyətlər</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.attributes.map((attribute) => (
                    <div key={attribute.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">{attribute.name}:</span>
                      <span className="text-gray-900 font-semibold">{attribute.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Təsvir</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Variants - All volumes including main product */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Həcmlər</h3>
              <div className="space-y-3">
                {/* Main Product as first option */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Volume */}
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">
                          {product.volume || (product.variants && product.variants.length > 0 && product.variants[0]?.volume) || ''}
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
                            <span className="text-lg font-bold text-red-600">
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
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleMainProductQuantityChange('decrease')}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={mainProductQuantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                          {mainProductQuantity}
                        </span>
                        <button
                          onClick={() => handleMainProductQuantityChange('increase')}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={mainProductQuantity >= product.stockCount}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || !product.inStock}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        title={!product.inStock ? 'Stokda yoxdur' : 'Səbətə əlavə et'}
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Stock Info */}
                  <div className="mt-2 text-sm text-gray-600">
                    Stok: {product.stockCount} ədəd
                  </div>
                </div>

                {/* Other Variants */}
                {product.variants && product.variants.length > 0 && product.variants.filter(variant => variant.isActive).map((variant) => (
                    <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
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
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            title={variant.stock === 0 ? 'Stokda yoxdur' : 'Səbətə əlavə et'}
                          >
                            <ShoppingCart className="h-5 w-5" />
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

            {/* Social Sharing */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Paylaş:</span>
                <div className="flex space-x-3">
                  {/* Facebook */}
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="w-10 h-10 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:bg-[#166FE5] transition-colors group"
                    title="Facebook-da paylaş"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  
                  {/* Twitter */}
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="w-10 h-10 bg-[#1DA1F2] text-white rounded-full flex items-center justify-center hover:bg-[#1A91DA] transition-colors group"
                    title="Twitter-də paylaş"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  
                  {/* WhatsApp */}
                  <button 
                    onClick={() => handleShare('whatsapp')}
                    className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#22C55E] transition-colors group"
                    title="WhatsApp-də paylaş"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </button>
                  
                  {/* Telegram */}
                  <button 
                    onClick={() => handleShare('telegram')}
                    className="w-10 h-10 bg-[#0088CC] text-white rounded-full flex items-center justify-center hover:bg-[#0077B3] transition-colors group"
                    title="Telegram-də paylaş"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </button>
                  
                  {/* Native Share */}
                  <button 
                    onClick={() => handleShare('native')}
                    className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors group"
                    title="Paylaş"
                  >
                    <Share2 className="w-5 h-5" />
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
