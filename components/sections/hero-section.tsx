'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

interface SliderData {
  id: string
  title: string
  subtitle?: string
  description?: string
  image: string
  link?: string
  buttonText?: string
  isActive: boolean
  order: number
}

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [sliderData, setSliderData] = useState<SliderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch('/api/sliders')
        if (response.ok) {
          const data = await response.json()
          setSliderData(data)
        }
      } catch (error) {
        console.error('Error fetching sliders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSliders()
  }, [])

  useEffect(() => {
    if (!isPlaying || sliderData.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying, sliderData.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    if (sliderData.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + sliderData.length) % sliderData.length)
  }

  const goToNext = () => {
    if (sliderData.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % sliderData.length)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (loading) {
    return (
      <section className="relative h-[600px] overflow-hidden bg-gray-200">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Slider yüklənir...</p>
          </div>
        </div>
      </section>
    )
  }

  if (sliderData.length === 0) {
    return (
      <section className="relative h-[600px] overflow-hidden bg-gray-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sahib Parfumeriya</h1>
            <p className="text-xl text-gray-600">Premium parfüm kolleksiyası</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              {slide.image ? (
                <>
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                      if (placeholder) {
                        placeholder.style.display = 'flex'
                      }
                    }}
                    onLoad={(e) => {
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                      if (placeholder) {
                        placeholder.style.display = 'none'
                      }
                    }}
                  />
                  <div 
                    className="absolute inset-0 bg-gray-100 flex items-center justify-center" 
                    style={{ display: 'none' }}
                  >
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-lg text-gray-500 font-medium">Şəkil yoxdur</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-lg text-gray-500 font-medium">Şəkil yoxdur</div>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  {slide.subtitle && (
                    <p className="text-primary-200 text-lg md:text-xl font-medium mb-2 animate-fade-in">
                      {slide.subtitle}
                    </p>
                  )}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200 mb-8 animate-fade-in-delay">
                    {slide.description}
                  </p>
                  {slide.link && slide.buttonText && (
                    <Link
                      href={slide.link}
                      className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 animate-fade-in-delay-2"
                    >
                      {slide.buttonText}
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {sliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-primary-500 transition-all duration-1000 ease-linear"
          style={{
            width: `${((currentSlide + 1) / sliderData.length) * 100}%`
          }}
        />
      </div>
    </section>
  )
}
