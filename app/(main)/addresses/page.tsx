'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Home, Building } from 'lucide-react'
import Link from 'next/link'

interface Address {
  id: string
  type: 'SHIPPING' | 'BILLING'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export default function AddressesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAddresses()
    }
  }, [session])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
      }
    } catch (error) {
      console.error('Ünvanlar yüklənərkən xəta:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    if (confirm('Bu ünvanı silmək istədiyinizə əminsiniz?')) {
      try {
        const response = await fetch(`/api/addresses/${addressId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchAddresses()
        }
      } catch (error) {
        console.error('Ünvan silinərkən xəta:', error)
      }
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: 'PATCH',
      })
      if (response.ok) {
        fetchAddresses()
      }
    } catch (error) {
      console.error('Varsayılan ünvan təyin edilərkən xəta:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const addressData = {
      type: formData.get('type') as 'SHIPPING' | 'BILLING',
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      company: formData.get('company') as string || undefined,
      address1: formData.get('address1') as string,
      address2: formData.get('address2') as string || undefined,
      city: formData.get('city') as string,
      state: formData.get('state') as string || undefined,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string,
      phone: formData.get('phone') as string || undefined,
      isDefault: formData.get('isDefault') === 'true'
    }

    try {
      const url = editingAddress 
        ? `/api/addresses/${editingAddress.id}`
        : '/api/addresses'
      
      const method = editingAddress ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingAddress(null)
        fetchAddresses()
        // Formu təmizlə
        e.currentTarget.reset()
      } else {
        const error = await response.json()
        alert('Xəta: ' + (error.message || 'Ünvan əlavə edilərkən xəta baş verdi'))
      }
    } catch (error) {
      console.error('Ünvan əlavə edilərkən xəta:', error)
      alert('Ünvan əlavə edilərkən xəta baş verdi')
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ünvanlarım</h1>
              <p className="text-gray-600 mt-2">
                Çatdırılma və faktura ünvanlarınızı idarə edin
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Yeni Ünvan
            </button>
          </div>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Hələ ünvan yoxdur</h3>
              <p className="text-gray-600 mb-6">
                İlk ünvanınızı əlavə edin
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ünvan Əlavə Et
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Address Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {address.type === 'SHIPPING' ? (
                      <Home className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Building className="h-5 w-5 text-green-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {address.type === 'SHIPPING' ? 'Çatdırılma' : 'Faktura'}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Varsayılan
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingAddress(address)}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Address Content */}
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {address.firstName} {address.lastName}
                  </p>
                  {address.company && (
                    <p className="text-sm text-gray-600">{address.company}</p>
                  )}
                  <p className="text-sm text-gray-600">{address.address1}</p>
                  {address.address2 && (
                    <p className="text-sm text-gray-600">{address.address2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                  {address.phone && (
                    <p className="text-sm text-gray-600">{address.phone}</p>
                  )}
                </div>

                {/* Address Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Varsayılan et
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Address Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingAddress ? 'Ünvanı Redaktə Et' : 'Yeni Ünvan'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ünvan Növü
                  </label>
                  <select
                    name="type"
                    defaultValue={editingAddress?.type || 'SHIPPING'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="SHIPPING">Çatdırılma Ünvanı</option>
                    <option value="BILLING">Faktura Ünvanı</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={editingAddress?.firstName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={editingAddress?.lastName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şirkət (İstəyə görə)
                  </label>
                  <input
                    type="text"
                    name="company"
                    defaultValue={editingAddress?.company}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ünvan
                  </label>
                  <input
                    type="text"
                    name="address1"
                    defaultValue={editingAddress?.address1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ünvan 2 (İstəyə görə)
                  </label>
                  <input
                    type="text"
                    name="address2"
                    defaultValue={editingAddress?.address2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şəhər
                    </label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={editingAddress?.city}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rayon
                    </label>
                    <input
                      type="text"
                      name="state"
                      defaultValue={editingAddress?.state}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poçt Kodu
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      defaultValue={editingAddress?.postalCode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ölkə
                    </label>
                    <select
                      name="country"
                      defaultValue={editingAddress?.country || 'Azerbaijan'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="Azerbaijan">Azərbaycan</option>
                      <option value="Turkey">Türkiyə</option>
                      <option value="Georgia">Gürcüstan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingAddress?.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    value="true"
                    defaultChecked={editingAddress?.isDefault || false}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Varsayılan ünvan et
                  </label>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingAddress(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {editingAddress ? 'Yadda saxla' : 'Əlavə et'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
