'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Mail, Calendar, ShoppingBag, Heart, MapPin, Edit, Package, TrendingUp, Lock } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items: cartItems } = useCart()
  const [orders, setOrders] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
      setEditForm({
        name: session.user.name || '',
        email: session.user.email || ''
      })
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const timestamp = Date.now()
      const [ordersRes, addressesRes, favoritesRes] = await Promise.all([
        fetch('/api/orders'),
        fetch(`/api/addresses?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }),
        fetch('/api/favorites')
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (addressesRes.ok) {
        const addressesData = await addressesRes.json()
        setAddresses(addressesData)
      }

      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json()
        setFavorites(favoritesData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (!isEditing) {
      setEditForm({
        name: session?.user?.name || '',
        email: session?.user?.email || ''
      })
      // Clear password form when entering edit mode
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }


  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if password change is requested
    const isPasswordChange = passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword
    
    if (isPasswordChange) {
      // Validate password fields if any password field is filled
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        toast.error('Şifrə dəyişmək üçün bütün şifrə sahələrini doldurun')
        return
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Yeni şifrələr uyğun gəlmir')
        return
      }

      if (passwordForm.newPassword.length < 6) {
        toast.error('Yeni şifrə ən azı 6 simvol olmalıdır')
        return
      }
    }

    try {
      // Update profile information
      const profileResponse = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (!profileResponse.ok) {
        const error = await profileResponse.json()
        toast.error('Xəta: ' + (error.message || 'Profil yenilənmədi'))
        return
      }

      // Update password if requested
      if (isPasswordChange) {
        const passwordResponse = await fetch('/api/users/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          }),
        })

        if (!passwordResponse.ok) {
          const error = await passwordResponse.json()
          toast.error('Xəta: ' + (error.message || 'Şifrə dəyişdirilmədi'))
          return
        }
      }

      toast.success('Profil məlumatları uğurla yeniləndi!')
      
      // Clear password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      // Refresh page to show updated information
      window.location.reload()
    } catch (error) {
      console.error('Profil yenilənmə xətası:', error)
      toast.error('Profil yenilənmə xətası')
    }
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))
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
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <p className="text-gray-600 mt-2">
            Hesab məlumatlarınızı idarə edin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Şəxsi Məlumatlar</h2>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Şəxsi Məlumatlar</h3>
                  <button 
                    onClick={handleEditToggle}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{isEditing ? 'Ləğv et' : 'Redaktə et'}</span>
                  </button>
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ad Soyad
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ad Soyadınızı daxil edin"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Email ünvanınızı daxil edin"
                        />
                      </div>
                    </div>

                    {/* Password Change Section in Edit Mode */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-primary-600" />
                        Şifrə Dəyişdir
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hazırkı Şifrə
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Hazırkı şifrənizi daxil edin"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yeni Şifrə
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Yeni şifrənizi daxil edin"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yeni Şifrəni Təsdiq Et
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Yeni şifrənizi təkrar daxil edin"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Ləğv et
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Saxla
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <User className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ad Soyad</p>
                        <p className="font-medium text-gray-900">
                          {session.user?.name || 'Təyin edilməyib'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Mail className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{session.user?.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rol</p>
                      <p className="font-medium text-gray-900">
                        {session.user?.role === 'ADMIN' ? 'Administrator' : 'İstifadəçi'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {session.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hesab Statusu</p>
                      <p className="font-medium text-green-600">Aktiv</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Son Fəaliyyətlər</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Səbətinizdə {cartItems.length} məhsul var
                      </p>
                      <p className="text-sm text-gray-600">
                        Ümumi məbləğ: {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}₼
                      </p>
                    </div>
                    <Link
                      href="/cart"
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Bax
                    </Link>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Favorilərinizdə {favorites.length} məhsul var
                      </p>
                      <p className="text-sm text-gray-600">
                        Son əlavə: {favorites.length > 0 ? 'Son zamanlar' : 'Hələ əlavə edilməyib'}
                      </p>
                    </div>
                    <Link
                      href="/wishlist"
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Bax
                    </Link>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {orders.length} sifarişiniz var
                      </p>
                      <p className="text-sm text-gray-600">
                        Son sifariş: {orders.length > 0 ? new Date(orders[0]?.createdAt).toLocaleDateString('az-AZ') : 'Hələ sifariş yoxdur'}
                      </p>
                    </div>
                    <Link
                      href="/orders"
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Bax
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Sürətli Əməliyyatlar</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <Link
                    href="/cart"
                    className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 hover:border-primary-300"
                  >
                    <div className="flex-shrink-0">
                      <ShoppingBag className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Səbət</p>
                      <p className="text-sm text-gray-600">Sifarişlərinizi görün</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/wishlist"
                    className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 hover:border-red-300"
                  >
                    <div className="flex-shrink-0">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Favorilər</p>
                      <p className="text-sm text-gray-600">Sevimli məhsullarınız</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/orders"
                    className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 hover:border-green-300"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sifarişlər</p>
                      <p className="text-sm text-gray-600">Sifariş tarixçəsi</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/addresses"
                    className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex-shrink-0">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ünvanlar</p>
                      <p className="text-sm text-gray-600">Çatdırılma ünvanları</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Hesab Statistikası</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ümumi Sifariş</span>
                    <span className="font-semibold text-gray-900">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bu ay</span>
                    <span className="font-semibold text-primary-600">
                      {orders.filter(order => {
                        const orderDate = new Date(order.createdAt)
                        const now = new Date()
                        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Favorilər</span>
                    <span className="font-semibold text-gray-900">{favorites.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ünvanlar</span>
                    <span className="font-semibold text-gray-900">{addresses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Səbətdə</span>
                    <span className="font-semibold text-blue-600">{cartItems.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}