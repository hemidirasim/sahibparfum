'use client'

import { useState, useEffect } from 'react'

interface SupportContent {
  id: string
  title: string
  content: string
  page: string
  order: number
}

export default function ReturnsSupportPage() {
  const [supportContent, setSupportContent] = useState<SupportContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSupportContent = async () => {
      try {
        const response = await fetch('/api/support-content?page=returns')
        
        if (response.ok) {
          const data = await response.json()
          // Sort by order field
          const sortedData = data.sort((a: SupportContent, b: SupportContent) => a.order - b.order)
          setSupportContent(sortedData)
        }
      } catch (error) {
        console.error('Error fetching support content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSupportContent()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Geri Qaytarma</h1>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Yüklənir...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {supportContent.length > 0 ? (
                supportContent.map((content) => (
                  <section key={content.id}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">{content.title}</h2>
                    <p className="text-gray-600 whitespace-pre-wrap">{content.content}</p>
                  </section>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Hələlik məlumat əlavə edilməyib.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}