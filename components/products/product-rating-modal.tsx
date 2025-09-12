'use client'

import { useState } from 'react'
import { Star, X, MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface ProductRatingModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    image: string
  }
  onRatingSubmit?: () => void
}

export function ProductRatingModal({ isOpen, onClose, product, onRatingSubmit }: ProductRatingModalProps) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error('Rəy yazmaq üçün giriş edin')
      return
    }

    if (rating === 0) {
      toast.error('Zəhmət olmasa məhsulu qiymətləndirin')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/products/${product.id}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating,
          comment: comment,
          userId: session.user.id
        }),
      })

      if (!response.ok) {
        throw new Error('Rating göndərilmədi')
      }

      toast.success('Qiymətləndirmə uğurla göndərildi!')
      onRatingSubmit?.()
      onClose()
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Rating error:', error)
      toast.error('Qiymətləndirmə göndərilmədi')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Məhsulu Qiymətləndirin
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 object-cover rounded"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.jpg'
              }}
            />
            <div>
              <h4 className="font-medium text-gray-900">{product.name}</h4>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qiymətləndirmə
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {rating === 1 && 'Çox pis'}
                {rating === 2 && 'Pis'}
                {rating === 3 && 'Orta'}
                {rating === 4 && 'Yaxşı'}
                {rating === 5 && 'Əla'}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Şərh (istəyə bağlı)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Məhsul haqqında fikrinizi yazın..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 simvol
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Ləğv et
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Göndərilir...' : 'Göndər'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
