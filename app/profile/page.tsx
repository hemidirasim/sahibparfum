'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { User, Mail, Calendar, ShoppingBag, Heart, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
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
                      <p className="font-medium text-gray-900">Səbətinizdə 3 məhsul var</p>
                      <p className="text-sm text-gray-600">Son yenilənmə: bugün</p>
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
                      <p className="font-medium text-gray-900">Favorilərinizdə 5 məhsul var</p>
                      <p className="text-sm text-gray-600">Son əlavə: dünən</p>
                    </div>
                    <Link
                      href="/wishlist"
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
                    <span className="font-semibold text-gray-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bu ay</span>
                    <span className="font-semibold text-primary-600">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Favorilər</span>
                    <span className="font-semibold text-gray-900">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ünvanlar</span>
                    <span className="font-semibold text-gray-900">2</span>
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
