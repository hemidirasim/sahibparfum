'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  image?: string
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export default function AdminBlogsPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs)
      } else {
        toast.error('Blogları yükləmək mümkün olmadı')
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      toast.error('Blogları yükləmək mümkün olmadı')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu blog yazısını silmək istədiyinizə əminsiniz?')) {
      return
    }

    try {
      setDeleting(id)
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Blog yazısı silindi')
        fetchBlogs()
      } else {
        toast.error('Blog yazısını silmək mümkün olmadı')
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      toast.error('Blog yazısını silmək mümkün olmadı')
    } finally {
      setDeleting(null)
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const blog = blogs.find(b => b.id === id)
      if (!blog) return

      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...blog,
          isPublished: !currentStatus
        })
      })

      if (response.ok) {
        toast.success(`Blog yazısı ${!currentStatus ? 'nəşr edildi' : 'nəşrdən çıxarıldı'}`)
        fetchBlogs()
      } else {
        toast.error('Blog yazısının statusunu dəyişmək mümkün olmadı')
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
      toast.error('Blog yazısının statusunu dəyişmək mümkün olmadı')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Yüklənir...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blog Yazıları</h1>
              <p className="text-gray-600 mt-1">
                Blog yazılarını idarə edin və yeni yazılar əlavə edin
              </p>
            </div>
            <button
              onClick={() => router.push('/sahib-admin-2024/blogs/new')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Yeni Blog Yazısı
            </button>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Hələlik blog yazısı yoxdur</h3>
              <p className="text-gray-500 mb-6">İlk blog yazınızı əlavə etmək üçün yuxarıdakı düyməyə basın.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlıq
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Əməliyyatlar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {blog.image && (
                            <img
                              src={blog.image}
                              alt={blog.title}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {blog.title}
                            </div>
                            {blog.excerpt && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {blog.excerpt}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {blog.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          blog.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {blog.isPublished ? 'Nəşr edilib' : 'Qaralama'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(blog.createdAt).toLocaleDateString('az-AZ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/sahib-admin-2024/blogs/${blog.id}/edit`)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTogglePublish(blog.id, blog.isPublished)}
                            className={`${
                              blog.isPublished 
                                ? 'text-yellow-600 hover:text-yellow-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {blog.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            disabled={deleting === blog.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleting === blog.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
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
          )}
        </div>
      </div>
    </div>
  )
}
