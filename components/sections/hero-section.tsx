'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

// Mock slider data - later will come from database
const sliderData = [
  {
    id: '1',
    title: 'Premium Parfüm Koleksiyası',
    subtitle: 'Dünyanın ən yaxşı markaları',
    description: 'Dünyanın ən yaxşı parfüm markalarını sərfəli qiymətlərlə təqdim edirik. Özünüzə layiq olan ətiri tapın.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&h=600&fit=crop',
    link: '/products',
    buttonText: 'Məhsulları Kəşf Et'
  },
  {
    id: '2',
    title: 'Yeni Gələn Məhsullar',
    subtitle: 'Ən son parfüm kolleksiyaları',
    description: 'Bu həftə əlavə edilən yeni parfüm kolleksiyalarını kəşf edin. Məhdud təkliflərlə.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=1200&h=600&fit=crop',
    link: '/products?new=true',
    buttonText: 'Yeni Məhsullar'
  },
  {
    id: '3',
    title: 'Endirim Həftəsi',
    subtitle: '50% -ə qədər endirim',
    description: 'Seçilmiş parfümlərdə böyük endirimlər. Təklif məhdud müddətə etibarlıdır.',
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1200&h=600&fit=crop',
    link: '/products?sale=true',
    buttonText: 'Endirimləri Gör'
  }
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderData.length) % sliderData.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderData.length)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
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
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
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
