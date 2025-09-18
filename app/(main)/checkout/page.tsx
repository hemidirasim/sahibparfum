'use client'

import { useCart } from '@/hooks/use-cart'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CreditCard, Truck, User, Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [userAddresses, setUserAddresses] = useState<any[]>([])
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Azerbaijan',
    phone: ''
  })
  const [formData, setFormData] = useState({
    shippingAddressId: '',
    billingAddressId: '',
    useSameAddress: true,
    paymentMethod: 'CASH',
    installment: null as number | null,
    notes: ''
  })
  const [settings, setSettings] = useState({
    deliveryCost: 10,
    freeDeliveryThreshold: 100
  })

  const subtotal = getTotal()
  const shipping = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryCost
  const total = subtotal + shipping

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/checkout')
    }
  }, [status, router])

  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const timestamp = Date.now()
        const response = await fetch(`/api/settings?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setSettings({
            deliveryCost: data.deliveryCost || 10,
            freeDeliveryThreshold: data.freeDeliveryThreshold || 100
          })
          console.log('Checkout: Settings loaded:', data)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    fetchSettings()

    // Auto-refresh settings every 30 seconds
    const interval = setInterval(fetchSettings, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load user addresses
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserAddresses()
    }
  }, [session])

  const fetchUserAddresses = async () => {
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/addresses?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const addresses = await response.json()
        setUserAddresses(addresses)
        // Set default addresses if available
        if (addresses.length > 0) {
          setFormData(prev => ({
            ...prev,
            shippingAddressId: addresses[0].id,
            billingAddressId: addresses[0].id
          }))
        }
      } else {
        console.error('Addresses API error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Ünvanlar yüklənərkən xəta:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNewAddressChange = (field: string, value: string) => {
    setNewAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddAddress = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAddress,
          type: 'SHIPPING',
          isDefault: userAddresses.length === 0
        }),
      })

      if (response.ok) {
        const addedAddress = await response.json()
        setUserAddresses(prev => [...prev, addedAddress])
        setFormData(prev => ({
          ...prev,
          shippingAddressId: addedAddress.id,
          billingAddressId: addedAddress.id
        }))
        setShowAddAddress(false)
        setNewAddress({
          firstName: '',
          lastName: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'Azerbaijan',
          phone: ''
        })
        toast.success('Ünvan uğurla əlavə edildi!')
      } else {
        const error = await response.json()
        toast.error('Xəta: ' + (error.message || 'Ünvan əlavə edilərkən xəta baş verdi'))
      }
    } catch (error) {
      console.error('Ünvan əlavə etmə xətası:', error)
      toast.error('Ünvan əlavə edilərkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let shippingAddressId = formData.shippingAddressId
      let billingAddressId = formData.useSameAddress ? formData.shippingAddressId : formData.billingAddressId

      // If no address is selected but we have a new address form, add it first
      if (!shippingAddressId && showAddAddress) {
        const addressResponse = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newAddress,
            type: 'SHIPPING',
            isDefault: userAddresses.length === 0
          }),
        })

        if (addressResponse.ok) {
          const addedAddress = await addressResponse.json()
          shippingAddressId = addedAddress.id
          billingAddressId = formData.useSameAddress ? addedAddress.id : addedAddress.id
          setUserAddresses(prev => [...prev, addedAddress])
        } else {
          throw new Error('Ünvan əlavə edilərkən xəta baş verdi')
        }
      }

      const orderData = {
        userId: session?.user?.id,
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
        shippingAddressId: shippingAddressId,
        billingAddressId: billingAddressId
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        
        // If payment method is CARD, redirect to United Payment
        if (formData.paymentMethod === 'CARD') {
          try {
            const selectedAddress = userAddresses.find(addr => addr.id === shippingAddressId) || newAddress
            
            const paymentData = {
              orderId: result.orderNumber,
              amount: total,
              currency: 'AZN',
              description: `Sifariş #${result.orderNumber}`,
              source: 'checkout', // Specify that payment is initiated from checkout page
              customerInfo: {
                name: session?.user?.name || `${selectedAddress.firstName} ${selectedAddress.lastName}`,
                email: session?.user?.email || '',
                phone: selectedAddress.phone || ''
              }
            }

            console.log('Sending payment request:', paymentData)
            const paymentResponse = await fetch('/api/payment/united-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(paymentData),
            })
            
            console.log('Payment response status:', paymentResponse.status)

            if (paymentResponse.ok) {
              const paymentResult = await paymentResponse.json()
              console.log('Payment API Response:', paymentResult)
              
              if (paymentResult.isMock) {
                console.log('Mock payment - redirecting to:', paymentResult.paymentUrl)
                clearCart()
                toast.success('Test rejimində ödəniş simulyasiya edilir...')
                // For mock payments, redirect directly to success page
                router.push(paymentResult.paymentUrl)
              } else {
                console.log('Real payment - redirecting to:', paymentResult.paymentUrl)
                toast.success('Ödəniş səhifəsinə yönləndirilirsiniz...')
                // Redirect to United Payment (don't clear cart yet, wait for payment completion)
                window.location.href = paymentResult.paymentUrl
              }
            } else {
              const paymentError = await paymentResponse.json()
              console.error('Payment creation error:', paymentError)
              
              if (paymentError.code === 'CONFIG_MISSING' || paymentError.code === 'AUTH_FAILED') {
                toast.error('Ödəniş sistemi hazırda əlçatan deyil. Nağd ödəniş seçin.')
                // Change to cash payment and continue
                setFormData(prev => ({ ...prev, paymentMethod: 'CASH' }))
                clearCart()
                toast.success('Sifarişiniz nağd ödəniş ilə uğurla yaradıldı!')
                router.push(`/order-success?orderId=${result.orderNumber}`)
              } else {
                toast.error('Ödəniş səhifəsinə yönləndirilərkən xəta: ' + (paymentError.message || 'Naməlum xəta'))
                // Still redirect to success page for cash payment
                router.push(`/order-success?orderId=${result.orderNumber}`)
              }
            }
          } catch (paymentError) {
            console.error('Payment creation error:', paymentError)
            toast.error('Ödəniş səhifəsinə yönləndirilərkən xəta')
            // Still redirect to success page for cash payment
            router.push(`/order-success?orderId=${result.orderNumber}`)
          }
        } else if (formData.paymentMethod === 'TAKSIT') {
          // Taksit payment - redirect to United Payment Taksit API
          if (!formData.installment) {
            toast.error('Zəhmət olmasa taksit müddətini seçin')
            return
          }

          try {
            const selectedAddress = userAddresses.find(addr => addr.id === shippingAddressId) || newAddress
            
            const paymentData = {
              orderId: result.orderNumber,
              amount: total,
              currency: 'AZN',
              description: `Sifariş #${result.orderNumber} - ${formData.installment} aylıq taksit`,
              installment: formData.installment,
              source: 'checkout',
              customerInfo: {
                name: session?.user?.name || `${selectedAddress.firstName} ${selectedAddress.lastName}`,
                email: session?.user?.email || '',
                phone: selectedAddress.phone || ''
              }
            }

            console.log('Sending taksit payment request:', paymentData)
            const paymentResponse = await fetch('/api/payment/united-payment/taksit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(paymentData),
            })
            
            console.log('Taksit payment response status:', paymentResponse.status)

            if (paymentResponse.ok) {
              const paymentResult = await paymentResponse.json()
              console.log('Taksit Payment API Response:', paymentResult)
              
              if (paymentResult.isMock) {
                console.log('Mock taksit payment - redirecting to:', paymentResult.paymentUrl)
                clearCart()
                toast.success(`Test rejimində ${formData.installment} aylıq taksit ödənişi simulyasiya edilir...`)
                router.push(paymentResult.paymentUrl)
              } else {
                console.log('Real taksit payment - redirecting to:', paymentResult.paymentUrl)
                toast.success(`${formData.installment} aylıq taksit ödəniş səhifəsinə yönləndirilirsiniz...`)
                window.location.href = paymentResult.paymentUrl
              }
            } else {
              const paymentError = await paymentResponse.json()
              console.error('Taksit payment creation error:', paymentError)
              
              if (paymentError.code === 'CONFIG_MISSING' || paymentError.code === 'AUTH_FAILED') {
                toast.error('Taksit ödəniş sistemi hazırda əlçatan deyil. Nağd ödəniş seçin.')
                setFormData(prev => ({ ...prev, paymentMethod: 'CASH' }))
                clearCart()
                toast.success('Sifarişiniz nağd ödəniş ilə uğurla yaradıldı!')
                router.push(`/order-success?orderId=${result.orderNumber}`)
              } else {
                toast.error('Taksit ödəniş səhifəsinə yönləndirilərkən xəta: ' + (paymentError.message || 'Naməlum xəta'))
                router.push(`/order-success?orderId=${result.orderNumber}`)
              }
            }
          } catch (paymentError) {
            console.error('Taksit payment creation error:', paymentError)
            toast.error('Taksit ödəniş səhifəsinə yönləndirilərkən xəta')
            router.push(`/order-success?orderId=${result.orderNumber}`)
          }
        } else {
          // Cash payment - direct success
          clearCart()
          toast.success('Sifarişiniz uğurla yaradıldı!')
          router.push(`/order-success?orderId=${result.orderNumber}`)
        }
      } else {
        const error = await response.json()
        toast.error('Xəta: ' + (error.message || 'Sifariş yaradılarkən xəta baş verdi'))
      }
    } catch (error) {
      console.error('Sifariş xətası:', error)
      toast.error('Sifariş yaradılarkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sifarişi Tamamla</h1>
          <p className="text-gray-600 mt-2">
            Xoş gəlmisiniz, {session?.user?.name}! Sifarişinizi tamamlamaq üçün məlumatları yoxlayın
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Şəxsi Məlumatlar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={session?.user?.name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
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
              
              <div className="space-y-4">
                {userAddresses.length > 0 && (
                  <div className="space-y-3">
                    {userAddresses.map((address) => (
                      <label key={address.id} className="flex items-start">
                        <input
                          type="radio"
                          name="shippingAddress"
                          value={address.id}
                          checked={formData.shippingAddressId === address.id}
                          onChange={(e) => handleInputChange('shippingAddressId', e.target.value)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {address.firstName} {address.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.address1}
                            {address.address2 && `, ${address.address2}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postalCode}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.country}
                          </div>
                          {address.phone && (
                            <div className="text-sm text-gray-600">
                              {address.phone}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {!showAddAddress ? (
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(true)}
                    className="w-full btn btn-outline flex items-center justify-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Yeni Ünvan Əlavə Et
                  </button>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Ünvan Əlavə Et</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ad *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.firstName}
                            onChange={(e) => handleNewAddressChange('firstName', e.target.value)}
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
                            value={newAddress.lastName}
                            onChange={(e) => handleNewAddressChange('lastName', e.target.value)}
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
                            value={newAddress.address1}
                            onChange={(e) => handleNewAddressChange('address1', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ünvan 2 (İstəyə görə)
                          </label>
                          <input
                            type="text"
                            value={newAddress.address2}
                            onChange={(e) => handleNewAddressChange('address2', e.target.value)}
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
                            value={newAddress.city}
                            onChange={(e) => handleNewAddressChange('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rayon
                          </label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) => handleNewAddressChange('state', e.target.value)}
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
                            value={newAddress.postalCode}
                            onChange={(e) => handleNewAddressChange('postalCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefon
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) => handleNewAddressChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleAddAddress}
                          disabled={loading}
                          className="btn btn-primary flex-1"
                        >
                          {loading ? 'Əlavə edilir...' : 'Ünvanı Əlavə Et'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddAddress(false)}
                          className="btn btn-outline"
                        >
                          Ləğv Et
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
              
              {!formData.useSameAddress && userAddresses.length > 0 && (
                <div className="space-y-3">
                  {userAddresses.map((address) => (
                    <label key={address.id} className="flex items-start">
                      <input
                        type="radio"
                        name="billingAddress"
                        value={address.id}
                        checked={formData.billingAddressId === address.id}
                        onChange={(e) => handleInputChange('billingAddressId', e.target.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {address.firstName} {address.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.address1}
                          {address.address2 && `, ${address.address2}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.postalCode}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.country}
                        </div>
                      </div>
                    </label>
                  ))}
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
                    onChange={(e) => {
                      handleInputChange('paymentMethod', e.target.value)
                      setFormData(prev => ({ ...prev, installment: null }))
                    }}
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
                    onChange={(e) => {
                      handleInputChange('paymentMethod', e.target.value)
                      setFormData(prev => ({ ...prev, installment: null }))
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Kart ilə ödəniş</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="TAKSIT"
                    checked={formData.paymentMethod === 'TAKSIT'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Birbank Taksit</span>
                </label>
              </div>

              {/* Taksit Options */}
              {formData.paymentMethod === 'TAKSIT' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">Taksit Seçimi</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[2, 3, 6, 12].map((months) => (
                      <label key={months} className="flex items-center">
                        <input
                          type="radio"
                          name="installment"
                          value={months}
                          checked={formData.installment === months}
                          onChange={(e) => setFormData(prev => ({ ...prev, installment: parseInt(e.target.value) }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-blue-800">{months} ay</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Taksit ödənişi Birbank kartları üçün mövcuddur
                  </p>
                </div>
              )}
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
                disabled={loading || (!formData.shippingAddressId && !showAddAddress) || (formData.paymentMethod === 'TAKSIT' && !formData.installment)}
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
