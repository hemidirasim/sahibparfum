'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentStatus: string
  createdAt: string
  orderItems: OrderItem[]
}

interface OrderItem {
  id: string
  product: {
    name: string
    images: string[]
  }
  quantity: number
  price: number
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Sifarişlər yüklənərkən xəta:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'SHIPPED':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Gözləyir'
      case 'CONFIRMED':
        return 'Təsdiqləndi'
      case 'PROCESSING':
        return 'Hazırlanır'
      case 'SHIPPED':
        return 'Göndərildi'
      case 'DELIVERED':
        return 'Çatdırıldı'
      case 'CANCELLED':
        return 'Ləğv edildi'
      case 'REFUNDED':
        return 'Qaytarıldı'
      default:
        return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/profile"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Profilə qayıt</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sifariş Tarixçəsi</h1>
          <p className="text-gray-600 mt-2">
            Bütün sifarişlərinizin statusunu izləyin
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Hələ sifariş yoxdur</h3>
              <p className="text-gray-600 mb-6">
                İlk sifarişinizi vermək üçün məhsullarımızı kəşf edin
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Məhsulları Gör
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="font-medium text-gray-900">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        #{order.orderNumber}
                      </span>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString('az-AZ')}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-primary-600">
                        {order.totalAmount.toFixed(2)} ₼
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.images[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Miqdar: {item.quantity}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} ₼
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-4 w-4" />
                        <span>
                          {order.paymentStatus === 'PAID' ? 'Ödənildi' : 'Ödənilmədi'}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Ətraflı bax
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
