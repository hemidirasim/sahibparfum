'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Save, RefreshCw } from 'lucide-react'

interface Settings {
  id?: string
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  currency: string
  taxRate: number
  deliveryCost: number
  freeDeliveryThreshold: number
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  // Meta data fields
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  metaAuthor?: string
  ogTitle?: string
  ogDescription?: string
  ogLocale?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({
    siteName: 'Sahib Parfumeriya',
    siteDescription: 'Premium Parfüm Mağazası',
    contactEmail: 'info@sahibparfumeriya.az',
    contactPhone: '+994 50 123 45 67',
    address: 'Bakı şəhəri, Nərimanov rayonu',
    currency: 'AZN',
    taxRate: 18.0,
    deliveryCost: 10.0,
    freeDeliveryThreshold: 100.0,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    // Meta data defaults
    metaTitle: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
    metaDescription: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət. Online parfüm alış-verişi üçün etibarlı platforma.',
    metaKeywords: 'parfüm, ətir, sahib parfumeriya, online mağaza, parfüm alış-verişi',
    metaAuthor: 'SAHIB perfumery & cosmetics',
    ogTitle: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
    ogDescription: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.',
    ogLocale: 'az_AZ',
    ogType: 'website',
    twitterCard: 'summary',
    twitterTitle: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
    twitterDescription: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Redirect if not admin
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/admin')
    }
  }, [session, router])

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
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
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage('Tənzimləmələr uğurla yeniləndi!')
        setTimeout(() => setMessage(''), 3000)
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

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
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
          <h1 className="text-3xl font-bold text-gray-900">Tənzimləmələr</h1>
          <p className="text-gray-600 mt-2">
            Sayt tənzimləmələrini buradan idarə edə bilərsiniz
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Site Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sayt Məlumatları</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayt Adı
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayt Təsviri
              </label>
              <input
                type="text"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Əlaqə Telefonu
              </label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Əlaqə Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ünvan
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Shipping Settings */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Çatdırılma Tənzimləmələri</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çatdırılma Xərci (₼)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.deliveryCost}
                onChange={(e) => handleInputChange('deliveryCost', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pulsuz Çatdırılma Limiti (₼)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => handleInputChange('freeDeliveryThreshold', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Other Settings */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Digər Tənzimləmələr</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valyuta
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AZN">AZN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ƏDV Dərəcəsi (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Checkboxes */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
                  Texniki xidmət rejimi
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowRegistration"
                  checked={settings.allowRegistration}
                  onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowRegistration" className="ml-2 text-sm text-gray-700">
                  Yeni qeydiyyata icazə ver
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireEmailVerification" className="ml-2 text-sm text-gray-700">
                  Email təsdiqi tələb et
                </label>
              </div>
            </div>
          </div>

          {/* SEO & Meta Data */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">SEO & Meta Məlumatları</h2>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sayt Başlığı (Title)
            </label>
            <input
              type="text"
              value={settings.metaTitle || ''}
              onChange={(e) => handleInputChange('metaTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sayt başlığı..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Təsvir (Description)
            </label>
            <textarea
              value={settings.metaDescription || ''}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sayt haqqında qısa təsvir..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açar Sözlər (Keywords)
            </label>
            <input
              type="text"
              value={settings.metaKeywords || ''}
              onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="parfüm, ətir, online mağaza..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Müəllif (Author)
            </label>
            <input
              type="text"
              value={settings.metaAuthor || ''}
              onChange={(e) => handleInputChange('metaAuthor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Müəllif adı..."
            />
          </div>

          {/* Open Graph Settings */}
          <div className="md:col-span-2">
            <h3 className="text-md font-semibold text-gray-900 mb-4 mt-6">Open Graph (Facebook, LinkedIn)</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OG Başlıq
            </label>
            <input
              type="text"
              value={settings.ogTitle || ''}
              onChange={(e) => handleInputChange('ogTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Social media üçün başlıq..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OG Təsvir
            </label>
            <textarea
              value={settings.ogDescription || ''}
              onChange={(e) => handleInputChange('ogDescription', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Social media üçün təsvir..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dil (Locale)
            </label>
            <select
              value={settings.ogLocale || 'az_AZ'}
              onChange={(e) => handleInputChange('ogLocale', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="az_AZ">Azərbaycan (az_AZ)</option>
              <option value="en_US">İngilis (en_US)</option>
              <option value="tr_TR">Türk (tr_TR)</option>
              <option value="ru_RU">Rus (ru_RU)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Məzmun Tipi
            </label>
            <select
              value={settings.ogType || 'website'}
              onChange={(e) => handleInputChange('ogType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="website">Website</option>
              <option value="article">Məqalə</option>
              <option value="product">Məhsul</option>
              <option value="business">Biznes</option>
            </select>
          </div>

          {/* Twitter Settings */}
          <div className="md:col-span-2">
            <h3 className="text-md font-semibold text-gray-900 mb-4 mt-6">Twitter</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter Kart Tipi
            </label>
            <select
              value={settings.twitterCard || 'summary'}
              onChange={(e) => handleInputChange('twitterCard', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary Large Image</option>
              <option value="app">App</option>
              <option value="player">Player</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter Başlıq
            </label>
            <input
              type="text"
              value={settings.twitterTitle || ''}
              onChange={(e) => handleInputChange('twitterTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Twitter üçün başlıq..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter Təsvir
            </label>
            <textarea
              value={settings.twitterDescription || ''}
              onChange={(e) => handleInputChange('twitterDescription', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Twitter üçün təsvir..."
            />
          </div>
        </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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