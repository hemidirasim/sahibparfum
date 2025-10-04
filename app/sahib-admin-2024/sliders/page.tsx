'use client'

import { useState, useEffect } from 'react'
import { SliderForm } from '@/components/admin/slider-form'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react'

interface Slider {
  id: string
  title: string
  subtitle?: string
  description?: string
  image: string
  link?: string
  buttonText?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function AdminSlidersPage() {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null)

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    try {
      setRefreshing(true)
      console.log('Fetching sliders from server...')
      const response = await fetch('/api/sahib-admin-2024/sliders')
      if (response.ok) {
        const data = await response.json()
        console.log('Sliders fetched from server:', data.map((s: any) => ({ id: s.id, order: s.order, title: s.title })))
        setSliders(data)
      } else {
        console.error('Failed to fetch sliders')
      }
    } catch (error) {
      console.error('Sliders fetch error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    const slider = sliders.find(s => s.id === id)
    if (!slider) return

    try {
      const response = await fetch(`/api/sahib-admin-2024/sliders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...slider,
          isActive: !slider.isActive
        }),
      })

      if (response.ok) {
        setSliders(prev => prev.map(s => 
          s.id === id ? { ...s, isActive: !s.isActive } : s
        ))
      }
    } catch (error) {
      console.error('Toggle active error:', error)
    }
  }

  const handleMoveUp = async (id: string) => {
    const index = sliders.findIndex(s => s.id === id)
    if (index <= 0) return
    
    const newSliders = [...sliders]
    const temp = newSliders[index]
    newSliders[index] = newSliders[index - 1]
    newSliders[index - 1] = temp
    
    const updatedSliders = newSliders.map((s, i) => ({ ...s, order: i + 1 }))
    
    // Update local state immediately
    setSliders(updatedSliders)
    
    // Update server
    try {
      console.log('Updating slider orders:', updatedSliders.map(s => ({ id: s.id, order: s.order, title: s.title })))
      
      const promises = updatedSliders.map(async (slider) => {
        const response = await fetch(`/api/sahib-admin-2024/sliders/${slider.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order: slider.order
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to update slider ${slider.id}: ${errorData.error}`)
        }
        
        const result = await response.json()
        console.log(`Slider ${slider.id} updated successfully:`, result.slider)
        return result
      })
      
      await Promise.all(promises)
      console.log('All slider orders updated successfully')
      
      // Refresh the list to ensure consistency
      setTimeout(() => {
        fetchSliders()
      }, 500)
      
    } catch (error) {
      console.error('Move up error:', error)
      // Revert on error
      fetchSliders()
    }
  }

  const handleMoveDown = async (id: string) => {
    const index = sliders.findIndex(s => s.id === id)
    if (index >= sliders.length - 1) return
    
    const newSliders = [...sliders]
    const temp = newSliders[index]
    newSliders[index] = newSliders[index + 1]
    newSliders[index + 1] = temp
    
    const updatedSliders = newSliders.map((s, i) => ({ ...s, order: i + 1 }))
    
    // Update local state immediately
    setSliders(updatedSliders)
    
    // Update server
    try {
      console.log('Updating slider orders (move down):', updatedSliders.map(s => ({ id: s.id, order: s.order, title: s.title })))
      
      const promises = updatedSliders.map(async (slider) => {
        const response = await fetch(`/api/sahib-admin-2024/sliders/${slider.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order: slider.order
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to update slider ${slider.id}: ${errorData.error}`)
        }
        
        const result = await response.json()
        console.log(`Slider ${slider.id} updated successfully (move down):`, result.slider)
        return result
      })
      
      await Promise.all(promises)
      console.log('All slider orders updated successfully (move down)')
      
      // Refresh the list to ensure consistency
      setTimeout(() => {
        fetchSliders()
      }, 500)
      
    } catch (error) {
      console.error('Move down error:', error)
      // Revert on error
      fetchSliders()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu slider-i silmək istədiyinizə əminsiniz?')) {
      try {
        const response = await fetch(`/api/sahib-admin-2024/sliders/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setSliders(prev => prev.filter(s => s.id !== id))
        }
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const handleSave = (sliderData: any) => {
    if (editingSlider) {
      setSliders(prev => prev.map(s => s.id === editingSlider.id ? sliderData : s))
      setEditingSlider(null)
    } else {
      setSliders(prev => [...prev, { ...sliderData, order: prev.length + 1 }])
      setShowForm(false)
    }
    // Refresh the list to get updated data
    fetchSliders()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSlider(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Slider İdarəetməsi</h1>
            <p className="text-gray-600 mt-1">
              Ana səhifə slider-lərini idarə edin və yeni slider-lər əlavə edin
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Slider
          </button>
        </div>
      </div>

      {/* Sliders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Mövcud Slider-lər ({sliders.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sliders.map((slider) => (
            <div key={slider.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Order Controls */}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleMoveUp(slider.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={slider.order === 1}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-gray-500 text-center">
                      {slider.order}
                    </span>
                    <button
                      onClick={() => handleMoveDown(slider.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={slider.order === sliders.length}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Preview Image */}
                  <div className="w-20 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={slider.image}
                      alt={slider.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {slider.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        slider.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {slider.isActive ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </div>
                    {slider.subtitle && (
                      <p className="text-sm text-gray-600 mb-1">
                        {slider.subtitle}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {slider.description}
                    </p>
                    {slider.link && (
                      <p className="text-xs text-blue-600 mt-1">
                        Link: {slider.link}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(slider.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          slider.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={slider.isActive ? 'Deaktiv et' : 'Aktiv et'}
                      >
                        {slider.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => setEditingSlider(slider)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Redaktə et"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(slider.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

      {/* Empty State */}
      {sliders.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Heç bir slider yoxdur
          </h3>
          <p className="text-gray-600 mb-4">
            İlk slider-inizi əlavə etmək üçün "Yeni Slider" düyməsini basın.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yeni Slider Əlavə Et
          </button>
        </div>
      )}

      {/* Slider Form Modal */}
      {(showForm || editingSlider) && (
        <SliderForm
          slider={editingSlider}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
