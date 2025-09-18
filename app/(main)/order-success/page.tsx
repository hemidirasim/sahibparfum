'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Home, ShoppingBag, XCircle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const paymentStatus = searchParams.get('status')
  const paymentId = searchParams.get('paymentId')
  const transactionId = searchParams.get('transactionId')
  
  const [orderStatus, setOrderStatus] = useState<string>('PENDING')
  const [loading, setLoading] = useState(true)
  const { clearCart } = useCart()

  useEffect(() => {
    if (orderId) {
      // If we have transactionId, check payment status first
      if (transactionId) {
        checkPaymentStatus()
      } else if (paymentStatus) {
        // If we have payment status from URL params, set it immediately
        setOrderStatus(paymentStatus)
        setLoading(false)
        // Clear cart if payment is successful
        if (paymentStatus === 'PAID') {
          clearCart()
        }
      } else {
        // Check order status and also try to get transactionId from order
        checkOrderStatusWithTransaction()
      }
    } else {
      setLoading(false)
    }
  }, [orderId, paymentStatus, transactionId, clearCart])

  const checkPaymentStatus = async () => {
    try {
      console.log('Checking payment status for transactionId:', transactionId)
      const response = await fetch('/api/payment/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId: parseInt(transactionId!) })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Payment status check result:', result)
        
        // Map United Payment status to our order status
        let mappedStatus = 'PENDING'
        if (result.orderStatus === 'APPROVED') {
          mappedStatus = 'PAID'
        } else if (result.orderStatus === 'DECLINED' || result.orderStatus === 'FAILED') {
          mappedStatus = 'PAYMENT_FAILED'
        } else if (result.orderStatus === 'CANCELLED') {
          mappedStatus = 'CANCELLED'
        }

        setOrderStatus(mappedStatus)
        
        // Clear cart if payment is successful
        if (mappedStatus === 'PAID') {
          clearCart()
        }

        // Update order status in database
        await updateOrderStatus(mappedStatus)
      } else {
        console.error('Failed to check payment status')
        checkOrderStatus() // Fallback to checking order status
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      checkOrderStatus() // Fallback to checking order status
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: status,
          paymentStatus: status === 'PAID' ? 'COMPLETED' : status === 'PAYMENT_FAILED' ? 'FAILED' : 'PENDING'
        })
      })

      if (response.ok) {
        console.log('Order status updated successfully')
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const checkOrderStatusWithTransaction = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const order = await response.json()
        const status = order.status || 'PENDING'
        
        // If order has transactionId, check payment status
        if (order.transactionId) {
          console.log('Order has transactionId, checking payment status:', order.transactionId)
          const paymentResponse = await fetch('/api/payment/check-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transactionId: order.transactionId })
          })

          if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json()
            console.log('Payment status check result:', paymentResult)
            
            // Map United Payment status to our order status
            let mappedStatus = status
            if (paymentResult.orderStatus === 'APPROVED') {
              mappedStatus = 'PAID'
            } else if (paymentResult.orderStatus === 'DECLINED' || paymentResult.orderStatus === 'FAILED') {
              mappedStatus = 'PAYMENT_FAILED'
            } else if (paymentResult.orderStatus === 'CANCELLED') {
              mappedStatus = 'CANCELLED'
            }

            setOrderStatus(mappedStatus)
            
            // Update order status in database if different
            if (mappedStatus !== status) {
              await updateOrderStatus(mappedStatus)
            }
            
            // Clear cart if payment is successful
            if (mappedStatus === 'PAID') {
              clearCart()
            }
          } else {
            // Fallback to order status
            setOrderStatus(status)
            if (status === 'PAID') {
              clearCart()
            }
          }
        } else {
          // No transactionId, use order status
          setOrderStatus(status)
          if (status === 'PAID') {
            clearCart()
          }
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkOrderStatus = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const order = await response.json()
        const status = order.status || 'PENDING'
        setOrderStatus(status)
        // Clear cart if payment is successful
        if (status === 'PAID') {
          clearCart()
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = () => {
    switch (orderStatus) {
      case 'PAID':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          title: 'Ödəniş Uğurla Tamamlandı!',
          message: 'Sifarişiniz qəbul edildi və ödəniş təsdiqləndi.',
          bgColor: 'bg-green-50'
        }
      case 'PAYMENT_FAILED':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          title: 'Ödəniş Uğursuz Oldu',
          message: 'Ödəniş zamanı xəta baş verdi. Lütfən yenidən cəhd edin.',
          bgColor: 'bg-red-50'
        }
      case 'PENDING':
        return {
          icon: Clock,
          iconColor: 'text-yellow-600',
          title: 'Sifariş Gözləyir',
          message: 'Sifarişiniz gözləyir. Ödəniş təsdiqləndikdən sonra emal ediləcək.',
          bgColor: 'bg-yellow-50'
        }
      default:
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          title: 'Sifarişiniz Uğurla Təsdiqləndi!',
          message: 'Sifarişiniz qəbul edildi və emal edilir.',
          bgColor: 'bg-green-50'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <StatusIcon className={`mx-auto h-16 w-16 ${statusInfo.iconColor}`} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {statusInfo.title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {statusInfo.message}
          </p>
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Sifariş Nömrəsi:</p>
              <p className="text-lg font-mono font-semibold text-primary-600">
                {orderId}
              </p>
              {paymentId && (
                <p className="text-sm text-gray-600 mt-2">
                  Ödəniş ID: {paymentId}
                </p>
              )}
            </div>
          )}
          
          <div className={`${statusInfo.bgColor} rounded-lg p-4 mb-6`}>
            <h3 className="font-medium text-gray-900 mb-2">Növbəti addımlar:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {orderStatus === 'PAID' ? (
                <>
                  <li>• Sifarişiniz təsdiqləndi</li>
                  <li>• Məhsullar hazırlanacaq</li>
                  <li>• Çatdırılma təyin ediləcək</li>
                  <li>• Email ilə məlumatlandırılacaqsınız</li>
                </>
              ) : orderStatus === 'PAYMENT_FAILED' ? (
                <>
                  <li>• Ödəniş uğursuz oldu</li>
                  <li>• Yenidən ödəniş etməyə çalışın</li>
                  <li>• Kömək üçün bizimlə əlaqə saxlayın</li>
                </>
              ) : (
                <>
                  <li>• Ödəniş gözləyir</li>
                  <li>• Təsdiqləndikdən sonra emal ediləcək</li>
                  <li>• Email ilə məlumatlandırılacaqsınız</li>
                </>
              )}
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
            
            {orderStatus === 'PAYMENT_FAILED' ? (
              <Link
                href="/checkout"
                className="w-full btn btn-outline flex items-center justify-center gap-2"
              >
                <Package className="h-5 w-5" />
                Yenidən Ödəniş Et
              </Link>
            ) : (
              <Link
                href="/products"
                className="w-full btn btn-outline flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Alış-verişə Davam Et
              </Link>
            )}
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
