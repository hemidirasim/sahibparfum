'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Image, 
  ShoppingBag, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  Plus,
  TrendingUp,
  DollarSign,
  Eye,
  RefreshCw
} from 'lucide-react'

interface Stats {
  totalSales: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  monthlyGrowth: number
  activeSliders: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customer: string
  email: string
  amount: number
  status: string
  paymentStatus: string
  date: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    monthlyGrowth: 0,
    activeSliders: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch stats
      const statsResponse = await fetch('/api/sahib-admin-2024/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent orders
      const ordersResponse = await fetch('/api/sahib-admin-2024/dashboard/recent-orders?limit=5')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(ordersData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const quickActions = [
    {
      title: 'Slider İdarəetməsi',
      description: 'Ana səhifə slider-lərini idarə edin',
      icon: Image,
      href: '/sahib-admin-2024/sliders',
      color: 'bg-blue-500'
    },
    {
      title: 'Məhsul Əlavə Et',
      description: 'Yeni məhsul əlavə edin',
      icon: Plus,
      href: '/sahib-admin-2024/products/new',
      color: 'bg-green-500'
    },
    {
      title: 'Sifarişlər',
      description: 'Bütün sifarişləri görün',
      icon: ShoppingBag,
      href: '/sahib-admin-2024/orders',
      color: 'bg-purple-500'
    },
    {
      title: 'Müştərilər',
      description: 'Müştəri siyahısını idarə edin',
      icon: Users,
      href: '/sahib-admin-2024/customers',
      color: 'bg-orange-500'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'Çatdırıldı'
      case 'PROCESSING':
        return 'İşlənir'
      case 'PENDING':
        return 'Gözləyir'
      case 'CANCELLED':
        return 'Ləğv edildi'
      case 'SHIPPED':
        return 'Göndərildi'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Sahib Parfumeriya admin paneli - Xoş gəlmisiniz!
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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Sahib Parfumeriya admin paneli - Xoş gəlmisiniz!
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yenilə
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Son yenilənmə</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString('az-AZ', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-7 w-7 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ümumi Satış</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSales.toLocaleString()} ₼</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
            <span className="text-gray-500 ml-1">keçən aydan</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <ShoppingBag className="h-7 w-7 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sifarişlər</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">75% tamamlanmış</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Package className="h-7 w-7 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Məhsullar</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">60% aktiv</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Users className="h-7 w-7 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Müştərilər</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">85% məmnun</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Sürətli Əməliyyatlar</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className={`p-3 rounded-xl ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Son Sifarişlər</h2>
            </div>
            <div className="p-6">
                                <div className="space-y-4">
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Hələ heç bir sifariş yoxdur</p>
                      </div>
                    ) : (
                      recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-medium text-gray-900">{order.customer}</p>
                            <p className="text-sm text-gray-600">{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">{order.amount.toLocaleString()} ₼</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            <Link
                              href={`/sahib-admin-2024/orders/${order.id}`}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  href="/sahib-admin-2024/orders"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Bütün sifarişləri gör →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
