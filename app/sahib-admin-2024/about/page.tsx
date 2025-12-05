'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Save, RefreshCw, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface AboutSettings {
  aboutHeroTitle?: string
  aboutHeroDescription?: string
  aboutStoryTitle?: string
  aboutStoryContent?: string
  aboutStat1Value?: string
  aboutStat1Label?: string
  aboutStat2Value?: string
  aboutStat2Label?: string
  aboutStat3Value?: string
  aboutStat3Label?: string
  aboutStat4Value?: string
  aboutStat4Label?: string
  aboutValue1Title?: string
  aboutValue1Description?: string
  aboutValue2Title?: string
  aboutValue2Description?: string
  aboutValue3Title?: string
  aboutValue3Description?: string
  aboutCtaTitle?: string
  aboutCtaDescription?: string
  aboutImage?: string
}

export default function AboutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<AboutSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/sahib-admin-2024')
    }
  }, [session, router])

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings({
            aboutHeroTitle: data.aboutHeroTitle || '',
            aboutHeroDescription: data.aboutHeroDescription || '',
            aboutStoryTitle: data.aboutStoryTitle || '',
            aboutStoryContent: data.aboutStoryContent || '',
            aboutStat1Value: data.aboutStat1Value || '',
            aboutStat1Label: data.aboutStat1Label || '',
            aboutStat2Value: data.aboutStat2Value || '',
            aboutStat2Label: data.aboutStat2Label || '',
            aboutStat3Value: data.aboutStat3Value || '',
            aboutStat3Label: data.aboutStat3Label || '',
            aboutStat4Value: data.aboutStat4Value || '',
            aboutStat4Label: data.aboutStat4Label || '',
            aboutValue1Title: data.aboutValue1Title || '',
            aboutValue1Description: data.aboutValue1Description || '',
            aboutValue2Title: data.aboutValue2Title || '',
            aboutValue2Description: data.aboutValue2Description || '',
            aboutValue3Title: data.aboutValue3Title || '',
            aboutValue3Description: data.aboutValue3Description || '',
            aboutCtaTitle: data.aboutCtaTitle || '',
            aboutCtaDescription: data.aboutCtaDescription || '',
            aboutImage: data.aboutImage || '',
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      // Get current settings first
      const currentResponse = await fetch('/api/settings')
      const currentData = await currentResponse.json()
      
      // Merge with about settings
      const updatedSettings = {
        ...currentData,
        ...settings
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      })

      if (response.ok) {
        setMessage('Haqqımızda səhifəsi uğurla yeniləndi! Səhifə yenilənir...')
        // Wait a bit for revalidation, then refresh
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setMessage('Xəta baş verdi. Yenidən cəhd edin.')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Xəta baş verdi. Yenidən cəhd edin.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof AboutSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Şəkil ölçüsü 5MB-dan böyük ola bilməz')
      setTimeout(() => setMessage(''), 3000)
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
        setSettings(prev => ({ ...prev, aboutImage: data.url }))
        setMessage('Şəkil uğurla yükləndi!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Şəkil yüklənərkən xəta baş verdi')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage('Şəkil yüklənərkən xəta baş verdi')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setSettings(prev => ({ ...prev, aboutImage: '' }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Haqqımızda Səhifəsi</h1>
          <p className="text-gray-600 mt-2">
            Haqqımızda səhifəsinin məzmununu buradan redaktə edə bilərsiniz
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('uğurla') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
          {/* Hero Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Bölməsi</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlıq
                </label>
                <input
                  type="text"
                  value={settings.aboutHeroTitle || ''}
                  onChange={(e) => handleInputChange('aboutHeroTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Təsvir
                </label>
                <textarea
                  value={settings.aboutHeroDescription || ''}
                  onChange={(e) => handleInputChange('aboutHeroDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hekayə Bölməsi</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlıq
                </label>
                <input
                  type="text"
                  value={settings.aboutStoryTitle || ''}
                  onChange={(e) => handleInputChange('aboutStoryTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Məzmun (Hər paraqrafı yeni sətirdə yazın)
                </label>
                <textarea
                  value={settings.aboutStoryContent || ''}
                  onChange={(e) => handleInputChange('aboutStoryContent', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Paraqrafları yeni sətirlə ayırın..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şəkil
                </label>
                {settings.aboutImage ? (
                  <div className="relative">
                    <div className="relative w-full h-64 border border-gray-300 rounded-md overflow-hidden">
                      <Image
                        src={settings.aboutImage}
                        alt="About image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Şəkli Sil
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 mb-2">Şəkil yüklə</span>
                      <span className="text-xs text-gray-500">Maksimum 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {uploading && (
                      <div className="mt-4 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Yüklənir...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistikalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stat 1 - Dəyər
                </label>
                <input
                  type="text"
                  value={settings.aboutStat1Value || ''}
                  onChange={(e) => handleInputChange('aboutStat1Value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stat 1 - Etiket
                </label>
                <input
                  type="text"
                  value={settings.aboutStat1Label || ''}
                  onChange={(e) => handleInputChange('aboutStat1Label', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stat 2 - Dəyər
                </label>
                <input
                  type="text"
                  value={settings.aboutStat2Value || ''}
                  onChange={(e) => handleInputChange('aboutStat2Value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stat 2 - Etiket
                </label>
                <input
                  type="text"
                  value={settings.aboutStat2Label || ''}
                  onChange={(e) => handleInputChange('aboutStat2Label', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stat 3 - Dəyər
                </label>
                <input
                  type="text"
                  value={settings.aboutStat3Value || ''}
                  onChange={(e) => handleInputChange('aboutStat3Value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stat 3 - Etiket
                </label>
                <input
                  type="text"
                  value={settings.aboutStat3Label || ''}
                  onChange={(e) => handleInputChange('aboutStat3Label', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stat 4 - Dəyər
                </label>
                <input
                  type="text"
                  value={settings.aboutStat4Value || ''}
                  onChange={(e) => handleInputChange('aboutStat4Value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stat 4 - Etiket
                </label>
                <input
                  type="text"
                  value={settings.aboutStat4Label || ''}
                  onChange={(e) => handleInputChange('aboutStat4Label', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dəyərlər</h2>
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 mb-4">Dəyər 1</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlıq
                    </label>
                    <input
                      type="text"
                      value={settings.aboutValue1Title || ''}
                      onChange={(e) => handleInputChange('aboutValue1Title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Təsvir
                    </label>
                    <textarea
                      value={settings.aboutValue1Description || ''}
                      onChange={(e) => handleInputChange('aboutValue1Description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 mb-4">Dəyər 2</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlıq
                    </label>
                    <input
                      type="text"
                      value={settings.aboutValue2Title || ''}
                      onChange={(e) => handleInputChange('aboutValue2Title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Təsvir
                    </label>
                    <textarea
                      value={settings.aboutValue2Description || ''}
                      onChange={(e) => handleInputChange('aboutValue2Description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 mb-4">Dəyər 3</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlıq
                    </label>
                    <input
                      type="text"
                      value={settings.aboutValue3Title || ''}
                      onChange={(e) => handleInputChange('aboutValue3Title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Təsvir
                    </label>
                    <textarea
                      value={settings.aboutValue3Description || ''}
                      onChange={(e) => handleInputChange('aboutValue3Description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">CTA Bölməsi</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlıq
                </label>
                <input
                  type="text"
                  value={settings.aboutCtaTitle || ''}
                  onChange={(e) => handleInputChange('aboutCtaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Təsvir
                </label>
                <textarea
                  value={settings.aboutCtaDescription || ''}
                  onChange={(e) => handleInputChange('aboutCtaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Yadda saxlanılır...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Yadda Saxla
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

