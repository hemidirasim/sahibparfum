import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tez-tez Verilən Suallar - Sahib Parfumeriya',
  description: 'Sahib Parfumeriya haqqında tez-tez verilən suallar və cavablar.',
  openGraph: {
    title: 'Tez-tez Verilən Suallar - Sahib Parfumeriya',
    description: 'Sahib Parfumeriya haqqında tez-tez verilən suallar və cavablar.',
  },
}

export default function FAQSupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Tez-tez Verilən Suallar</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">🛒 Alış-veriş</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Necə sifariş verə bilərəm?</h3>
                  <p className="text-gray-600 text-sm">
                    Saytımızda qeydiyyatdan keçin, məhsulu seçin, səbətə əlavə edin və ödəniş edin. 
                    Sifarişiniz avtomatik olaraq emal ediləcək.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Minimum sifariş məbləği varmı?</h3>
                  <p className="text-gray-600 text-sm">
                    Minimum sifariş məbləği yoxdur. Hər hansı məbləğdə sifariş verə bilərsiniz.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Məhsul stokda yoxdursa nə edəcəyəm?</h3>
                  <p className="text-gray-600 text-sm">
                    Stokda olmayan məhsullar üçün bildiriş ala bilərsiniz. Məhsul stoka gələndə e-poçtla məlumatlandırılacaqsınız.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">💳 Ödəniş</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Hansı ödəniş üsulları qəbul edilir?</h3>
                  <p className="text-gray-600 text-sm">
                    Bank kartları (Visa, Mastercard), mobil ödəniş (Bakcell, Nar, Azercell), 
                    bank köçürməsi və nağd ödəniş qəbul edilir.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Ödənişim təhlükəsizdirmi?</h3>
                  <p className="text-gray-600 text-sm">
                    Bəli, bütün ödənişlər SSL şifrələmə ilə qorunur və 3D Secure protokolu istifadə edilir.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Ödəniş zamanı xəta aldım, nə etməliyəm?</h3>
                  <p className="text-gray-600 text-sm">
                    Ödəniş xətası zamanı bankınızla əlaqə saxlayın və ya bizimlə əlaqə saxlayın. 
                    Pul hesabınızdan çıxarılıbsa, avtomatik olaraq geri qaytarılacaq.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">🚚 Çatdırılma</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Çatdırılma haqqı nə qədərdir?</h3>
                  <p className="text-gray-600 text-sm">
                    Bakı üçün 10₼, regionlar üçün 15₼. 100₼ üzərində (Bakı) və 150₼ üzərində 
                    (regionlar) pulsuz çatdırılma.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Çatdırılma nə qədər vaxt alır?</h3>
                  <p className="text-gray-600 text-sm">
                    Bakı üçün 1-2 iş günü, regionlar üçün 3-5 iş günü. 
                    Hafta sonları çatdırılma edilmir.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Çatdırılma ünvanını dəyişə bilərəmmi?</h3>
                  <p className="text-gray-600 text-sm">
                    Sifariş göndərilməzdən əvvəl ünvan dəyişikliyi mümkündür. 
                    Göndərildikdən sonra kuryer xidməti ilə əlaqə saxlayın.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">🔄 Geri Qaytarma</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Geri qaytarma müddəti nə qədərdir?</h3>
                  <p className="text-gray-600 text-sm">
                    14 gün müddətində geri qaytarma mümkündür. Məhsul istifadə edilməməlidir.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Geri qaytarma xərcləri kim ödəyir?</h3>
                  <p className="text-gray-600 text-sm">
                    Məhsul qüsurludursa biz ödəyirik, müştəri istəyindirsə müştəri ödəyir.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Geri ödəniş nə qədər vaxt alır?</h3>
                  <p className="text-gray-600 text-sm">
                    Geri ödənişlər 3-5 iş günü ərzində orijinal ödəniş üsuluna qaytarılır.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">⭐ Loyallıq Proqramı</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Necə xal toplaya bilərəm?</h3>
                  <p className="text-gray-600 text-sm">
                    Hər alış-verişinizdə avtomatik olaraq xal toplayırsınız. 
                    Hər 1₼ üçün 1 xal alırsınız.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Xalları necə istifadə edə bilərəm?</h3>
                  <p className="text-gray-600 text-sm">
                    100 xal = 1₼ endirim. Alış-veriş zamanı xallarınızı istifadə edə bilərsiniz.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Xallarım itəcəkmi?</h3>
                  <p className="text-gray-600 text-sm">
                    Xallar 1 il müddətində etibarlıdır. Bu müddət bitdikdən sonra silinir.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">👤 Hesab və Profil</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Şifrəmi unutdum, nə etməliyəm?</h3>
                  <p className="text-gray-600 text-sm">
                    Giriş səhifəsində "Şifrəni unutmusunuz?" linkinə klikləyin və e-poçt ünvanınıza 
                    şifrə sıfırlama linki göndəriləcək.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Profil məlumatlarımı necə dəyişə bilərəm?</h3>
                  <p className="text-gray-600 text-sm">
                    Hesabınıza daxil olun və "Profil" bölməsindən məlumatlarınızı yeniləyə bilərsiniz.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">❓ Hesabımı silsəm sifarişlərim itəcəkmi?</h3>
                  <p className="text-gray-600 text-sm">
                    Bəli, hesab silindikdə bütün məlumatlar və sifariş tarixi silinir.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sualınızı Tapmadınız?</h2>
              <p className="text-gray-600 mb-4">
                Cavabınızı tapmadınızsa, bizimlə əlaqə saxlayın. Sizə kömək etməkdən məmnuniyyət duyarıq:
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
