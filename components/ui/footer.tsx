import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Contact Info Bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-center gap-8 py-6 text-base">
            {/* Phone */}
            <a href="tel:+994501234567" className="flex items-center gap-3 text-white hover:text-pink-300 transition-colors cursor-pointer">
              <Phone className="h-5 w-5 text-pink-500" />
              <span className="font-medium">+994 50 123 45 67</span>
            </a>
            
            {/* WhatsApp */}
            <a href="https://wa.me/994501234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-pink-300 transition-colors cursor-pointer">
              <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <span className="font-medium">WhatsApp</span>
            </a>
            
            {/* Email */}
            <a href="mailto:info@sahibparfumeriya.az" className="flex items-center gap-3 text-white hover:text-pink-300 transition-colors cursor-pointer">
              <Mail className="h-5 w-5 text-pink-500" />
              <span className="font-medium">info@sahibparfumeriya.az</span>
            </a>
            
            {/* Working Hours */}
            <div className="flex items-center gap-3 text-white">
              <Clock className="h-5 w-5 text-pink-500" />
              <span className="font-medium">09:00 - 22:00</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="https://i.ibb.co/cX2Gyv2T/Sahib-Logo-PNG.png"
                alt="Sahib Parfumeriya"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-4">
              Premium parfüm markalarını sərfəli qiymətlərlə təqdim edən etibarlı platforma.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sürətli Keçidlər</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  Məhsullar
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Kateqoriyalar
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  Haqqımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Əlaqə
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Müştəri Xidməti</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">
                  Çatdırılma
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-white transition-colors">
                  Qaytarma
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Gizlilik Siyasəti
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Əlaqə</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span>+994 50 123 45 67</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@sahibparfumeriya.az</span>
              </div>
              <div className="flex items-start text-gray-400">
                <MapPin className="h-4 w-4 mr-2 mt-1" />
                <span>Bakı şəhəri, Nərimanov rayonu, Atatürk prospekti 123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Sahib Parfumeriya. Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>
    </footer>
  )
}
