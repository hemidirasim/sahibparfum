'use client'

import { useState, useEffect } from 'react'
import { Star, MessageCircle, User, LogIn } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { ProductRatingModal } from './product-rating-modal'

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  user?: {
    name: string
  }
}

interface ProductReviewsProps {
  productId: string
  productName: string
  productImage: string
}

export default function ProductReviews({ productId, productName, productImage }: ProductReviewsProps) {
  const { data: session, status } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hasUserRated, setHasUserRated] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId, session])

  const fetchReviews = async () => {
    try {
      // Bütün rəyləri yüklə (giriş etmədən də)
      const response = await fetch(`/api/products/${productId}/ratings`)
      if (response.ok) {
        const data = await response.json()
        
        // Sadə rating və comment olan rəyləri filtrlə
        const simpleReviews = data.ratings
          .filter((rating: any) => rating.rating && rating.comment)
          .map((rating: any) => ({
            id: rating.id,
            rating: rating.rating,
            comment: rating.comment,
            createdAt: rating.createdAt,
            user: rating.user
          }))
        
        setReviews(simpleReviews)
        
        // Orta qiymətləndirməni hesabla
        const ratings = data.ratings.filter((r: any) => r.rating).map((r: any) => r.rating)
        if (ratings.length > 0) {
          const avg = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
          setAverageRating(avg)
        }
        
        setTotalReviews(ratings.length)
        
        // Yalnız giriş edən istifadəçilər üçün user rating yoxla
        if (session?.user) {
          const userResponse = await fetch(`/api/products/${productId}/ratings?userId=${session.user.id}`)
          if (userResponse.ok) {
            const userData = await userResponse.json()
            setHasUserRated(!!userData.userRating)
          }
        }
      }
    } catch (error) {
      console.error('Rəylər yüklənə bilmədi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingSubmit = () => {
    fetchReviews() // Rəyləri yenilə
    setShowRatingModal(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Məhsul Rəyləri
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} ({totalReviews} rəy)
            </span>
          </div>
        </div>
        
        {session?.user ? (
          !hasUserRated && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Star className="w-4 h-4 mr-2" />
              Rəy Yaz
            </button>
          )
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Rəy yazmaq üçün giriş edin</p>
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Giriş Et
            </button>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Hələ heç bir rəy yoxdur</p>
          {session?.user ? (
            !hasUserRated && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Star className="w-4 h-4 mr-2" />
                İlk rəyi siz yazın
              </button>
            )
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Rəy yazmaq üçün giriş edin</p>
              <button
                onClick={() => window.location.href = '/auth/signin'}
                className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Giriş Et
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.user?.name || 'İstifadəçi'}
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      <ProductRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        product={{
          id: productId,
          name: productName,
          image: productImage
        }}
        onRatingSubmit={handleRatingSubmit}
      />
    </div>
  )
}
