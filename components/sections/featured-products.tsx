'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import toast from 'react-hot-toast'

const featuredProducts = [
  {
    id: '1',
    name: 'Chanel N°5',
    brand: 'Chanel',
    price: 299.99,
    salePrice: 249.99,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 124,
    sku: 'CHN-001'
  },
  {
    id: '2',
    name: 'Dior Sauvage',
    brand: 'Dior',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=400&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 89,
    sku: 'DIR-002'
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
    sku: 'YSL-003'
  },
  {
    id: '4',
    name: 'Tom Ford Tobacco Vanille',
    brand: 'Tom Ford',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d1a6f6a9?w=400&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 67,
    sku: 'TF-004'
  }
]

export function FeaturedProducts() {
  const { addItem } = useCart()

  const handleAddToCart = (product: typeof featuredProducts[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.image,
      quantity: 1,
      sku: product.sku
    })
    toast.success(`${product.name} səbətə əlavə edildi`)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ən Populyar Məhsullar
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Müştərilərimizin ən çox bəyəndiyi parfümləri kəşf edin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
              <div className="relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.salePrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Endirim
                  </div>
                )}
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="p-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <Link 
                    href={`/products/${product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                </div>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.reviewCount})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-primary-600">
                          {product.salePrice.toFixed(2)} ₼
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.price.toFixed(2)} ₼
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {product.price.toFixed(2)} ₼
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Səbətə Əlavə Et
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="btn btn-primary btn-lg"
          >
            Bütün Məhsulları Gör
          </Link>
        </div>
      </div>
    </section>
  )
}
