import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bonus və Loyallıq Proqramı - Sahib Parfumeriya',
  description: 'Loyallıq proqramı, bonus balansı, xal toplama və bonus istifadəsi haqqında məlumat.',
  openGraph: {
    title: 'Bonus və Loyallıq Proqramı - Sahib Parfumeriya',
    description: 'Loyallıq proqramı, bonus balansı, xal toplama və bonus istifadəsi haqqında məlumat.',
  },
}

export default function LoyaltySupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Bonus və Loyallıq Proqramı</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Loyallıq Proqramı Nədir?</h2>
              <p className="text-gray-600 mb-4">
                Sahib Parfumeriya loyallıq proqramı ilə alış-verişlərinizdən xal toplayın və 
                bu xalları gələcək alış-verişlərinizdə istifadə edin.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-l-4 border-purple-400">
                <p className="text-purple-800">
                  <strong>🎁 Xüsusi Təklif:</strong> İlk alış-verişinizdə əlavə 100 xal qazanın!
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Xal Toplama Qaydaları</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">💳 Adi Alış-veriş</h3>
                  <p className="text-blue-700 text-sm mb-2">• Hər 1₼ üçün 1 xal</p>
                  <p className="text-blue-700 text-sm">• Minimum 10₼ alış-veriş</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">⭐ Xüsusi Təkliflər</h3>
                  <p className="text-green-700 text-sm mb-2">• 2x xal günləri</p>
                  <p className="text-green-700 text-sm">• Brend xalları</p>
                  <p className="text-green-700 text-sm">• Həftəsonu bonusları</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Xal İstifadəsi</h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">💰 Xal Dəyəri</h3>
                  <p className="text-yellow-700 text-sm">
                    100 xal = 1₼ endirim
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">📝 İstifadə Qaydaları</h3>
                  <p className="text-blue-700 text-sm">
                    • Minimum 100 xal istifadə etmək lazımdır<br/>
                    • Xallar 1 il müddətində etibarlıdır<br/>
                    • Endirimlərlə birlikdə istifadə edilə bilər
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Loyallıq Səviyyələri</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                  <h3 className="font-semibold text-gray-800 mb-2">🥉 Gümüş Üzv</h3>
                  <p className="text-gray-700 text-sm">
                    0-999 xal • Adi xal toplama sürəti
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <h3 className="font-semibold text-blue-800 mb-2">🥈 Qızıl Üzv</h3>
                  <p className="text-blue-700 text-sm">
                    1000-4999 xal • 1.5x xal toplama sürəti
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <h3 className="font-semibold text-purple-800 mb-2">🥇 Platin Üzv</h3>
                  <p className="text-purple-700 text-sm">
                    5000+ xal • 2x xal toplama sürəti + xüsusi təkliflər
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Bonus Balansınızı Necə Yoxlaya Bilərsiniz?</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">1</span>
                  </div>
                  <p className="text-gray-700">Hesabınıza daxil olun</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">2</span>
                  </div>
                  <p className="text-gray-700">"Profil" bölməsinə keçin</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">3</span>
                  </div>
                  <p className="text-gray-700">"Loyallıq Balansı" bölməsini tapın</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tez-tez Verilən Suallar</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Xallarım itəcəkmi?</h3>
                  <p className="text-gray-600 text-sm">
                    Xallar 1 il müddətində etibarlıdır. Bu müddət bitdikdən sonra istifadə edilməyən xallar silinir.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Xalları başqasına verə bilərəmmi?</h3>
                  <p className="text-gray-600 text-sm">
                    Xallar şəxsi hesabınıza bağlıdır və başqasına ötürülə bilməz.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Xallarımı geri qaytara bilərəmmi?</h3>
                  <p className="text-gray-600 text-sm">
                    Xallar geri qaytarılmır, lakin istifadə etməmiş xallarınız hesabınızda qalır.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Əlavə Yardım Lazımdır?</h2>
              <p className="text-gray-600 mb-4">
                Loyallıq proqramı ilə bağlı əlavə suallarınız varsa, bizimlə əlaqə saxlayın:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="tel:+994501234567" 
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  📞 +994 50 123 45 67
                </a>
                <a 
                  href="mailto:info@sahibparfum.az" 
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ✉️ info@sahibparfum.az
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
