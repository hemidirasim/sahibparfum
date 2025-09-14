import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Çatdırılma Dəstəyi - Sahib Parfumeriya',
  description: 'Çatdırılma şərtləri, çatdırılma vaxtları, çatdırılma xərcləri və çatdırılma problemləri.',
  openGraph: {
    title: 'Çatdırılma Dəstəyi - Sahib Parfumeriya',
    description: 'Çatdırılma şərtləri, çatdırılma vaxtları, çatdırılma xərcləri və çatdırılma problemləri.',
  },
}

export default function DeliverySupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Çatdırılma Dəstəyi</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Çatdırılma Şərtləri</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">🏠 Bakı Şəhəri</h3>
                  <p className="text-blue-700 text-sm mb-2">• 1-2 iş günü</p>
                  <p className="text-blue-700 text-sm mb-2">• 10₼ çatdırılma haqqı</p>
                  <p className="text-blue-700 text-sm">• 100₼ üzərində pulsuz çatdırılma</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">🌍 Regionlar</h3>
                  <p className="text-green-700 text-sm mb-2">• 3-5 iş günü</p>
                  <p className="text-green-700 text-sm mb-2">• 15₼ çatdırılma haqqı</p>
                  <p className="text-green-700 text-sm">• 150₼ üzərində pulsuz çatdırılma</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Çatdırılma Vaxtları</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">📅 İş Saatları</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Bazar ertəsi - Cümə:</p>
                    <p className="text-gray-600">09:00 - 18:00</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Şənbə:</p>
                    <p className="text-gray-600">10:00 - 16:00</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-yellow-800 text-sm">
                    <strong>Qeyd:</strong> Bazar günləri çatdırılma edilmir.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Çatdırılma İzləməsi</h2>
              <p className="text-gray-600 mb-4">
                Sifarişinizin çatdırılma statusunu izləmək üçün:
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <p className="text-gray-700">Hesabınıza daxil olun</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <p className="text-gray-700">"Sifarişlərim" bölməsinə keçin</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <p className="text-gray-700">Sifarişin statusunu görün</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Çatdırılma Problemləri</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-red-400 bg-red-50 p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Çatdırılma Gecikdi</h3>
                  <p className="text-red-700 text-sm">
                    • Hava şəraitini yoxlayın<br/>
                    • Çatdırılma xidməti ilə əlaqə saxlayın<br/>
                    • Bizimlə əlaqə saxlayın
                  </p>
                </div>
                <div className="border-l-4 border-orange-400 bg-orange-50 p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">📦 Məhsul Çatdırılmadı</h3>
                  <p className="text-orange-700 text-sm">
                    • Ünvanın düzgün olduğunu yoxlayın<br/>
                    • Telefon nömrənizi yoxlayın<br/>
                    • Dərhal bizimlə əlaqə saxlayın
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ünvan Dəyişikliyi</h2>
              <p className="text-gray-600 mb-4">
                Çatdırılma ünvanını dəyişmək istəyirsinizsə, mümkün qədər tez bizimlə əlaqə saxlayın. 
                Sifariş göndərildikdən sonra ünvan dəyişikliyi mümkün olmaya bilər.
              </p>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Əlavə Yardım Lazımdır?</h2>
              <p className="text-gray-600 mb-4">
                Çatdırılma ilə bağlı əlavə suallarınız varsa, bizimlə əlaqə saxlayın:
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
