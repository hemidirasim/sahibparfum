'use client'

import { useCart } from '@/hooks/use-cart'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Truck, User, Mail, Phone, MapPin } from 'lucide-react'

export default function GuestCheckoutPage() {
  const { items, getTotal, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    shippingAddress: {
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Azerbaijan',
      phone: ''
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Azerbaijan',
      phone: ''
    },
    useSameAddress: true,
    paymentMethod: 'CASH',
    notes: ''
  })

  const subtotal = getTotal()
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + shipping

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (type: 'shipping' | 'billing', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Address`]: {
        ...prev[`${type}Address` as keyof typeof prev] as any,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        orderItems: items.map(item => {
          // Extract productId from item.id if it contains variant info
          let productId = item.productId || item.id
          let productVariantId = item.productVariantId || null
          
          // If item.id contains variant info (format: productId-variantId)
          if (item.id.includes('-') && !item.productId) {
            const parts = item.id.split('-')
            if (parts.length >= 2) {
              productId = parts[0]
              productVariantId = parts.slice(1).join('-')
            }
          }
          
          return {
            productId,
            productVariantId,
            quantity: item.quantity,
            price: item.price
          }
        }),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.useSameAddress ? formData.shippingAddress : formData.billingAddress
      }

      const response = await fetch('/api/orders/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        clearCart()
        router.push(`/order-success?orderId=${result.orderNumber}`)
      } else {
        const error = await response.json()
        alert('Xəta: ' + (error.message || 'Sifariş yaradılarkən xəta baş verdi'))
      }
    } catch (error) {
      console.error('Sifariş xətası:', error)
      alert('Sifariş yaradılarkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Qeydiyyatsız Sifariş</h1>
          <p className="text-gray-600 mt-2">
            Sifarişinizi tamamlamaq üçün məlumatlarınızı doldurun
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Guest Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Şəxsi Məlumatlar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guestName}
                    onChange={(e) => handleInputChange('guestName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.guestEmail}
                    onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.guestPhone}
                    onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Çatdırılma Ünvanı
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.firstName}
                    onChange={(e) => handleAddressChange('shipping', 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.lastName}
                    onChange={(e) => handleAddressChange('shipping', 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ünvan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.address1}
                    onChange={(e) => handleAddressChange('shipping', 'address1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ünvan 2 (İstəyə görə)
                  </label>
                  <input
                    type="text"
                    value={formData.shippingAddress.address2}
                    onChange={(e) => handleAddressChange('shipping', 'address2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şəhər *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rayon
                  </label>
                  <input
                    type="text"
                    value={formData.shippingAddress.state}
                    onChange={(e) => handleAddressChange('shipping', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poçt Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.postalCode}
                    onChange={(e) => handleAddressChange('shipping', 'postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ölkə *
                  </label>
                  <select
                    required
                    value={formData.shippingAddress.country}
                    onChange={(e) => handleAddressChange('shipping', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Azerbaijan">Azərbaycan</option>
                    <option value="Turkey">Türkiyə</option>
                    <option value="Georgia">Gürcüstan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Faktura Ünvanı
                </h2>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.useSameAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, useSameAddress: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Çatdırılma ünvanı ilə eyni</span>
                </label>
              </div>
              
              {!formData.useSameAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.billingAddress.firstName}
                      onChange={(e) => handleAddressChange('billing', 'firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.billingAddress.lastName}
                      onChange={(e) => handleAddressChange('billing', 'lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ünvan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.billingAddress.address1}
                      onChange={(e) => handleAddressChange('billing', 'address1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şəhər *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.billingAddress.city}
                      onChange={(e) => handleAddressChange('billing', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poçt Kodu *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.billingAddress.postalCode}
                      onChange={(e) => handleAddressChange('billing', 'postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Ödəniş Metodu
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={formData.paymentMethod === 'CASH'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Nağd ödəniş (çatdırılma zamanı)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={formData.paymentMethod === 'CARD'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Kart ilə ödəniş</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Əlavə Qeydlər</h2>
              
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Sifarişinizlə bağlı əlavə qeydlər..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
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
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Ümumi:</span>
                    <span>{total.toFixed(2)} ₼</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Məhsullar:</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} ₼
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sifariş Göndərilir...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Sifarişi Təsdiqlə
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
