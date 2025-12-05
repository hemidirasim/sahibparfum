'use client'

import Image from 'next/image'
import { Award, Users, Package, Truck, Shield, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AboutSettings {
  aboutHeroTitle?: string | null
  aboutHeroDescription?: string | null
  aboutStoryTitle?: string | null
  aboutStoryContent?: string | null
  aboutStat1Value?: string | null
  aboutStat1Label?: string | null
  aboutStat2Value?: string | null
  aboutStat2Label?: string | null
  aboutStat3Value?: string | null
  aboutStat3Label?: string | null
  aboutStat4Value?: string | null
  aboutStat4Label?: string | null
  aboutValue1Title?: string | null
  aboutValue1Description?: string | null
  aboutValue2Title?: string | null
  aboutValue2Description?: string | null
  aboutValue3Title?: string | null
  aboutValue3Description?: string | null
  aboutCtaTitle?: string | null
  aboutCtaDescription?: string | null
  aboutImage?: string | null
}

export default function AboutPage() {
  const [settings, setSettings] = useState<AboutSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const timestamp = Date.now()
        const response = await fetch(`/api/settings?_t=${timestamp}`, {
          cache: 'no-store',
          next: { revalidate: 0 }
        })
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error fetching about content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutContent()
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Use database values directly, only fallback to defaults if null/undefined
  const heroTitle = settings?.aboutHeroTitle || 'Haqqımızda'
  const heroDescription = settings?.aboutHeroDescription || 'Sahib Parfümeriya - Azərbaycanın ən böyük və etibarlı parfüm mağazası. 20 ildən artıq təcrübəmizlə sizə ən yaxşı xidməti təqdim edirik.'
  const storyTitle = settings?.aboutStoryTitle || 'Bizim Hekayəmiz'
  const storyContent = settings?.aboutStoryContent || '2004-cü ildə Bakı şəhərində kiçik bir parfüm mağazası kimi başladığımız yolculuğumuz, bu gün Azərbaycanın ən böyük parfüm şəbəkəsinə çevrildi.\n\nSahib Parfümeriya olaraq, dünyanın ən məşhur parfüm brendlərini Azərbaycan müştərilərimizə təqdim edirik. Chanel, Dior, Yves Saint Laurent, Tom Ford və daha çox brendlərin rəsmi tərəfdaşıyıq.\n\nMüştəri məmnuniyyəti bizim ən böyük prioritetimizdir. Hər bir məhsulumuz orijinal və zəmanətli olduğu üçün rahatlıqla alış-veriş edə bilərsiniz.'
  const stat1Value = settings?.aboutStat1Value || '50,000+'
  const stat1Label = settings?.aboutStat1Label || 'Məmnun Müştəri'
  const stat2Value = settings?.aboutStat2Value || '1000+'
  const stat2Label = settings?.aboutStat2Label || 'Məhsul Növü'
  const stat3Value = settings?.aboutStat3Value || '20+'
  const stat3Label = settings?.aboutStat3Label || 'İllik Təcrübə'
  const stat4Value = settings?.aboutStat4Value || '24 Saat'
  const stat4Label = settings?.aboutStat4Label || 'Çatdırılma'
  const value1Title = settings?.aboutValue1Title || 'Etibarlılıq'
  const value1Description = settings?.aboutValue1Description || 'Bütün məhsullarımız orijinal və zəmanətli olduğu üçün rahatlıqla alış-veriş edə bilərsiniz.'
  const value2Title = settings?.aboutValue2Title || 'Müştəri Məmnuniyyəti'
  const value2Description = settings?.aboutValue2Description || 'Müştərilərimizin məmnuniyyəti bizim ən böyük prioritetimizdir. Hər zaman sizin üçün buradayıq.'
  const value3Title = settings?.aboutValue3Title || 'Keyfiyyət'
  const value3Description = settings?.aboutValue3Description || 'Yalnız ən yüksək keyfiyyətli məhsulları təqdim edirik və daimi olaraq keyfiyyətimizi artırırıq.'
  const ctaTitle = settings?.aboutCtaTitle || 'Bizimlə Əlaqə Saxlayın'
  const ctaDescription = settings?.aboutCtaDescription || 'Hər hansı sualınız və ya təklifiniz varsa, bizimlə əlaqə saxlayın. Komandamız sizə kömək etməkdən məmnuniyyət duyacaq.'
  const aboutImage = settings?.aboutImage

  // Split story content into paragraphs
  const storyParagraphs = storyContent.split('\n').filter(p => p.trim())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{heroTitle}</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              {heroDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{storyTitle}</h2>
            <div className="space-y-4 text-gray-600">
              {storyParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative">
            {aboutImage ? (
              <Image
                src={aboutImage}
                alt="Sahib Parfümeriya Mağazası"
                width={600}
                height={400}
                className="rounded-lg shadow-lg object-cover"
              />
            ) : (
              <Image
                src="https://images.unsplash.com/photo-1588405748880-12d1d1a6f6a9?w=600&h=400&fit=crop"
                alt="Sahib Parfümeriya Mağazası"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat1Value}</h3>
            <p className="text-gray-600">{stat1Label}</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat2Value}</h3>
            <p className="text-gray-600">{stat2Label}</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat3Value}</h3>
            <p className="text-gray-600">{stat3Label}</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat4Value}</h3>
            <p className="text-gray-600">{stat4Label}</p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Dəyərlərimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value1Title}</h3>
              <p className="text-gray-600">
                {value1Description}
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value2Title}</h3>
              <p className="text-gray-600">
                {value2Description}
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value3Title}</h3>
              <p className="text-gray-600">
                {value3Description}
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-primary-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{ctaTitle}</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            {ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="btn btn-outline btn-white"
            >
              Əlaqə
            </a>
            <a
              href="/products"
              className="btn btn-primary"
            >
              Məhsullarımızı Görün
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
