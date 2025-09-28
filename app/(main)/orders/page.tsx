'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, CheckCircle, Clock, XCircle, X, Eye, Phone, Mail, Star, RefreshCw } from 'lucide-react'
import { ProductRatingModal } from '@/components/products/product-rating-modal'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentStatus: string
  paymentMethod: string
  createdAt: string
  orderItems: OrderItem[]
  shippingAddress?: {
    id: string
    fullName: string
    address: string
    city: string
    postalCode: string
    phone: string
  }
  billingAddress?: {
    id: string
    fullName: string
    address: string
    city: string
    postalCode: string
    phone: string
  }
  notes?: string
  installmentData?: {
    firstName: string
    lastName: string
    fatherName: string
    idCardFront: string
    idCardBack: string
    registrationAddress: string
    actualAddress: string
    cityNumber: string
    familyMembers: Array<{
      name: string
      relationship: string
      phone: string
    }>
    workplace: string
    position: string
    salary: string
  }
}

interface OrderItem {
  id: string
  product: {
    id: string
    name: string
    sku: string
    images: string[]
  }
  productVariant?: {
    volume: string
    sku: string
  }
  quantity: number
  price: number
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean
    product: { id: string; name: string; image: string } | null
  }>({ isOpen: false, product: null })
  const [productRatings, setProductRatings] = useState<Record<string, boolean>>({})
  const [retryingPayment, setRetryingPayment] = useState<string | null>(null)

  // Guest session ID-ni localStorage-dən al və ya yarad
  const getGuestSessionId = () => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('guestSessionId')
      if (!sessionId) {
        sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('guestSessionId', sessionId)
      }
      return sessionId
    }
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

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
        console.log('=== ORDERS FETCHED ===')
        console.log('Orders data:', data)
        data.forEach((order: any, index: number) => {
          console.log(`Order ${index + 1}:`, {
            orderNumber: order.orderNumber,
            paymentMethod: order.paymentMethod,
            installmentData: order.installmentData
          })
        })
        setOrders(data)
        
        // Hər məhsul üçün rating status-unu yoxla (yalnız giriş edən istifadəçilər üçün)
        if (session?.user) {
          const ratingChecks = data.flatMap((order: any) => 
            order.orderItems.map((item: any) => ({
              productId: item.product.id,
              userId: session.user.id
            }))
          )
          
          // Unikal məhsullar üçün rating status yoxla
          const uniqueProducts = Array.from(
            new Set(ratingChecks.map((check: any) => check.productId))
          )
          
          for (const productId of uniqueProducts) {
            try {
              const ratingResponse = await fetch(`/api/products/${productId}/ratings?userId=${session.user.id}`)
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json()
                setProductRatings(prev => ({
                  ...prev,
                  [productId as string]: !!ratingData.userRating
                }))
              }
            } catch (error) {
              console.error(`Rating check failed for product ${productId}:`, error)
            }
          }
        }
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
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'SHIPPED':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'PAYMENT_FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Gözləyir'
      case 'PAID':
        return 'Ödənilib'
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
      case 'PAYMENT_FAILED':
        return 'Ödəniş Uğursuz'
      default:
        return status
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'CARD':
        return 'Kart'
      case 'CASH':
        return 'Nağd'
      case 'BANK_TRANSFER':
        return 'Bank köçürməsi'
      default:
        return method
    }
  }

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const orderDetails = await response.json()
        setSelectedOrder(orderDetails)
        setShowOrderModal(true)
      }
    } catch (error) {
      console.error('Sifariş detalları yüklənərkən xəta:', error)
    }
  }

  const handleRateProduct = (product: any) => {
    if (!session?.user) {
      toast.error('Rəy yazmaq üçün giriş edin')
      return
    }
    
    const imageSrc = getImageSrc(product.images)
    setRatingModal({
      isOpen: true,
      product: {
        id: product.id,
        name: product.name,
        image: imageSrc
      }
    })
  }

  const handleRetryPayment = async (orderId: string) => {
    setRetryingPayment(orderId)
    try {
      console.log('=== PAYMENT RETRY START ===')
      console.log('Starting payment retry for order:', orderId)
      
      const requestBody = {
        orderId: orderId,
        retry: true,
        source: 'orders' // Specify that payment is initiated from orders page
      }
      
      console.log('Request body:', requestBody)
      console.log('Request URL:', '/api/payment/united-payment')
      
      const response = await fetch(`/api/payment/united-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('=== PAYMENT API RESPONSE ===')
      console.log('Response status:', response.status)
      console.log('Response statusText:', response.statusText)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      let data
      try {
        data = await response.json()
        console.log('Response JSON data:', data)
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError)
        const textResponse = await response.text()
        console.log('Response as text:', textResponse)
        throw new Error(`Invalid JSON response: ${textResponse}`)
      }

      if (response.ok && data.paymentUrl) {
        console.log('=== PAYMENT SUCCESS ===')
        console.log('Redirecting to payment URL:', data.paymentUrl)
        // Redirect to payment page
        window.location.href = data.paymentUrl
      } else {
        console.error('=== PAYMENT FAILED ===')
        console.error('Payment redirect failed:', {
          responseOk: response.ok,
          hasPaymentUrl: !!data.paymentUrl,
          data: data,
          error: data.error,
          details: data.details,
          message: data.message
        })
        toast.error(data.details || data.message || 'Ödəniş səhifəsinə yönləndirilmədi')
      }
    } catch (error) {
      console.error('=== PAYMENT ERROR ===')
      console.error('Payment retry error:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      toast.error('Ödəniş yenidən cəhdində xəta baş verdi')
    } finally {
      setRetryingPayment(null)
      console.log('=== PAYMENT RETRY END ===')
    }
  }

  // Check if order can be retried (unpaid orders)
  const canRetryPayment = (order: Order) => {
    return order.paymentStatus === 'PENDING' || 
           order.paymentStatus === 'FAILED' ||
           order.paymentStatus === 'CANCELLED'
  }

  const getImageSrc = (images: string[] | string) => {
    console.log('getImageSrc received:', images, 'type:', typeof images)
    
    if (!images) {
      console.log('No images, returning placeholder')
      return '/placeholder-product.jpg'
    }
    
    let firstImage: string = ''
    
    // Handle different input types
    if (typeof images === 'string') {
      // Try to parse as JSON array first
      try {
        const parsed = JSON.parse(images)
        if (Array.isArray(parsed) && parsed.length > 0) {
          firstImage = parsed[0]
          console.log('Parsed JSON array, first image:', firstImage)
        } else {
          // If not an array, treat as single image URL
          firstImage = images
          console.log('Single string image:', firstImage)
        }
      } catch (error) {
        // If JSON parse fails, treat as single image URL
        firstImage = images
        console.log('JSON parse failed, treating as single URL:', firstImage)
      }
    } else if (Array.isArray(images)) {
      if (images.length === 0) {
        console.log('Empty array, returning placeholder')
        return '/placeholder-product.jpg'
      }
      firstImage = images[0]
      console.log('Array input, first image:', firstImage)
    } else {
      console.log('Unknown input type, returning placeholder')
      return '/placeholder-product.jpg'
    }
    
    // Validate the image
    if (!firstImage || firstImage.trim() === '' || firstImage === 'h' || firstImage.length < 3) {
      console.log('Invalid image, returning placeholder')
      return '/placeholder-product.jpg'
    }
    
    // Check if it's a valid URL
    if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
      console.log('Valid URL:', firstImage)
      return firstImage
    }
    
    // Check if it starts with slash
    if (firstImage.startsWith('/')) {
      console.log('Absolute path:', firstImage)
      return firstImage
    }
    
    // If it's a relative path, add leading slash
    const result = `/${firstImage}`
    console.log('Relative path result:', result)
    return result
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
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img
                              src={getImageSrc(item.product.images)}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Image load error for:', e.currentTarget.src)
                                e.currentTarget.style.display = 'none'
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                                if (placeholder) {
                                  placeholder.style.display = 'contents'
                                }
                              }}
                              onLoad={(e) => {
                                console.log('Image loaded successfully:', item.product.name)
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                                if (placeholder) {
                                  placeholder.style.display = 'none'
                                }
                              }}
                            />
                            <div 
                              className="absolute inset-0 bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium"
                              style={{ display: 'none' }}
                            >
                              <div className="text-center">
                                <div className="text-gray-400 mb-1">
                                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>Şəkil yoxdur</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                            {item.productVariant && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({item.productVariant.volume})
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Miqdar: {item.quantity}
                            {item.productVariant && (
                              <span className="ml-2">• SKU: {item.productVariant.sku}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} ₼
                          </p>
                          {order.status === 'DELIVERED' && !productRatings[item.product.id] && (
                            <button
                              onClick={() => handleRateProduct(item.product)}
                              className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <Star className="w-3 h-3 mr-1" />
                              Qiymətləndir
                            </button>
                          )}
                          {order.status === 'DELIVERED' && productRatings[item.product.id] && (
                            <div className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Qiymətləndirilmiş
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center space-x-3">
                      {canRetryPayment(order) && (
                        <button
                          onClick={() => handleRetryPayment(order.id)}
                          disabled={retryingPayment === order.id}
                          className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {retryingPayment === order.id ? (
                            <>
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              <span>Yönləndirilir...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3" />
                              <span>Ödənişi Tamamla</span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => fetchOrderDetails(order.id)}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ətraflı bax</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sifariş Detalları - {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Sifariş Məlumatları</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sifariş Nömrəsi:</span>
                        <span className="font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tarix:</span>
                        <span className="font-medium">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('az-AZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(selectedOrder.status)}
                          <span className="font-medium">{getStatusText(selectedOrder.status)}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ödəniş Statusu:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedOrder.paymentStatus === 'PAID' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedOrder.paymentStatus === 'PAID' ? 'Ödənildi' : 'Ödənilmədi'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ödəniş Üsulu:</span>
                        <span className="font-medium">{getPaymentMethodText(selectedOrder.paymentMethod)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ümumi Məbləğ:</span>
                        <span className="font-bold text-lg">{selectedOrder.totalAmount.toFixed(2)} ₼</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Müştəri Məlumatları</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{session?.user?.email}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Müştəri: <span className="font-medium">{session?.user?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {(selectedOrder.shippingAddress || selectedOrder.billingAddress) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedOrder.shippingAddress && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <MapPin className="h-5 w-5 mr-2" />
                          Çatdırılma Ünvanı
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">{selectedOrder.shippingAddress.fullName}</div>
                          <div>{selectedOrder.shippingAddress.address}</div>
                          <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</div>
                          <div className="flex items-center mt-2">
                            <Phone className="h-3 w-3 text-gray-400 mr-1" />
                            {selectedOrder.shippingAddress.phone}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedOrder.billingAddress && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <CreditCard className="h-5 w-5 mr-2" />
                          Faktura Ünvanı
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">{selectedOrder.billingAddress.fullName}</div>
                          <div>{selectedOrder.billingAddress.address}</div>
                          <div>{selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.postalCode}</div>
                          <div className="flex items-center mt-2">
                            <Phone className="h-3 w-3 text-gray-400 mr-1" />
                            {selectedOrder.billingAddress.phone}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Sifariş Edilən Məhsullar
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 flex-shrink-0 relative">
                            <img
                              src={getImageSrc(item.product.images)}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                console.log('Modal image load error for:', e.currentTarget.src)
                                e.currentTarget.style.display = 'none'
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                                if (placeholder) {
                                  placeholder.style.display = 'contents'
                                }
                              }}
                              onLoad={(e) => {
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                                if (placeholder) {
                                  placeholder.style.display = 'none'
                                }
                              }}
                            />
                            <div 
                              className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 font-medium"
                              style={{ display: 'none' }}
                            >
                              <div className="text-center">
                                <div className="text-gray-400 mb-1">
                                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>Şəkil yoxdur</div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.product.name}
                              {item.productVariant && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({item.productVariant.volume})
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.productVariant?.sku || item.product.sku}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.quantity} ədəd</div>
                          <div className="text-sm text-gray-500">{item.price.toFixed(2)} ₼</div>
                          <div className="font-semibold">{(item.price * item.quantity).toFixed(2)} ₼</div>
                          {selectedOrder?.status === 'DELIVERED' && !productRatings[item.product.id] && (
                            <button
                              onClick={() => handleRateProduct(item.product)}
                              className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <Star className="w-3 h-3 mr-1" />
                              Qiymətləndir
                            </button>
                          )}
                          {selectedOrder?.status === 'DELIVERED' && productRatings[item.product.id] && (
                            <div className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Qiymətləndirilmiş
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Ümumi Məbləğ:</span>
                      <span>{selectedOrder.totalAmount.toFixed(2)} ₼</span>
                    </div>
                  </div>
                </div>

                {/* Installment Data */}
                {selectedOrder.paymentMethod === 'HISSELI' && selectedOrder.installmentData && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Hissəli Ödəniş Məlumatları
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-blue-800">Ad, Soyad, Ata adı:</label>
                          <p className="text-blue-900">{selectedOrder.installmentData.firstName} {selectedOrder.installmentData.lastName} {selectedOrder.installmentData.fatherName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-blue-800">Qeydiyyat ünvanı:</label>
                          <p className="text-blue-900">{selectedOrder.installmentData.registrationAddress}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-blue-800">Faktiki yaşayış ünvanı:</label>
                          <p className="text-blue-900">{selectedOrder.installmentData.actualAddress}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-blue-800">Şəhər nömrəsi:</label>
                          <p className="text-blue-900">{selectedOrder.installmentData.cityNumber}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-blue-800">İş yeri:</label>
                          <p className="text-blue-900">{selectedOrder.installmentData.workplace}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-blue-800">Vəzifə:</label>
                          <p className="text-blue-900">{selectedOrder.installmentData.position}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-blue-800">Maaş:</label>
                          <p className="text-blue-900">{selectedOrder.installmentData.salary}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Family Members */}
                    {selectedOrder.installmentData.familyMembers && selectedOrder.installmentData.familyMembers.length > 0 && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-blue-800 block mb-2">Ailə üzvləri:</label>
                        <div className="space-y-2">
                          {selectedOrder.installmentData.familyMembers.map((member, index) => (
                            <div key={index} className="bg-white p-3 rounded border border-blue-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div><strong>Ad:</strong> {member.name}</div>
                                <div><strong>Qohumluq:</strong> {member.relationship}</div>
                                <div><strong>Telefon:</strong> {member.phone}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* ID Card Images */}
                    <div className="mt-4">
                      <label className="text-sm font-medium text-blue-800 block mb-2">Şəxsiyyət vəsiqəsi:</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedOrder.installmentData.idCardFront && (
                          <div>
                            <label className="text-xs text-blue-700 block mb-1">Ön tərəf:</label>
                            <img 
                              src={selectedOrder.installmentData.idCardFront} 
                              alt="ID Card Front" 
                              className="w-full h-32 object-cover rounded border border-blue-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                                if (placeholder) {
                                  placeholder.style.display = 'flex'
                                }
                              }}
                            />
                            <div 
                              className="w-full h-32 bg-gray-100 rounded border border-blue-200 flex items-center justify-center text-xs text-gray-500"
                              style={{ display: 'none' }}
                            >
                              Şəkil yüklənmədi
                            </div>
                          </div>
                        )}
                        {selectedOrder.installmentData.idCardBack && (
                          <div>
                            <label className="text-xs text-blue-700 block mb-1">Arxa tərəf:</label>
                            <img 
                              src={selectedOrder.installmentData.idCardBack} 
                              alt="ID Card Back" 
                              className="w-full h-32 object-cover rounded border border-blue-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                                if (placeholder) {
                                  placeholder.style.display = 'flex'
                                }
                              }}
                            />
                            <div 
                              className="w-full h-32 bg-gray-100 rounded border border-blue-200 flex items-center justify-center text-xs text-gray-500"
                              style={{ display: 'none' }}
                            >
                              Şəkil yüklənmədi
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Qeydlər</h3>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Bağla
                  </button>
                  <button
                    onClick={() => {
                      // Print or export functionality
                      window.print()
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Çap Et
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {ratingModal.product && (
          <ProductRatingModal
            isOpen={ratingModal.isOpen}
            onClose={() => setRatingModal({ isOpen: false, product: null })}
            product={ratingModal.product}
            onRatingSubmit={() => {
              // Rating status-u yenilə
              if (ratingModal.product) {
                setProductRatings(prev => ({
                  ...prev,
                  [ratingModal.product!.id]: true
                }))
              }
              toast.success('Qiymətləndirməniz uğurla göndərildi!')
            }}
          />
        )}
      </div>
    </div>
  )
}
