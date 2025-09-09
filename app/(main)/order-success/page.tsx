'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sifarişiniz Uğurla Təsdiqləndi!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Sifarişiniz qəbul edildi və emal edilir. Sifariş nömrəniz:
          </p>
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Sifariş Nömrəsi:</p>
              <p className="text-lg font-mono font-semibold text-primary-600">
                {orderId}
              </p>
            </div>
          )}
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Növbəti addımlar:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sifarişiniz təsdiqlənəcək</li>
              <li>• Məhsullar hazırlanacaq</li>
              <li>• Çatdırılma təyin ediləcək</li>
              <li>• Email ilə məlumatlandırılacaqsınız</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              Ana Səhifəyə Qayıt
            </Link>
            
            <Link
              href="/products"
              className="w-full btn btn-outline flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Alış-verişə Davam Et
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Suallarınız üçün bizimlə əlaqə saxlayın:
            </p>
            <p className="text-sm text-gray-500">
              📞 +994 50 123 45 67
            </p>
            <p className="text-sm text-gray-500">
              ✉️ info@sahibparfumeriya.az
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
