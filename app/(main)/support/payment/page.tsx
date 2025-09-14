import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ödəniş Dəstəyi - Sahib Parfumeriya',
  description: 'Ödəniş üsulları, təhlükəsiz ödəniş, ödəniş problemləri və geri ödənişlər haqqında məlumat.',
  openGraph: {
    title: 'Ödəniş Dəstəyi - Sahib Parfumeriya',
    description: 'Ödəniş üsulları, təhlükəsiz ödəniş, ödəniş problemləri və geri ödənişlər haqqında məlumat.',
  },
}

export default function PaymentSupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Ödəniş Dəstəyi</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Qəbul Edilən Ödəniş Üsulları</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">💳 Bank Kartları</h3>
                  <p className="text-blue-700 text-sm">Visa, Mastercard, American Express</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">📱 Mobil Ödəniş</h3>
                  <p className="text-green-700 text-sm">Bakcell, Nar, Azercell</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🏦 Bank Köçürməsi</h3>
                  <p className="text-purple-700 text-sm">Birbaşa bank hesabına</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">💰 Nağd Ödəniş</h3>
                  <p className="text-orange-700 text-sm">Çatdırılma zamanı</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Təhlükəsiz Ödəniş</h2>
              <p className="text-gray-600 mb-4">
                Bütün ödənişlərimiz SSL şifrələmə ilə qorunur. Kart məlumatlarınız təhlükəsizdir və 
                üçüncü tərəflərlə paylaşılmır.
              </p>
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-green-800">
                  <strong>Təhlükəsizlik:</strong> Bütün ödənişlər 3D Secure protokolu ilə qorunur.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ödəniş Problemləri</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-red-400 bg-red-50 p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Ödəniş Uğursuz Oldu</h3>
                  <p className="text-red-700 text-sm">
                    • Kart limitini yoxlayın<br/>
                    • İnternet bağlantısını yoxlayın<br/>
                    • Kartın qüvvədə olduğunu təsdiqləyin
                  </p>
                </div>
                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">⏳ Ödəniş Gözləyir</h3>
                  <p className="text-yellow-700 text-sm">
                    • Bank tərəfindən təsdiq gözlənilir<br/>
                    • Bir neçə dəqiqə gözləyin<br/>
                    • Hələ də problem varsa bizimlə əlaqə saxlayın
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Geri Ödəniş</h2>
              <p className="text-gray-600 mb-4">
                Geri ödənişlər 3-5 iş günü ərzində orijinal ödəniş üsuluna qaytarılır.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800">
                  <strong>Qeyd:</strong> Geri ödənişlər yalnız qanuni səbəblər üçün edilir.
                </p>
              </div>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Əlavə Yardım Lazımdır?</h2>
              <p className="text-gray-600 mb-4">
                Ödənişlə bağlı əlavə suallarınız varsa, bizimlə əlaqə saxlayın:
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
