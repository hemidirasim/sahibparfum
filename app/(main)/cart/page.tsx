'use client'

import { CartItems } from '@/components/cart/cart-items'
import { CartSummary } from '@/components/cart/cart-summary'
import { useCart } from '@/hooks/use-cart'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Səbətiniz boşdur
            </h2>
            <p className="text-gray-600 mb-8">
              Səbətinizə məhsul əlavə etmək üçün məhsullar səhifəsinə keçin
            </p>
            <Link
              href="/products"
              className="btn btn-primary btn-lg"
            >
              Məhsulları Kəşf Et
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
          <h1 className="text-3xl font-bold text-gray-900">Səbət</h1>
          <p className="text-gray-600 mt-2">
            Səbətinizdə {items.length} məhsul var
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
