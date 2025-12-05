'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, UserPlus, Edit, Trash2, Eye, X } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  orderCount: number
  isActive?: boolean
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: ''
  })
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/sahib-admin-2024/login')
      return
    }

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/sahib-admin-2024/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Users fetch error:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    if (!confirm(`${user.name} istifadəçisinin rolunu ${newRole === 'ADMIN' ? 'Admin' : 'İstifadəçi'} etmək istədiyinizə əminsiniz?`)) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/sahib-admin-2024/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        // Update local state immediately
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ))
        alert('İstifadəçi rolu uğurla yeniləndi')
      } else {
        const errorData = await response.json()
        console.error('Failed to update user role:', errorData)
        alert('Rol yenilənərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('User role update error:', error)
      alert('Rol yenilənərkən xəta baş verdi')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const fetchUserOrders = async (userId: string) => {
    try {
      const response = await fetch(`/api/sahib-admin-2024/users/${userId}/orders`)
      if (response.ok) {
        const data = await response.json()
        setUserOrders(data.orders || [])
      } else {
        console.error('Failed to fetch user orders')
      }
    } catch (error) {
      console.error('User orders fetch error:', error)
    }
  }

  const handleViewOrders = (user: User) => {
    setSelectedUser(user)
    setShowOrdersModal(true)
    fetchUserOrders(user.id)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    // Prepare update data - only include password if it's not empty
    const updateData: any = {
      name: editFormData.name,
      email: editFormData.email,
      role: editFormData.role
    }

    // Only include password if it's provided
    if (editFormData.password.trim()) {
      updateData.password = editFormData.password
    }

    setActionLoading(selectedUser.id)
    try {
      const response = await fetch(`/api/sahib-admin-2024/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        // Update local state immediately (without password)
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id ? { 
            ...u, 
            name: editFormData.name,
            email: editFormData.email,
            role: editFormData.role
          } : u
        ))
        setShowEditModal(false)
        setEditFormData(prev => ({ ...prev, password: '' })) // Clear password field
        alert('İstifadəçi məlumatları uğurla yeniləndi')
      } else {
        const errorData = await response.json()
        console.error('Failed to update user:', errorData)
        alert('İstifadəçi yenilənərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('User update error:', error)
      alert('İstifadəçi yenilənərkən xəta baş verdi')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateUser = async () => {
    if (!createFormData.name.trim() || !createFormData.email.trim() || !createFormData.password.trim()) {
      alert('Bütün sahələri doldurun')
      return
    }

    setActionLoading('create')
    try {
      const response = await fetch('/api/sahib-admin-2024/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createFormData),
      })

      if (response.ok) {
        const newUser = await response.json()
        // Add new user to local state
        setUsers(prev => [newUser, ...prev])
        setShowCreateModal(false)
        setCreateFormData({
          name: '',
          email: '',
          role: 'USER',
          password: ''
        })
        alert('Yeni istifadəçi uğurla yaradıldı')
      } else {
        const errorData = await response.json()
        console.error('Failed to create user:', errorData)
        alert(errorData.error || 'İstifadəçi yaradılarkən xəta baş verdi')
      }
    } catch (error) {
      console.error('User creation error:', error)
      alert('İstifadəçi yaradılarkən xəta baş verdi')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    if (!confirm(`"${user.name}" istifadəçisini silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.`)) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/sahib-admin-2024/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove user from local state immediately
        setUsers(prev => prev.filter(u => u.id !== userId))
        alert('İstifadəçi uğurla silindi')
      } else {
        const errorData = await response.json()
        console.error('Failed to delete user:', errorData)
        alert(errorData.error || 'İstifadəçi silinərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('User delete error:', error)
      alert('İstifadəçi silinərkən xəta baş verdi')
    } finally {
      setActionLoading(null)
    }
  }

  const deactivateUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    if (!confirm(`"${user.name}" istifadəçisini deaktiv etmək istədiyinizə əminsiniz?`)) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/sahib-admin-2024/users/${userId}/deactivate`, {
        method: 'PATCH',
      })

      if (response.ok) {
        // Update user status in local state
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isActive: false } : u
        ))
        alert('İstifadəçi uğurla deaktiv edildi')
      } else {
        const errorData = await response.json()
        console.error('Failed to deactivate user:', errorData)
        alert(errorData.error || 'İstifadəçi deaktiv edilərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('User deactivation error:', error)
      alert('İstifadəçi deaktiv edilərkən xəta baş verdi')
    } finally {
      setActionLoading(null)
    }
  }

  const reactivateUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    if (!confirm(`"${user.name}" istifadəçisini təkrar aktiv etmək istədiyinizə əminsiniz?`)) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/sahib-admin-2024/users/${userId}/reactivate`, {
        method: 'PATCH',
      })

      if (response.ok) {
        // Update user status in local state
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isActive: true } : u
        ))
        alert('İstifadəçi uğurla təkrar aktiv edildi')
      } else {
        const errorData = await response.json()
        console.error('Failed to reactivate user:', errorData)
        alert(errorData.error || 'İstifadəçi təkrar aktiv edilərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('User reactivation error:', error)
      alert('İstifadəçi təkrar aktiv edilərkən xəta baş verdi')
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'USER':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Xəta baş verdi</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="btn btn-primary"
          >
            Yenidən cəhd et
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">İstifadəçilər</h1>
            <p className="text-gray-600 mt-2">
              Bütün istifadəçiləri idarə edin
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Yeni İstifadəçi
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Ad, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">🔒 Saxtakarlıq olmaz</p>
          </div>
          
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">Bütün Rollar</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">İstifadəçi</option>
            </select>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Ümumi: <span className="font-semibold">{filteredUsers.length}</span> istifadəçi
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İstifadəçi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sifarişlər
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qeydiyyat Tarixi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Ad təyin edilməyib'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${getRoleColor(user.role)}`}
                      >
                        <option value="USER">İstifadəçi</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      {user.isActive === false && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Deaktiv
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.orderCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('az-AZ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewOrders(user)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Sifarişləri gör"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        disabled={actionLoading === user.id}
                        className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50"
                        title="İstifadəçi məlumatlarını dəyişdir"
                      >
                        {actionLoading === user.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                      {user.isActive !== false ? (
                        <button 
                          onClick={() => deactivateUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-[#022763] hover:text-[#011d4a] p-1 disabled:opacity-50"
                          title="İstifadəçini deaktiv et"
                        >
                          {actionLoading === user.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#022763] border-t-transparent"></div>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          )}
                        </button>
                      ) : (
                        <button 
                          onClick={() => reactivateUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50"
                          title="İstifadəçini təkrar aktiv et"
                        >
                          {actionLoading === user.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      )}
                      <button 
                        onClick={() => deleteUser(user.id)}
                        disabled={actionLoading === user.id}
                        className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                        title="İstifadəçini sil"
                      >
                        {actionLoading === user.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Modal */}
      {showOrdersModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedUser.name} - Sifarişlər
                </h2>
                <button
                  onClick={() => setShowOrdersModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {userOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sifariş №
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Məbləğ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Məhsullar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id.slice(-8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('az-AZ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'completed' ? 'Tamamlandı' :
                               order.status === 'pending' ? 'Gözləyir' :
                               order.status === 'cancelled' ? 'Ləğv edildi' :
                               order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.totalAmount} ₼
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.items?.length || 0} məhsul
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sifariş yoxdur
                  </h3>
                  <p className="text-gray-600">
                    Bu istifadəçinin hələ heç bir sifarişi yoxdur.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  İstifadəçi məlumatlarını dəyişdir
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USER">İstifadəçi</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yeni Şifrə (boş buraxın dəyişməmək üçün)
                  </label>
                  <input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Yeni şifrə daxil edin..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={actionLoading === selectedUser.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === selectedUser.id ? 'Yenilənir...' : 'Yenilə'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Yeni İstifadəçi Yarat
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad *
                  </label>
                  <input
                    type="text"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="İstifadəçi adı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifrə *
                  </label>
                  <input
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Şifrə daxil edin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USER">İstifadəçi</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={actionLoading === 'create'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === 'create' ? 'Yaradılır...' : 'Yarat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
