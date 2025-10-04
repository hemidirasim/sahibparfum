'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, Download, Eye, Edit, RefreshCw, X, MapPin, Phone, Mail, CreditCard, Package, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  orderNumber: string
  customer: string
  email: string
  phone?: string
  status: string
  paymentStatus: string
  paymentMethod: string
  amount: number
  itemCount: number
  transactionId?: number
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      sku: string
      image: string
    }
  }[]
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
  createdAt: string
  updatedAt: string
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getImageSrc = (image: string) => {
    if (!image || image.trim() === '') {
      return '/placeholder-product.jpg'
    }
    
    // Check if it's a valid URL
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    
    // Check if it starts with slash
    if (image.startsWith('/')) {
      return image
    }
    
    // If it's a relative path, add leading slash
    return `/${image}`
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/sahib-admin-2024/login')
      return
    }

    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/sahib-admin-2024/orders')
      if (response.ok) {
        const data = await response.json()
        console.log('=== ADMIN ORDERS FETCHED ===')
        console.log('Admin orders data:', data.orders)
        data.orders.forEach((order: any, index: number) => {
          console.log(`Admin Order ${index + 1}:`, {
            orderNumber: order.orderNumber,
            paymentMethod: order.paymentMethod,
            installmentData: order.installmentData
          })
        })
        setOrders(data.orders || [])
      } else {
        console.error('Failed to fetch orders')
        setOrders([])
      }
    } catch (error) {
      console.error('Orders fetch error:', error)
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sahib-admin-2024/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Sifariş statusu uğurla yeniləndi!')
        fetchOrders()
      } else {
        toast.error('Sifariş statusu yenilənmədi!')
      }
    } catch (error) {
      console.error('Order status update error:', error)
      toast.error('Xəta baş verdi!')
    }
  }

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      const response = await fetch(`/api/sahib-admin-2024/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      })

      if (response.ok) {
        toast.success('Ödəniş statusu uğurla yeniləndi!')
        fetchOrders()
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus })
        }
      } else {
        toast.error('Ödəniş statusu yenilənmədi!')
      }
    } catch (error) {
      console.error('Payment status update error:', error)
      toast.error('Xəta baş verdi!')
    }
  }

  const checkPaymentStatus = async (order: Order) => {
    try {
      toast.loading('Ödəniş statusu yoxlanılır...')
      
      // Use order ID to check payment status (more reliable)
      const response = await fetch('/api/payment/check-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.orderNumber })
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          // Use the status from the API response
          const mappedStatus = result.orderStatus
          const mappedPaymentStatus = result.paymentStatus

          // Update order status
          const updateResponse = await fetch(`/api/sahib-admin-2024/orders/${order.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              status: mappedStatus,
              paymentStatus: mappedPaymentStatus
            }),
          })

          if (updateResponse.ok) {
            toast.success(`Ödəniş statusu yoxlandı: ${result.orderStatus}`)
            fetchOrders()
          } else {
            toast.error('Status yoxlandı amma yenilənmədi!')
          }
        } else {
          toast.error('Ödəniş statusu yoxlanılmadı!')
        }
      } else {
        toast.error('Ödəniş statusu yoxlanılmadı!')
      }
    } catch (error) {
      console.error('Payment status check error:', error)
      toast.error('Xəta baş verdi!')
    }
  }

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/sahib-admin-2024/orders/${orderId}`)
      if (response.ok) {
        const orderDetails = await response.json()
        setSelectedOrder(orderDetails)
        setShowOrderModal(true)
      } else {
        toast.error('Sifariş məlumatları yüklənmədi!')
      }
    } catch (error) {
      console.error('Order details fetch error:', error)
      toast.error('Xəta baş verdi!')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
        return 'bg-orange-100 text-orange-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'PAYMENT_FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Gözləyir'
      case 'CONFIRMED':
        return 'Təsdiqlənib'
      case 'PROCESSING':
        return 'İşlənir'
      case 'SHIPPED':
        return 'Göndərildi'
      case 'DELIVERED':
        return 'Çatdırıldı'
      case 'CANCELLED':
        return 'Ləğv edildi'
      case 'PAYMENT_FAILED':
        return 'Ödəniş Uğursuz'
      default:
        return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Ödənilib'
      case 'COMPLETED':
        return 'Ödənilib'
      case 'PENDING':
        return 'Gözləyir'
      case 'FAILED':
        return 'Uğursuz'
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    const matchesPaymentStatus = paymentStatusFilter === 'ALL' || order.paymentStatus === paymentStatusFilter
    
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sifarişlər</h1>
              <p className="text-gray-600 mt-1">
                Bütün sifarişləri idarə edin
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sifarişlər</h1>
            <p className="text-gray-600 mt-1">
              Bütün sifarişləri idarə edin və statuslarını yeniləyin
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchOrders}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yenilə
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Sifariş nömrəsi, müştəri, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Bütün Statuslar</option>
              <option value="PENDING">Gözləyir</option>
              <option value="CONFIRMED">Təsdiqlənib</option>
              <option value="PROCESSING">İşlənir</option>
              <option value="SHIPPED">Göndərildi</option>
              <option value="DELIVERED">Çatdırıldı</option>
              <option value="CANCELLED">Ləğv edildi</option>
              <option value="PAYMENT_FAILED">Ödəniş Uğursuz</option>
            </select>
          </div>

          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Bütün Ödəniş Statusları</option>
              <option value="PAID">Ödənilib</option>
              <option value="COMPLETED">Ödənilib</option>
              <option value="PENDING">Gözləyir</option>
              <option value="FAILED">Uğursuz</option>
            </select>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Ümumi: <span className="font-semibold">{filteredOrders.length}</span> sifariş
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sifariş tapılmadı</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'ALL' || paymentStatusFilter !== 'ALL' 
              ? 'Axtarış kriteriyalarınıza uyğun sifariş tapılmadı.'
              : 'Hələ heç bir sifariş yoxdur.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sifariş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müştəri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Məbləğ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ödəniş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarix
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.itemCount} məhsul
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.email}
                        </div>
                        {order.phone && (
                          <div className="text-sm text-gray-500">
                            {order.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.amount.toLocaleString()} ₼
                      </div>
                      <div className="text-sm text-gray-500">
                        {getPaymentMethodText(order.paymentMethod)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${getStatusColor(order.status)}`}
                      >
                        <option value="PENDING">Gözləyir</option>
                        <option value="CONFIRMED">Təsdiqlənib</option>
                        <option value="PROCESSING">İşlənir</option>
                        <option value="SHIPPED">Göndərildi</option>
                        <option value="DELIVERED">Çatdırıldı</option>
                        <option value="CANCELLED">Ləğv edildi</option>
                        <option value="PAYMENT_FAILED">Ödəniş Uğursuz</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        <option value="PENDING">Gözləyir</option>
                        <option value="PAID">Ödənilib</option>
                        <option value="COMPLETED">Ödənilib</option>
                        <option value="FAILED">Uğursuz</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('az-AZ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => checkPaymentStatus(order)}
                          className="p-1 text-green-600 hover:text-green-900"
                          title="Ödəniş statusunu yoxla"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => fetchOrderDetails(order.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Detalları gör"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ödəniş Statusu:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                        {getPaymentStatusText(selectedOrder.paymentStatus)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ödəniş Üsulu:</span>
                      <span className="font-medium">{getPaymentMethodText(selectedOrder.paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ümumi Məbləğ:</span>
                      <span className="font-bold text-lg">{selectedOrder.amount.toLocaleString()} ₼</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Müştəri Məlumatları</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{selectedOrder.email}</span>
                    </div>
                    {selectedOrder.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{selectedOrder.phone}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      Müştəri: <span className="font-medium">{selectedOrder.customer}</span>
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
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={getImageSrc(item.product.image)}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
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
                            className="absolute inset-0 bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium"
                            style={{ display: 'none' }}
                          >
                            <div className="text-center">
                              <div className="text-gray-400 mb-1">
                                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="text-xs">Yoxdur</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {item.product.sku}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.quantity} ədəd</div>
                        <div className="text-sm text-gray-500">{item.price.toLocaleString()} ₼</div>
                        <div className="font-semibold">{(item.price * item.quantity).toLocaleString()} ₼</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Ümumi Məbləğ:</span>
                    <span>{selectedOrder.amount.toLocaleString()} ₼</span>
                  </div>
                </div>
              </div>

              {/* Installment Data */}
              {(() => {
                console.log('=== ADMIN INSTALLMENT DATA CHECK ===')
                console.log('Payment Method:', selectedOrder.paymentMethod)
                console.log('Installment Data:', selectedOrder.installmentData)
                console.log('Should show installment data:', selectedOrder.paymentMethod === 'HISSELI' && selectedOrder.installmentData)
                return null
              })()}
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
                  onClick={() => checkPaymentStatus(selectedOrder)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  title="Ödəniş statusunu yoxla"
                >
                  <CheckCircle className="h-4 w-4" />
                  Ödəniş Statusunu Yoxla
                </button>
                <button
                  onClick={() => {
                    // Print or export functionality
                    window.print()
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Çap Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
