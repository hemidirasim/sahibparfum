'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import toast from 'react-hot-toast'

// Mock wishlist data
const wishlistItems = [
  {
    id: '1',
    name: 'Chanel N°5',
    brand: 'Chanel',
    price: 299.99,
    salePrice: 249.99,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 124,
    inStock: true
  },
  {
    id: '2',
    name: 'Dior Sauvage',
    brand: 'Dior',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=400&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 89,
    inStock: true
  },
  {
    id: '3',
    name: 'Yves Saint Laurent Black Opium',
    brand: 'YSL',
    price: 159.99,
    salePrice: 129.99,
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 156,
    inStock: false
  }
]

export default function WishlistPage() {
  const { addToCart } = useCart()
  const [items, setItems] = useState(wishlistItems)
  const [loading, setLoading] = useState<string | null>(null)

  const handleAddToCart = async (item: typeof wishlistItems[0]) => {
    try {
      setLoading(item.id)
      addToCart({
        id: item.id,
        name: item.name,
        price: item.salePrice || item.price,
        image: item.image,
        quantity: 1
      })
      toast.success('Məhsul səbətə əlavə edildi')
    } catch (error) {
      toast.error('Səbətə əlavə edilərkən xəta baş verdi')
    } finally {
      setLoading(null)
    }
  }

  const handleRemoveFromWishlist = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
    toast.success('Məhsul favorilərdən silindi')
  }

  const handleMoveAllToCart = async () => {
    try {
      setLoading('all')
      for (const item of items.filter(item => item.inStock)) {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.salePrice || item.price,
          image: item.image,
          quantity: 1
        })
      }
      toast.success('Bütün məhsullar səbətə əlavə edildi')
    } catch (error) {
      toast.error('Səbətə əlavə edilərkən xəta baş verdi')
    } finally {
      setLoading(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="mx-auto h-16 w-16" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Favoriləriniz boşdur
            </h1>
            <p className="text-gray-600 mb-8">
              Sevimli məhsullarınızı favorilərə əlavə edin və sonra burada görə bilərsiniz.
            </p>
            <Link
              href="/products"
              className="btn btn-primary"
            >
              Məhsullara Bax
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Favorilərim ({items.length})
          </h1>
          <p className="text-gray-600">
            Sevimli məhsullarınızı burada saxlayın və istədiyiniz zaman səbətə əlavə edin.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={handleMoveAllToCart}
              disabled={loading === 'all' || !items.some(item => item.inStock)}
              className="btn btn-primary"
            >
              {loading === 'all' ? 'Əlavə edilir...' : 'Hamısını Səbətə Əlavə Et'}
            </button>
          </div>
          
          <Link
            href="/products"
            className="btn btn-outline"
          >
            Məhsullara Qayıt
          </Link>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group"
            >
              <div className="relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.salePrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Endirim
                  </div>
                )}
                <button 
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-500">{item.brand}</p>
                  <Link 
                    href={`/products/${item.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </div>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(item.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({item.reviewCount})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {item.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-primary-600">
                          {item.salePrice.toFixed(2)} ₼
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {item.price.toFixed(2)} ₼
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {item.price.toFixed(2)} ₼
                      </span>
                    )}
                  </div>
                  
                  <span className={`text-sm px-2 py-1 rounded ${
                    item.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.inStock ? 'Stokda var' : 'Stokda yoxdur'}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={loading === item.id || !item.inStock}
                  className={`w-full btn btn-sm flex items-center justify-center gap-2 ${
                    item.inStock ? 'btn-primary' : 'btn-disabled'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {loading === item.id ? 'Əlavə edilir...' : 'Səbətə Əlavə Et'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
