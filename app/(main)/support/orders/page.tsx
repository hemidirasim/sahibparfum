import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sifariş Dəstəyi - Sahib Parfumeriya',
  description: 'Sifarişlər haqqında məlumat, sifariş statusu, sifarişlərin izlənməsi və digər suallar.',
  openGraph: {
    title: 'Sifariş Dəstəyi - Sahib Parfumeriya',
    description: 'Sifarişlər haqqında məlumat, sifariş statusu, sifarişlərin izlənməsi və digər suallar.',
  },
}

export default function OrdersSupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Sifariş Dəstəyi</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sifariş Statusu</h2>
              <p className="text-gray-600 mb-4">
                Sifarişinizin statusunu izləmək üçün hesabınıza daxil olun və "Sifarişlərim" bölməsinə keçin.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800">
                  <strong>Məlumat:</strong> Sifariş statusları: Gözləyir, Hazırlanır, Göndərilib, Çatdırılıb.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sifariş Nömrəsi</h2>
              <p className="text-gray-600 mb-4">
                Hər sifarişin unikal nömrəsi var. Bu nömrəni e-poçt təsdiqində və ya hesabınızda tapa bilərsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sifarişi Ləğv Etmək</h2>
              <p className="text-gray-600 mb-4">
                Sifarişi ləğv etmək istəyirsinizsə, mümkün qədər tez bizimlə əlaqə saxlayın. 
                Sifariş göndərildikdən sonra ləğv etmək mümkün deyil.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800">
                  <strong>Qeyd:</strong> Sifarişləri yalnız göndərilməzdən əvvəl ləğv edə bilərik.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sifariş Dəyişiklikləri</h2>
              <p className="text-gray-600 mb-4">
                Sifarişə məhsul əlavə etmək və ya çıxarmaq istəyirsinizsə, bizimlə əlaqə saxlayın.
              </p>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Əlavə Yardım Lazımdır?</h2>
              <p className="text-gray-600 mb-4">
                Sifarişlərinizlə bağlı əlavə suallarınız varsa, bizimlə əlaqə saxlayın:
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
