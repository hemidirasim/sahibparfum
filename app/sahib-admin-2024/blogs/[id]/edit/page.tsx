'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Upload } from 'lucide-react'
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

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    isPublished: false
  })

  useEffect(() => {
    if (params.id) {
      fetchBlog()
    }
  }, [params.id])

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${params.id}`)
      if (response.ok) {
        const blog: Blog = await response.json()
        setFormData({
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt || '',
          content: blog.content,
          image: blog.image || '',
          isPublished: blog.isPublished
        })
      } else {
        toast.error('Blog yazısını yükləmək mümkün olmadı')
        router.push('/sahib-admin-2024/blogs')
      }
    } catch (error) {
      console.error('Error fetching blog:', error)
      toast.error('Blog yazısını yükləmək mümkün olmadı')
      router.push('/sahib-admin-2024/blogs')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }
      
      // Auto-generate slug when title changes
      if (name === 'title' && value) {
        newData.slug = generateSlug(value)
      }
      
      return newData
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Şəkil ölçüsü 5MB-dan böyük ola bilməz')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, image: data.url }))
        toast.success('Şəkil yükləndi')
      } else {
        toast.error('Şəkil yükləmək mümkün olmadı')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Şəkil yükləmək mümkün olmadı')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Başlıq, slug və məzmun mütləqdir')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Blog yazısı yeniləndi')
        router.push('/sahib-admin-2024/blogs')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Blog yazısını yeniləmək mümkün olmadı')
      }
    } catch (error) {
      console.error('Error updating blog:', error)
      toast.error('Blog yazısını yeniləmək mümkün olmadı')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blog Yazısını Redaktə Et</h1>
              <p className="text-gray-600 mt-1">
                Blog yazısını redaktə edin
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Başlıq *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Blog yazısının başlığı"
                required
              />
              {formData.slug && (
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">Slug:</span> {formData.slug}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Qısa Təsvir
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Blog yazısının qısa təsviri"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Məzmun *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Blog yazısının məzmunu"
                required
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Şəkil
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Yüklənir...' : 'Şəkil Seç'}
                </label>
                {formData.image && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                Nəşr edilib
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ləğv Et
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Yenilə
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
