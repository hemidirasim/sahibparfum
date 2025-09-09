import Image from 'next/image'
import { Award, Users, Package, Truck, Shield, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Haqqımızda</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Sahib Parfümeriya - Azərbaycanın ən böyük və etibarlı parfüm mağazası. 
              20 ildən artıq təcrübəmizlə sizə ən yaxşı xidməti təqdim edirik.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Bizim Hekayəmiz</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                2004-cü ildə Bakı şəhərində kiçik bir parfüm mağazası kimi başladığımız 
                yolculuğumuz, bu gün Azərbaycanın ən böyük parfüm şəbəkəsinə çevrildi.
              </p>
              <p>
                Sahib Parfümeriya olaraq, dünyanın ən məşhur parfüm brendlərini 
                Azərbaycan müştərilərimizə təqdim edirik. Chanel, Dior, Yves Saint Laurent, 
                Tom Ford və daha çox brendlərin rəsmi tərəfdaşıyıq.
              </p>
              <p>
                Müştəri məmnuniyyəti bizim ən böyük prioritetimizdir. Hər bir məhsulumuz 
                orijinal və zəmanətli olduğu üçün rahatlıqla alış-veriş edə bilərsiniz.
              </p>
            </div>
          </div>
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1588405748880-12d1d1a6f6a9?w=600&h=400&fit=crop"
              alt="Sahib Parfümeriya Mağazası"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">50,000+</h3>
            <p className="text-gray-600">Məmnun Müştəri</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">1000+</h3>
            <p className="text-gray-600">Məhsul Növü</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">20+</h3>
            <p className="text-gray-600">İllik Təcrübə</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">24 Saat</h3>
            <p className="text-gray-600">Çatdırılma</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Etibarlılıq</h3>
              <p className="text-gray-600">
                Bütün məhsullarımız orijinal və zəmanətli olduğu üçün 
                rahatlıqla alış-veriş edə bilərsiniz.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Müştəri Məmnuniyyəti</h3>
              <p className="text-gray-600">
                Müştərilərimizin məmnuniyyəti bizim ən böyük prioritetimizdir. 
                Hər zaman sizin üçün buradayıq.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Keyfiyyət</h3>
              <p className="text-gray-600">
                Yalnız ən yüksək keyfiyyətli məhsulları təqdim edirik və 
                daimi olaraq keyfiyyətimizi artırırıq.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Komandamız</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                  alt="CEO"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Əli Məmmədov</h3>
              <p className="text-primary-600 mb-2">CEO & Təsisçi</p>
              <p className="text-gray-600 text-sm">
                20 ildən artıq təcrübəsi olan parfüm sahəsində mütəxəssis.
              </p>
            </div>
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
                  alt="Marketing Manager"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aynur Əliyeva</h3>
              <p className="text-primary-600 mb-2">Marketinq Meneceri</p>
              <p className="text-gray-600 text-sm">
                Müştəri məmnuniyyəti və marketinq strategiyaları sahəsində mütəxəssis.
              </p>
            </div>
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
                  alt="Sales Manager"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rəşad Hüseynov</h3>
              <p className="text-primary-600 mb-2">Satış Meneceri</p>
              <p className="text-gray-600 text-sm">
                Satış və müştəri xidmətləri sahəsində 10 ildən artıq təcrübə.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-primary-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Bizimlə Əlaqə Saxlayın</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Hər hansı sualınız və ya təklifiniz varsa, bizimlə əlaqə saxlayın. 
            Komandamız sizə kömək etməkdən məmnuniyyət duyacaq.
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
