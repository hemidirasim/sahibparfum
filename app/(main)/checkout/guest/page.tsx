'use client'

import { useCart } from '@/hooks/use-cart'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Truck, User, Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

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
      phone: ''
    },
    useSameAddress: true,
    paymentMethod: 'CASH',
    installment: null as number | null,
    notes: ''
  })
  const [settings, setSettings] = useState({
    deliveryCost: 10,
    freeDeliveryThreshold: 100
  })
  const [hisseliForm, setHisseliForm] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    idCardFront: null as File | null,
    idCardBack: null as File | null,
    idCardFrontUrl: '',
    idCardBackUrl: '',
    registrationAddress: '',
    actualAddress: '',
    contactNumber: '',
    familyMembers: [
      { name: '', relationship: '', phone: '' },
      { name: '', relationship: '', phone: '' },
      { name: '', relationship: '', phone: '' }
    ],
    workplace: '',
    position: '',
    salary: ''
  })
  const [uploadStatus, setUploadStatus] = useState({
    front: 'idle' as 'idle' | 'uploading' | 'uploaded' | 'error',
    back: 'idle' as 'idle' | 'uploading' | 'uploaded' | 'error'
  })

  const subtotal = getTotal()
  const shipping = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryCost
  const total = subtotal + shipping

  // File upload function
  const handleFileUpload = async (file: File, type: 'front' | 'back') => {
    if (!file) return

    // Client-side validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Fayl ölçüsü 10MB-dan böyük ola bilməz')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Yalnız şəkil faylları yükləyə bilərsiniz')
      return
    }

    setUploadStatus(prev => ({ ...prev, [type]: 'uploading' }))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        const imageUrl = data.url

        if (type === 'front') {
          setHisseliForm(prev => ({ ...prev, idCardFrontUrl: imageUrl }))
        } else {
          setHisseliForm(prev => ({ ...prev, idCardBackUrl: imageUrl }))
        }

        setUploadStatus(prev => ({ ...prev, [type]: 'uploaded' }))
        toast.success('Şəkil uğurla yükləndi')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || `Upload failed with status ${response.status}`)
      }
    } catch (error) {
      console.error('File upload error:', error)
      setUploadStatus(prev => ({ ...prev, [type]: 'error' }))
      
      if (error instanceof Error) {
        if (error.message.includes('413')) {
          toast.error('Fayl çox böyükdür. Maksimum 10MB olmalıdır.')
        } else if (error.message.includes('401')) {
          toast.error('Giriş tələb olunur. Zəhmət olmasa yenidən giriş edin.')
        } else if (error.message.includes('400')) {
          toast.error('Fayl formatı dəstəklənmir. Yalnız şəkil faylları qəbul edilir.')
        } else {
          toast.error('Şəkil yüklənərkən xəta baş verdi')
        }
      } else {
        toast.error('Şəkil yüklənərkən xəta baş verdi')
      }
    }
  }

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
          console.log('Guest Checkout: Settings loaded:', data)
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
        shippingAddress: {
          ...formData.shippingAddress,
          country: 'Azerbaijan' // Default country for Azerbaijan
        },
        billingAddress: formData.useSameAddress ? {
          ...formData.shippingAddress,
          country: 'Azerbaijan'
        } : {
          ...formData.billingAddress,
          country: 'Azerbaijan'
        }
      }

      // Add installment data if payment method is HISSELI
      if (formData.paymentMethod === 'HISSELI') {
        orderData.installmentData = {
          firstName: hisseliForm.firstName,
          lastName: hisseliForm.lastName,
          fatherName: hisseliForm.fatherName,
          idCardFrontUrl: hisseliForm.idCardFrontUrl,
          idCardBackUrl: hisseliForm.idCardBackUrl,
          registrationAddress: hisseliForm.registrationAddress,
          actualAddress: hisseliForm.actualAddress,
          cityNumber: hisseliForm.contactNumber,
          familyMembers: hisseliForm.familyMembers,
          workplace: hisseliForm.workplace,
          position: hisseliForm.position,
          salary: hisseliForm.salary
        }
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
        
        // If payment method is CARD, redirect to United Payment
        if (formData.paymentMethod === 'CARD') {
          try {
            const paymentData = {
              orderId: result.orderNumber,
              amount: total,
              currency: 'AZN',
              description: `Sifariş #${result.orderNumber}`,
              source: 'checkout-guest', // Specify that payment is initiated from guest checkout page
              customerInfo: {
                name: formData.guestName,
                email: formData.guestEmail,
                phone: formData.guestPhone
              }
            }

            console.log('Sending guest payment request:', paymentData)
            const paymentResponse = await fetch('/api/payment/united-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(paymentData),
            })
            
            console.log('Guest payment response status:', paymentResponse.status)

            if (paymentResponse.ok) {
              const paymentResult = await paymentResponse.json()
              console.log('Guest Payment API Response:', paymentResult)
              
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
              console.error('Guest payment creation error:', paymentError)
              
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
            console.error('Guest payment creation error:', paymentError)
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
            const paymentData = {
              orderId: result.orderNumber,
              amount: total,
              currency: 'AZN',
              description: `Sifariş #${result.orderNumber} - ${formData.installment} aylıq taksit`,
              installment: formData.installment,
              source: 'checkout-guest',
              customerInfo: {
                name: formData.guestName,
                email: formData.guestEmail,
                phone: formData.guestPhone
              }
            }

            console.log('Sending guest taksit payment request:', paymentData)
            const paymentResponse = await fetch('/api/payment/united-payment/taksit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(paymentData),
            })
            
            console.log('Guest taksit payment response status:', paymentResponse.status)

            if (paymentResponse.ok) {
              const paymentResult = await paymentResponse.json()
              console.log('Guest Taksit Payment API Response:', paymentResult)
              
              if (paymentResult.isMock) {
                console.log('Mock guest taksit payment - redirecting to:', paymentResult.paymentUrl)
                clearCart()
                toast.success(`Test rejimində ${formData.installment} aylıq taksit ödənişi simulyasiya edilir...`)
                router.push(paymentResult.paymentUrl)
              } else {
                console.log('Real guest taksit payment - redirecting to:', paymentResult.paymentUrl)
                toast.success(`${formData.installment} aylıq taksit ödəniş səhifəsinə yönləndirilirsiniz...`)
                window.location.href = paymentResult.paymentUrl
              }
            } else {
              const paymentError = await paymentResponse.json()
              console.error('Guest taksit payment creation error:', paymentError)
              
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
            console.error('Guest taksit payment creation error:', paymentError)
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
      alert('Sifariş yaradılarkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) {
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      value="HISSELI"
                      checked={formData.paymentMethod === 'HISSELI'}
                      onChange={(e) => {
                        handleInputChange('paymentMethod', e.target.value)
                        setFormData(prev => ({ ...prev, installment: null }))
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Hissəli ödəniş</span>
                  </label>
                </div>

                {/* Hissəli Ödəniş Formu - Sağ tərəfdə */}
                {formData.paymentMethod === 'HISSELI' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Hissəli Ödəniş Məlumatları</h3>
                    
                    <div className="space-y-4">
                      {/* Personal Information */}
                      <div>
                        <h4 className="text-sm font-medium text-green-900 mb-2">Şəxsi Məlumatlar</h4>
                        <div className="grid grid-cols-1 gap-2">
                          <input
                            type="text"
                            placeholder="Ad *"
                            value={hisseliForm.firstName}
                            onChange={(e) => setHisseliForm(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Soyad *"
                            value={hisseliForm.lastName}
                            onChange={(e) => setHisseliForm(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Ata adı *"
                            value={hisseliForm.fatherName}
                            onChange={(e) => setHisseliForm(prev => ({ ...prev, fatherName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* ID Card Images */}
                      <div>
                        <h4 className="text-sm font-medium text-green-900 mb-2">Şəxsiyyət Vəsiqəsi</h4>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Ön tərəf *</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setHisseliForm(prev => ({ ...prev, idCardFront: file }))
                                  handleFileUpload(file, 'front')
                                }
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                              required
                            />
                            {uploadStatus.front === 'uploading' && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
                                <span className="text-xs text-green-600">Yüklənir...</span>
                              </div>
                            )}
                            {uploadStatus.front === 'uploaded' && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                                <span className="text-xs text-green-600">Yükləndi</span>
                              </div>
                            )}
                            {uploadStatus.front === 'error' && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✗</span>
                                </div>
                                <span className="text-xs text-red-600">Xəta</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Arxa tərəf *</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setHisseliForm(prev => ({ ...prev, idCardBack: file }))
                                  handleFileUpload(file, 'back')
                                }
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                              required
                            />
                            {uploadStatus.back === 'uploading' && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
                                <span className="text-xs text-green-600">Yüklənir...</span>
                              </div>
                            )}
                            {uploadStatus.back === 'uploaded' && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                                <span className="text-xs text-green-600">Yükləndi</span>
                              </div>
                            )}
                            {uploadStatus.back === 'error' && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✗</span>
                                </div>
                                <span className="text-xs text-red-600">Xəta</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div>
                        <h4 className="text-sm font-medium text-green-900 mb-2">Ünvan Məlumatları</h4>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Qeydiyyat ünvanı *"
                            value={hisseliForm.registrationAddress}
                            onChange={(e) => setHisseliForm(prev => ({ ...prev, registrationAddress: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Faktiki yaşayış ünvanı *"
                            value={hisseliForm.actualAddress}
                            onChange={(e) => setHisseliForm(prev => ({ ...prev, actualAddress: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Əlaqə nömrəsi *"
                            value={hisseliForm.contactNumber}
                            onChange={(e) => setHisseliForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* Family Members */}
                      <div>
                        <h4 className="text-sm font-medium text-green-900 mb-2">Ailə Üzvləri (3 nəfər)</h4>
                        <div className="space-y-2">
                          {hisseliForm.familyMembers.map((member, index) => (
                            <div key={index} className="grid grid-cols-1 gap-2">
                              <input
                                type="text"
                                placeholder="Ad Soyad *"
                                value={member.name}
                                onChange={(e) => {
                                  const newMembers = [...hisseliForm.familyMembers]
                                  newMembers[index].name = e.target.value
                                  setHisseliForm(prev => ({ ...prev, familyMembers: newMembers }))
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                required
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Qohumluq *"
                                  value={member.relationship}
                                  onChange={(e) => {
                                    const newMembers = [...hisseliForm.familyMembers]
                                    newMembers[index].relationship = e.target.value
                                    setHisseliForm(prev => ({ ...prev, familyMembers: newMembers }))
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                  required
                                />
                                <input
                                  type="text"
                                  placeholder="Telefon *"
                                  value={member.phone}
                                  onChange={(e) => {
                                    const newMembers = [...hisseliForm.familyMembers]
                                    newMembers[index].phone = e.target.value
                                    setHisseliForm(prev => ({ ...prev, familyMembers: newMembers }))
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                  required
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Employment Information */}
                      <div>
                        <h4 className="text-sm font-medium text-green-900 mb-2">İş Məlumatları</h4>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="İş yeri *"
                            value={hisseliForm.workplace}
                            onChange={(e) => setHisseliForm(prev => ({ ...prev, workplace: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            required
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Vəzifə *"
                              value={hisseliForm.position}
                              onChange={(e) => setHisseliForm(prev => ({ ...prev, position: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Maaş *"
                              value={hisseliForm.salary}
                              onChange={(e) => setHisseliForm(prev => ({ ...prev, salary: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                    {[2, 3, 6, 9, 12].map((months) => (
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
                        {((item.salePrice || item.price) * item.quantity).toFixed(2)} ₼
                      </span>
                    </div>
                  ))}
                </div>
              </div>


              <button
                type="submit"
                disabled={loading || (formData.paymentMethod === 'TAKSIT' && !formData.installment) || 
                  (formData.paymentMethod === 'HISSELI' && (
                    !hisseliForm.firstName || !hisseliForm.lastName || !hisseliForm.fatherName ||
                    !hisseliForm.idCardFrontUrl || !hisseliForm.idCardBackUrl ||
                    !hisseliForm.registrationAddress || !hisseliForm.actualAddress || !hisseliForm.contactNumber ||
                    !hisseliForm.familyMembers.every(member => member.name && member.relationship && member.phone) ||
                    !hisseliForm.workplace || !hisseliForm.position || !hisseliForm.salary
                  ))}
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
