'use client'

import { useCart } from '@/hooks/use-cart'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CreditCard, Truck, User, Mail, Phone, MapPin, X } from 'lucide-react'
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
    front: { uploading: false, uploaded: false, error: false },
    back: { uploading: false, uploaded: false, error: false }
  })
  const [settings, setSettings] = useState({
    deliveryCost: 10,
    freeDeliveryThreshold: 100
  })
  const [showHisseliModal, setShowHisseliModal] = useState(false)

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

  const handleFileUpload = async (file: File, type: 'front' | 'back') => {
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      toast.error(`Şəkil çox böyükdür! Fayl ölçüsü: ${fileSizeMB}MB, maksimum: 10MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Yalnız şəkil faylları qəbul edilir (JPG, PNG, WEBP)')
      return
    }

    // Set uploading status
    setUploadStatus(prev => ({
      ...prev,
      [type]: { uploading: true, uploaded: false, error: false }
    }))

    const formData = new FormData()
    formData.append('file', file)

    try {
      toast.loading(`${type === 'front' ? 'Ön' : 'Arxa'} tərəf şəkli yüklənir...`, {
        duration: 2000
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        const imageUrl = result.url || result.imageUrl
        
        
        if (type === 'front') {
          setHisseliForm(prev => ({
            ...prev,
            idCardFrontUrl: imageUrl
          }))
        } else {
          setHisseliForm(prev => ({
            ...prev,
            idCardBackUrl: imageUrl
          }))
        }
        
        // Set success status
        setUploadStatus(prev => ({
          ...prev,
          [type]: { uploading: false, uploaded: true, error: false }
        }))
        
        toast.success(`${type === 'front' ? 'Ön' : 'Arxa'} tərəf şəkli uğurla yükləndi!`)
      } else {
        let errorMessage = 'Naməlum xəta'
        
        try {
          const error = await response.json()
          console.error(`Upload failed for ${type}:`, error)
          errorMessage = error.message || error.error || errorMessage
          
          // Handle specific error cases
          if (response.status === 413) {
            errorMessage = 'Şəkil çox böyükdür! Maksimum 10MB ola bilər.'
          } else if (response.status === 401) {
            errorMessage = 'Giriş tələb olunur. Zəhmət olmasa yenidən daxil olun.'
          } else if (response.status === 400) {
            errorMessage = error.details || errorMessage
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError)
          
          // Handle specific HTTP status codes
          if (response.status === 413) {
            errorMessage = 'Şəkil çox böyükdür! Maksimum 10MB ola bilər.'
          } else if (response.status === 401) {
            errorMessage = 'Giriş tələb olunur. Zəhmət olmasa yenidən daxil olun.'
          } else if (response.status === 400) {
            errorMessage = 'Şəkil formatı düzgün deyil. Yalnız şəkil faylları qəbul edilir.'
          } else {
            errorMessage = `Server xətası (${response.status}). Zəhmət olmasa yenidən cəhd edin.`
          }
        }
        
        // Set error status
        setUploadStatus(prev => ({
          ...prev,
          [type]: { uploading: false, uploaded: false, error: true }
        }))
        
        toast.error('Şəkil yüklənərkən xəta: ' + errorMessage)
      }
    } catch (error) {
      console.error('File upload error:', error)
      
      // Set error status
      setUploadStatus(prev => ({
        ...prev,
        [type]: { uploading: false, uploaded: false, error: true }
      }))
      
      toast.error('Şəkil yüklənərkən xəta baş verdi')
    }
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
        billingAddressId: billingAddressId,
        // Add installment data if payment method is HISSELI
        ...(formData.paymentMethod === 'HISSELI' && {
          installmentData: {
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
        })
      }

      
      // Validate order data before sending
      if (!orderData.userId) {
        console.error('Missing userId in order data')
        toast.error('User ID is missing. Please login again.')
        return
      }
      
      if (!orderData.orderItems || orderData.orderItems.length === 0) {
        console.error('No order items')
        toast.error('No items in cart')
        return
      }
      
      if (!orderData.shippingAddressId) {
        console.error('No shipping address selected')
        toast.error('Please select a shipping address')
        return
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

            const paymentResponse = await fetch('/api/payment/united-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(paymentData),
            })
            

            if (paymentResponse.ok) {
              const paymentResult = await paymentResponse.json()
              
              if (paymentResult.isMock) {
                clearCart()
                toast.success('Test rejimində ödəniş simulyasiya edilir...')
                // For mock payments, redirect directly to success page
                router.push(paymentResult.paymentUrl)
              } else {
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
        } else if (formData.paymentMethod === 'HISSELI') {
          // Hisseli payment - direct success without payment
          clearCart()
          toast.success('Hissəli ödəniş müraciətiniz uğurla yaradıldı! Kredit mütəxəssisi sizinlə əlaqə saxlayacaq.')
          router.push(`/order-success?orderId=${result.orderNumber}&paymentMethod=HISSELI`)
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

            const paymentResponse = await fetch('/api/payment/united-payment/taksit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(paymentData),
            })
            

            if (paymentResponse.ok) {
              const paymentResult = await paymentResponse.json()
              
              if (paymentResult.isMock) {
                clearCart()
                toast.success(`Test rejimində ${formData.installment} aylıq taksit ödənişi simulyasiya edilir...`)
                router.push(paymentResult.paymentUrl)
              } else {
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
        console.error('Order creation failed:', error)
        console.error('Response status:', response.status)
        console.error('Response statusText:', response.statusText)
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

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="HISSELI"
                    checked={formData.paymentMethod === 'HISSELI'}
                    onChange={(e) => {
                      handleInputChange('paymentMethod', e.target.value)
                      setShowHisseliModal(true)
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hissəli Ödəniş</span>
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
                disabled={
                  loading || 
                  (!formData.shippingAddressId && !showAddAddress) || 
                  (formData.paymentMethod === 'TAKSIT' && !formData.installment) ||
                  (formData.paymentMethod === 'HISSELI' && (
                    !hisseliForm.firstName || !hisseliForm.lastName || !hisseliForm.fatherName ||
                    !hisseliForm.idCardFrontUrl || !hisseliForm.idCardBackUrl ||
                    !hisseliForm.registrationAddress || !hisseliForm.actualAddress || !hisseliForm.contactNumber ||
                    !hisseliForm.familyMembers.every(member => member.name && member.relationship && member.phone) ||
                    !hisseliForm.workplace || !hisseliForm.position || !hisseliForm.salary
                  ))
                }
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

        {/* Hisseli Payment Modal - Outside form */}
        {showHisseliModal && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setShowHisseliModal(false)}
              ></div>

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Hissəli Ödəniş Müraciəti</h3>
                    <button
                      type="button"
                      onClick={() => setShowHisseliModal(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Modal content */}
                  <div className="max-h-[70vh] overflow-y-auto">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                  <h3 className="text-sm font-medium text-green-900 mb-3">Hissəli Ödəniş Şərtləri</h3>
                      <div className="text-xs text-green-700 space-y-1">
                    <p>1. Hissəli ödəniş 18-65 yaş aralığında olan Azərbaycan vətəndaşlarına şamil olunur.</p>
                    <p>2. Rəsmi iş yeri mütləqdir. Sonuncu iş yerində minimum 3 ay staj tələb olunur.</p>
                    <p>3. Qeydiyyat və faktiki yaşayış ünvanı: Bakı və Sumqayıt şəhərləri.</p>
                    <p>4. Məhsul təhvil alınan zaman müqavilə imzalanır və fotoşəkil çəkilir.</p>
                    <p>5. Müraciətinizdən sonra 30-45 dəqiqə ərzində kredit mütəxəssisi video zəng vasitəsi ilə sizinlə əlaqə saxlayır.</p>
                      </div>
                  </div>

                  <div className="space-y-4">
                    {/* Personal Information */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Şəxsi Məlumatlar</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Ad *"
                          value={hisseliForm.firstName}
                          onChange={(e) => setHisseliForm(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Soyad *"
                          value={hisseliForm.lastName}
                          onChange={(e) => setHisseliForm(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Ata adı *"
                          value={hisseliForm.fatherName}
                          onChange={(e) => setHisseliForm(prev => ({ ...prev, fatherName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* ID Card Upload */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Şəxsiyyət Vəsiqəsi</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Ön tərəf * (maksimum 10MB)</label>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadStatus.front.uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setHisseliForm(prev => ({ ...prev, idCardFront: file }))
                                handleFileUpload(file, 'front')
                              }
                            }}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${
                              uploadStatus.front.uploading 
                                ? 'border-blue-300 bg-blue-50 cursor-not-allowed' 
                                : uploadStatus.front.uploaded 
                                  ? 'border-green-300 bg-green-50' 
                                  : uploadStatus.front.error 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-300'
                            }`}
                            required
                          />
                          <div className="mt-2 text-xs">
                            {hisseliForm.idCardFront && (
                              <div className="text-gray-600 mb-1">
                                📁 Seçilmiş fayl: {hisseliForm.idCardFront.name}
                              </div>
                            )}
                            {uploadStatus.front.uploading && (
                              <div className="flex items-center text-blue-600">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                                Yüklənir...
                              </div>
                            )}
                            {uploadStatus.front.uploaded && (
                              <div className="text-green-600">
                                ✅ Ön tərəf uğurla yükləndi
                              </div>
                            )}
                            {uploadStatus.front.error && (
                              <div className="text-red-600">
                                ❌ Yükləmə xətası - yenidən cəhd edin
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Arxa tərəf * (maksimum 10MB)</label>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadStatus.back.uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setHisseliForm(prev => ({ ...prev, idCardBack: file }))
                                handleFileUpload(file, 'back')
                              }
                            }}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${
                              uploadStatus.back.uploading 
                                ? 'border-blue-300 bg-blue-50 cursor-not-allowed' 
                                : uploadStatus.back.uploaded 
                                  ? 'border-green-300 bg-green-50' 
                                  : uploadStatus.back.error 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-300'
                            }`}
                            required
                          />
                          <div className="mt-2 text-xs">
                            {hisseliForm.idCardBack && (
                              <div className="text-gray-600 mb-1">
                                📁 Seçilmiş fayl: {hisseliForm.idCardBack.name}
                              </div>
                            )}
                            {uploadStatus.back.uploading && (
                              <div className="flex items-center text-blue-600">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                                Yüklənir...
                              </div>
                            )}
                            {uploadStatus.back.uploaded && (
                              <div className="text-green-600">
                                ✅ Arxa tərəf uğurla yükləndi
                              </div>
                            )}
                            {uploadStatus.back.error && (
                              <div className="text-red-600">
                                ❌ Yükləmə xətası - yenidən cəhd edin
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Ünvan Məlumatları</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Qeydiyyat ünvanı *"
                          value={hisseliForm.registrationAddress}
                          onChange={(e) => setHisseliForm(prev => ({ ...prev, registrationAddress: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Faktiki yaşayış ünvanı *"
                          value={hisseliForm.actualAddress}
                          onChange={(e) => setHisseliForm(prev => ({ ...prev, actualAddress: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Əlaqə nömrəsi *"
                          value={hisseliForm.contactNumber}
                          onChange={(e) => setHisseliForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Family Members */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Ailə Üzvləri / Qohumlar (3 nəfər)</h4>
                      <div className="space-y-3">
                        {hisseliForm.familyMembers.map((member, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="Ad Soyad *"
                              value={member.name}
                              onChange={(e) => {
                                const newMembers = [...hisseliForm.familyMembers]
                                newMembers[index].name = e.target.value
                                setHisseliForm(prev => ({ ...prev, familyMembers: newMembers }))
                              }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Qohumluq dərəcəsi *"
                              value={member.relationship}
                              onChange={(e) => {
                                const newMembers = [...hisseliForm.familyMembers]
                                newMembers[index].relationship = e.target.value
                                setHisseliForm(prev => ({ ...prev, familyMembers: newMembers }))
                              }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                              required
                            />
                            <input
                              type="tel"
                              placeholder="Telefon nömrəsi *"
                              value={member.phone}
                              onChange={(e) => {
                                const newMembers = [...hisseliForm.familyMembers]
                                newMembers[index].phone = e.target.value
                                setHisseliForm(prev => ({ ...prev, familyMembers: newMembers }))
                              }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Work Information */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">İş Məlumatları</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="İş yeri *"
                          value={hisseliForm.workplace}
                          onChange={(e) => setHisseliForm(prev => ({ ...prev, workplace: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Vəzifə *"
                            value={hisseliForm.position}
                            onChange={(e) => setHisseliForm(prev => ({ ...prev, position: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            required
                          />
                          <input
                            type="number"
                            placeholder="Maaş (₼) *"
                            value={hisseliForm.salary}
                            onChange={(e) => setHisseliForm(prev => ({ ...prev, salary: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>

                      <div className="text-xs text-gray-700 bg-gray-100 p-3 rounded">
                      <strong>Qeyd:</strong> Məhsul təhvil alınan zaman şəxsiyyət vəsiqəniz üzərinizdə olmalıdır və müqavilə imzalanacaq.
                    </div>
                  </div>
                </div>
            </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                    type="button"
                    onClick={() => setShowHisseliModal(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Bağla
              </button>
            </div>
          </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
