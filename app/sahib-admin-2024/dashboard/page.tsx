'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  ShoppingBag, 
  Package, 
  DollarSign, 
  UserCheck, 
  BarChart3, 
  TrendingUp, 
  Settings 
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  recentOrders: any[]
  recentUsers: any[]
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/sahib-admin-2024/login')
      return
    }

    fetchDashboardStats()
  }, [session, status, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/sahib-admin-2024/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch dashboard stats')
      }
    } catch (error) {
      console.error('Dashboard stats fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or not admin
  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yönləndirilir...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          Xoş gəlmisiniz, {session?.user?.name}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ümumi İstifadəçilər</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ümumi Sifarişlər</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Məhsullar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ümumi Gəlir</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)} ₼</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          href="/sahib-admin-2024/users"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">İstifadəçilər</h3>
              <p className="text-gray-600">İstifadəçiləri idarə et</p>
            </div>
          </div>
        </Link>

        <Link
          href="/sahib-admin-2024/orders"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Sifarişlər</h3>
              <p className="text-gray-600">Sifarişləri idarə et</p>
            </div>
          </div>
        </Link>

        <Link
          href="/sahib-admin-2024/products"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Məhsullar</h3>
              <p className="text-gray-600">Məhsulları idarə et</p>
            </div>
          </div>
        </Link>

        <Link
          href="/sahib-admin-2024/categories"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Kateqoriyalar</h3>
              <p className="text-gray-600">Kateqoriyaları idarə et</p>
            </div>
          </div>
        </Link>

        <Link
          href="/sahib-admin-2024/sliders"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-[#022763]" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Slayderlər</h3>
              <p className="text-gray-600">Ana səhifə slayderlərini idarə et</p>
            </div>
          </div>
        </Link>

        <Link
          href="/sahib-admin-2024/settings"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Tənzimləmələr</h3>
              <p className="text-gray-600">Sistem tənzimləmələri</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Son Sifarişlər</h2>
              <Link
                href="/sahib-admin-2024/orders"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Hamısına bax
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.guestName || order.user?.name} • {order.totalAmount} ₼
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Son İstifadəçilər</h2>
              <Link
                href="/sahib-admin-2024/users"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Hamısına bax
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{user.name || 'Ad təyin edilməyib'}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
