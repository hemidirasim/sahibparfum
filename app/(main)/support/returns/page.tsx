import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Geri Qaytarma Dəstəyi - Sahib Parfumeriya',
  description: 'Geri qaytarma şərtləri, geri qaytarma proseduru və geri ödənişlər haqqında məlumat.',
  openGraph: {
    title: 'Geri Qaytarma Dəstəyi - Sahib Parfumeriya',
    description: 'Geri qaytarma şərtləri, geri qaytarma proseduru və geri ödənişlər haqqında məlumat.',
  },
}

export default function ReturnsSupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Geri Qaytarma Dəstəyi</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Geri Qaytarma Şərtləri</h2>
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3">✅ Geri Qaytarma Mümkün Olan Hallar</h3>
                <ul className="text-green-700 text-sm space-y-2">
                  <li>• Məhsul alındığı tarixdən 14 gün ərzində</li>
                  <li>• Məhsul istifadə edilməyib (orijinal qablaşdırmada)</li>
                  <li>• Qəbz və ya e-poçt təsdiqi mövcuddur</li>
                  <li>• Məhsul zədələnməyib</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg mt-4">
                <h3 className="font-semibold text-red-800 mb-3">❌ Geri Qaytarma Mümkün Olmayan Hallar</h3>
                <ul className="text-red-700 text-sm space-y-2">
                  <li>• İstifadə edilmiş məhsullar</li>
                  <li>• 14 günlük müddət keçib</li>
                  <li>• Orijinal qablaşdırma itib</li>
                  <li>• Şəxsi gigiyena məhsulları</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Geri Qaytarma Proseduru</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Bizimlə Əlaqə Saxlayın</h3>
                    <p className="text-gray-600 text-sm">
                      Geri qaytarma istəyinizi bildirin və sifariş nömrənizi qeyd edin.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Geri Qaytarma Kodunu Alın</h3>
                    <p className="text-gray-600 text-sm">
                      Təsdiq edildikdən sonra geri qaytarma kodu e-poçtla göndəriləcək.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Məhsulu Hazırlayın</h3>
                    <p className="text-gray-600 text-sm">
                      Məhsulu orijinal qablaşdırmada və qəbzlə birlikdə hazırlayın.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Geri Göndərin</h3>
                    <p className="text-gray-600 text-sm">
                      Kuryer xidməti ilə və ya mağazamıza gətirərək geri göndərin.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">5</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Geri Ödəniş</h3>
                    <p className="text-gray-600 text-sm">
                      Məhsul yoxlandıqdan sonra 3-5 iş günü ərzində geri ödəniş ediləcək.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Geri Ödəniş Növləri</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">💳 Bank Kartına</h3>
                  <p className="text-blue-700 text-sm mb-2">• 3-5 iş günü</p>
                  <p className="text-blue-700 text-sm">• Orijinal ödəniş üsuluna</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">💰 Nağd Pul</h3>
                  <p className="text-green-700 text-sm mb-2">• Dərhal</p>
                  <p className="text-green-700 text-sm">• Mağazada geri qaytarma</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Çatdırılma Xərcləri</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">📦 Geri Qaytarma Xərcləri</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Məhsul qüsurludursa:</span>
                    <span className="font-semibold text-green-600">Biz ödəyirik</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Müştəri istəyindir:</span>
                    <span className="font-semibold text-orange-600">Müştəri ödəyir</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tez-tez Verilən Suallar</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Geri qaytarma müddəti nə qədərdir?</h3>
                  <p className="text-gray-600 text-sm">
                    Məhsul alındığı tarixdən 14 gün ərzində geri qaytarma mümkündür.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Geri ödəniş nə qədər vaxt alır?</h3>
                  <p className="text-gray-600 text-sm">
                    Geri ödənişlər 3-5 iş günü ərzində orijinal ödəniş üsuluna qaytarılır.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Qablaşdırma itibsə nə etməli?</h3>
                  <p className="text-gray-600 text-sm">
                    Orijinal qablaşdırma olmadan geri qaytarma mümkün deyil. Lütfən, qablaşdırmanı saxlayın.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Geri Qaytarma Tələb Et</h2>
              <p className="text-gray-600 mb-4">
                Geri qaytarma tələb etmək üçün bizimlə əlaqə saxlayın:
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
