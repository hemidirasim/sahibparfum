'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface SupportContent {
  id: string
  title: string
  content: string
  page: string
  order: number
  createdAt: string
  updatedAt: string
}

const SUPPORT_PAGES = [
  { value: 'orders', label: 'Sifariş Dəstəyi' },
  { value: 'payment', label: 'Ödəniş Dəstəyi' },
  { value: 'delivery', label: 'Çatdırılma Dəstəyi' },
  { value: 'returns', label: 'Geri Qaytarma' },
  { value: 'loyalty', label: 'Loyallıq Proqramı' },
  { value: 'faq', label: 'FAQ' }
]

export default function SupportContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [supportContent, setSupportContent] = useState<SupportContent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<Partial<SupportContent>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContent, setNewContent] = useState<Partial<SupportContent>>({
    title: '',
    content: '',
    page: 'orders',
    order: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      router.push('/sahib-admin-2024/login')
      return
    }

    fetchSupportContent()
  }, [session, status, router])

  const fetchSupportContent = async () => {
    try {
      const response = await fetch('/api/sahib-admin-2024/support-content')
      
      if (response.ok) {
        const data = await response.json()
        setSupportContent(data)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
      }
    } catch (error) {
      console.error('Error fetching support content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (content: SupportContent) => {
    setEditingId(content.id)
    setEditingContent(content)
  }

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`/api/sahib-admin-2024/support-content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContent)
      })

      if (response.ok) {
        await fetchSupportContent()
        setEditingId(null)
        setEditingContent({})
      }
    } catch (error) {
      console.error('Error updating support content:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kontenti silmək istədiyinizə əminsiniz?')) return

    try {
      const response = await fetch(`/api/sahib-admin-2024/support-content/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchSupportContent()
      }
    } catch (error) {
      console.error('Error deleting support content:', error)
    }
  }

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/sahib-admin-2024/support-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent)
      })

      if (response.ok) {
        await fetchSupportContent()
        setShowAddForm(false)
        setNewContent({ title: '', content: '', page: 'orders', order: 0 })
      }
    } catch (error) {
      console.error('Error adding support content:', error)
    }
  }

  const groupedContent = supportContent.reduce((acc, content) => {
    if (!acc[content.page]) {
      acc[content.page] = []
    }
    acc[content.page].push(content)
    return acc
  }, {} as Record<string, SupportContent[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dəstək Kontenti</h1>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kontent
              </button>
            </div>
          </div>

          <div className="p-6">
            {showAddForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Yeni Kontent Əlavə Et</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlıq
                    </label>
                    <input
                      type="text"
                      value={newContent.title || ''}
                      onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Səhifə
                    </label>
                    <select
                      value={newContent.page || 'orders'}
                      onChange={(e) => setNewContent({ ...newContent, page: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {SUPPORT_PAGES.map((page) => (
                        <option key={page.value} value={page.value}>
                          {page.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sıra
                    </label>
                    <input
                      type="number"
                      value={newContent.order || 0}
                      onChange={(e) => setNewContent({ ...newContent, order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Məzmun
                  </label>
                  <textarea
                    value={newContent.content || ''}
                    onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={handleAdd}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Yadda Saxla
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Ləğv Et
                  </button>
                </div>
              </div>
            )}

            {Object.entries(groupedContent).map(([page, contents]) => (
              <div key={page} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {SUPPORT_PAGES.find(p => p.value === page)?.label || page}
                </h2>
                <div className="space-y-4">
                  {contents
                    .sort((a, b) => a.order - b.order)
                    .map((content) => (
                    <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                      {editingId === content.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Başlıq
                              </label>
                              <input
                                type="text"
                                value={editingContent.title || ''}
                                onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sıra
                              </label>
                              <input
                                type="number"
                                value={editingContent.order || 0}
                                onChange={(e) => setEditingContent({ ...editingContent, order: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Məzmun
                            </label>
                            <textarea
                              value={editingContent.content || ''}
                              onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(content.id)}
                              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Yadda Saxla
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditingContent({})
                              }}
                              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Ləğv Et
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {content.title}
                            </h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(content)}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(content.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600 whitespace-pre-wrap">
                            {content.content}
                          </p>
                          <div className="mt-2 text-sm text-gray-500">
                            Sıra: {content.order}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
