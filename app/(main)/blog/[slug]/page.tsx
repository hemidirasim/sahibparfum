'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ArrowLeft, Share2 } from 'lucide-react'
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

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchBlog()
    }
  }, [params.slug])

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/slug/${params.slug}`)
      if (response.ok) {
        const blogData: Blog = await response.json()
        setBlog(blogData)
      } else {
        router.push('/blog')
      }
    } catch (error) {
      console.error('Error fetching blog:', error)
      router.push('/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link kopyalandı')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        toast.error('Link kopyalanmadı')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yüklənir...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog yazısı tapılmadı</h1>
            <Link
              href="/blog"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Blog səhifəsinə qayıt
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Blog səhifəsinə qayıt
          </Link>
        </div>

        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {blog.image && (
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            {/* Meta info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('az-AZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <button
                onClick={handleShare}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Paylaş
              </button>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {blog.content}
              </div>
            </div>
          </div>
        </article>

        {/* Related posts or back to blog */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Bütün Blog Yazıları
          </Link>
        </div>
      </div>
    </div>
  )
}
