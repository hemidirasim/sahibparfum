'use client'

import { useState } from 'react'
import { X, Upload, Eye } from 'lucide-react'

interface SliderFormProps {
  slider?: any
  onSave: (data: any) => void
  onCancel: () => void
}

export function SliderForm({ slider, onSave, onCancel }: SliderFormProps) {
  const [formData, setFormData] = useState({
    title: slider?.title || '',
    subtitle: slider?.subtitle || '',
    description: slider?.description || '',
    image: slider?.image || '',
    link: slider?.link || '',
    buttonText: slider?.buttonText || '',
    isActive: slider?.isActive ?? true,
    order: slider?.order || 1
  })

  const [imagePreview, setImagePreview] = useState(slider?.image || '')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const [uploading, setUploading] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })

        if (response.ok) {
          const data = await response.json()
          setFormData(prev => ({ ...prev, image: data.url }))
          setImagePreview(data.url)
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Upload failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          alert(`Upload failed: ${errorData.error || errorData.details || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
      } finally {
        setUploading(false)
      }
    }
  }

  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const url = slider ? `/api/admin/sliders/${slider.id}` : '/api/admin/sliders'
      const method = slider ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        onSave(data.slider || data)
      } else {
        console.error('Save failed')
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {slider ? 'Slider-i Redaktə Et' : 'Yeni Slider Əlavə Et'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
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
              required
              className="input w-full"
              placeholder="Slider başlığı"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              Alt Başlıq
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="Alt başlıq (mövhum)"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Təsvir
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="input w-full resize-none"
              placeholder="Slider təsviri"
            />
          </div>

          {/* Image */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Şəkil *
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className={`flex items-center justify-center w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="text-center">
                    <Upload className="mx-auto h-6 w-6 text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1">
                      {uploading ? 'Yüklənir...' : 'Şəkil yüklə'}
                    </p>
                  </div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="Və ya şəkil URL-i daxil edin"
                className="input w-full"
              />
            </div>
          </div>

          {/* Link */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
              Link
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="https://example.com"
            />
          </div>

          {/* Button Text */}
          <div>
            <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-2">
              Düymə Mətni
            </label>
            <input
              type="text"
              id="buttonText"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="Düymə mətni"
            />
          </div>

          {/* Order */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
              Sıra Nömrəsi
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min="1"
              className="input w-full"
              placeholder="Slider sırası"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Slider aktivdir
            </label>
          </div>

          {/* Preview */}
          {imagePreview && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Önizləmə</h3>
              <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
                <div className="absolute inset-0 flex items-center p-4">
                  <div className="text-white">
                    {formData.subtitle && (
                      <p className="text-sm font-medium mb-1">{formData.subtitle}</p>
                    )}
                    <h2 className="text-xl font-bold mb-2">{formData.title}</h2>
                    {formData.description && (
                      <p className="text-sm opacity-90">{formData.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
            >
              Ləğv Et
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Yadda Saxlanır...' : (slider ? 'Yadda Saxla' : 'Əlavə Et')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
