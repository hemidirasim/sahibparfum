'use client'

import { useCart } from '@/hooks/use-cart'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CreditCard, Truck } from 'lucide-react'

export function CartSummary() {
  const { items, getTotal } = useCart()
  const { data: session } = useSession()

  const subtotal = getTotal()
  const shipping = subtotal > 100 ? 0 : 10 // Pulsuz çatdırılma 100₼ üzərində
  const total = subtotal + shipping

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Sifariş Xülasəsi
      </h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ara cəm:</span>
          <span className="text-gray-900">{subtotal.toFixed(2)} ₼</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Çatdırılma:</span>
          <span className="text-gray-900">
            {shipping === 0 ? 'Pulsuz' : `${shipping.toFixed(2)} ₼`}
          </span>
        </div>
        
        {shipping > 0 && (
          <div className="text-xs text-gray-500">
            * 100₼ üzərində sifarişlərdə pulsuz çatdırılma
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Ümumi:</span>
            <span>{total.toFixed(2)} ₼</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Sifarişinizə daxildir:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <Truck className="h-4 w-4 mr-2 text-green-600" />
            Pulsuz çatdırılma (100₼ üzərində)
          </li>
          <li className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2 text-green-600" />
            Təhlükəsiz ödəniş
          </li>
          <li className="flex items-center">
            <span className="h-4 w-4 mr-2 text-green-600">✓</span>
            30 gün qaytarma zəmanəti
          </li>
        </ul>
      </div>

      {/* Checkout Button */}
      {session ? (
        <Link
          href="/checkout"
          className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2"
        >
          <CreditCard className="h-5 w-5" />
          Ödənişə Keç
        </Link>
      ) : (
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2"
          >
            Giriş Et və Davam Et
          </Link>
          <Link
            href="/checkout/guest"
            className="w-full btn btn-outline btn-lg flex items-center justify-center gap-2"
          >
            Qeydiyyatsız Davam Et
          </Link>
        </div>
      )}

      {/* Continue Shopping */}
      <div className="mt-4 text-center">
        <Link
          href="/products"
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Alış-verişə davam et
        </Link>
      </div>
    </div>
  )
}
