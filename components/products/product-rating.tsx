'use client'

import { useState, useEffect } from 'react'

interface RatingData {
  relationship: string | null
  longevity: string | null
  sillage: string | null
  ageGroup: string | null
  season: string | null
  timeOfDay: string | null
}

interface RatingStats {
  total: number
  relationship: Record<string, number>
  duration: Record<string, number>
  distance: Record<string, number>
  age: Record<string, number>
  season: Record<string, number>
  time: Record<string, number>
}

export default function ProductRating({ productId }: { productId: string }) {
  const [ratingData, setRatingData] = useState<RatingData>({
    relationship: null,
    longevity: null,
    sillage: null,
    ageGroup: null,
    season: null,
    timeOfDay: null
  })

  const [stats, setStats] = useState<RatingStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Dəyərləndirmələri yüklə
  useEffect(() => {
    fetchRatings()
  }, [productId])

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/ratings`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Dəyərləndirmələr yüklənə bilmədi:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectOption = async (category: keyof RatingData, option: string) => {
    const newRatingData = {
      ...ratingData,
      [category]: option
    }
    
    setRatingData(newRatingData)

    // Guest Session ID-ni localStorage-dən al və ya yarad
    let guestSessionId = localStorage.getItem(`guest_session_${productId}`)
    if (!guestSessionId) {
      guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(`guest_session_${productId}`, guestSessionId)
    }

    // Avtomatik olaraq bazaya yaz
    try {
      const response = await fetch(`/api/products/${productId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [category]: option,
          guestSessionId
        }),
      })

      if (response.ok) {
        // Statistikaları yenilə
        fetchRatings()
      }
    } catch (error) {
      console.error('Dəyərləndirmə yadda saxlanıla bilmədi:', error)
    }
  }

  const getProgressPercentage = (category: string, option: string) => {
    if (!stats || !stats[category as keyof RatingStats] || typeof stats[category as keyof RatingStats] !== 'object') {
      return 0
    }
    const categoryStats = stats[category as keyof RatingStats] as Record<string, number>
    if (!categoryStats[option]) {
      return 0
    }
    const count = categoryStats[option]
    return Math.round((count / stats.total) * 100)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Məhsul Dəyərləndirməsi
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Dəyərləndirmələr yüklənir...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Məhsul Dəyərləndirməsi
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ətir Münasibətiniz */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">💖</span>
            <h4 className="font-semibold text-gray-800">Ətir Münasibətiniz</h4>
          </div>
          <div className="space-y-2">
            {[
              { value: 'love', label: 'Sevimli ətrimdir' },
              { value: 'like', label: 'Bəyənirəm' },
              { value: 'dislike', label: 'Mənim ətrim deyil' }
            ].map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                  ratingData.relationship === option.value
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => selectOption('relationship', option.value)}
              >
                <span className="text-sm text-gray-700">{option.label}</span>
                <div className="flex items-center gap-2">
                  {stats && (
                    <>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {stats.relationship[option.value] || 0}
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${getProgressPercentage('relationship', option.value)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Günün Hansı Vaxtı Üçün */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">⏰</span>
            <h4 className="font-semibold text-gray-800">Günün Hansı Vaxtı Üçün</h4>
          </div>
          <div className="space-y-2">
            {[
              { value: 'daily', label: 'Gündüz' },
              { value: 'evening', label: 'Axşam' }
            ].map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                  ratingData.timeOfDay === option.value
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => selectOption('timeOfDay', option.value)}
              >
                <span className="text-sm text-gray-700">{option.label}</span>
                <div className="flex items-center gap-2">
                  {stats && (
                    <>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {stats.time[option.value] || 0}
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${getProgressPercentage('time', option.value)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ətrin Qalıcılığı */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">⏳</span>
            <h4 className="font-semibold text-gray-800">Ətrin Qalıcılığı</h4>
          </div>
          <div className="space-y-2">
            {[
              { value: 'weak', label: 'Zəifdir (0,5–1 s.)' },
              { value: 'short', label: 'Qalıcı deyil (1-2 s.)' },
              { value: 'medium', label: 'Orta qalıcı (3-6 s.)' },
              { value: 'strong', label: 'Qalıcıdır (7-12 s.)' },
              { value: 'very-strong', label: 'Çox qalıcıdır (12-24 s.)' }
            ].map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                  ratingData.longevity === option.value
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => selectOption('longevity', option.value)}
              >
                <span className="text-sm text-gray-700">{option.label}</span>
                <div className="flex items-center gap-2">
                  {stats && (
                    <>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {stats.duration[option.value] || 0}
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${getProgressPercentage('duration', option.value)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hansı Məsafədən Hiss Edilir */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🌊</span>
            <h4 className="font-semibold text-gray-800">Hansı Məsafədən Hiss Edilir</h4>
          </div>
          <div className="space-y-2">
            {[
              { value: 'none', label: 'Şleyf yoxdur' },
              { value: 'close', label: 'Dəriyə yaxın' },
              { value: 'arm', label: 'Açılmış qol məsafəsində' },
              { value: 'steps', label: '6 addımlıq məsafədən' },
              { value: 'room', label: 'Otağı bürüyür' }
            ].map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                  ratingData.sillage === option.value
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => selectOption('sillage', option.value)}
              >
                <span className="text-sm text-gray-700">{option.label}</span>
                <div className="flex items-center gap-2">
                  {stats && (
                    <>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {stats.distance[option.value] || 0}
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${getProgressPercentage('distance', option.value)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hansı Yaş Üçün */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">👤</span>
            <h4 className="font-semibold text-gray-800">Hansı Yaş Üçün</h4>
          </div>
          <div className="space-y-2">
            {[
              { value: 'young', label: '18 yaşadək' },
              { value: 'young-adult', label: '18-26 yaş' },
              { value: 'adult', label: '26-35 yaş' },
              { value: 'mature', label: '35-45 yaş' },
              { value: 'senior', label: '45-dən yuxarı' }
            ].map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                  ratingData.ageGroup === option.value
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => selectOption('ageGroup', option.value)}
              >
                <span className="text-sm text-gray-700">{option.label}</span>
                <div className="flex items-center gap-2">
                  {stats && (
                    <>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {stats.age[option.value] || 0}
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${getProgressPercentage('age', option.value)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hansı Fəsil Üçün */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🌿</span>
            <h4 className="font-semibold text-gray-800">Hansı Fəsil Üçün</h4>
          </div>
          <div className="space-y-2">
            {[
              { value: 'winter', label: 'Qış' },
              { value: 'spring', label: 'Yaz' },
              { value: 'summer', label: 'Yay' },
              { value: 'autumn', label: 'Payız' }
            ].map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                  ratingData.season === option.value
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => selectOption('season', option.value)}
              >
                <span className="text-sm text-gray-700">{option.label}</span>
                <div className="flex items-center gap-2">
                  {stats && (
                    <>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {stats.season[option.value] || 0}
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${getProgressPercentage('season', option.value)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}