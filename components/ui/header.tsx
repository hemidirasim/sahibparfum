'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, Search, Menu, X, Heart, Settings, ChevronDown, Phone, Mail, LogOut, HelpCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { UserPopup } from './user-popup'

interface Settings {
  siteName: string
  contactPhone: string
  contactEmail: string
  freeDeliveryThreshold: number
}

// Static categories that don't need API
const staticCategories = [
  { name: 'Yeni Gələnlər', href: '/categories?new=true' },
  { name: 'Endirimlər', href: '/categories?sale=true' },
]

const alphabetFilter = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

export function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false)
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [brands, setBrands] = useState<{[key: string]: string[]}>({})
  const [categories, setCategories] = useState<Array<{name: string, href: string}>>([])
  const [activeLetter, setActiveLetter] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isHoverDisabledRef = useRef<boolean>(false)
  const [settings, setSettings] = useState<Settings>({
    siteName: 'SAHIB perfumery & cosmetics',
    contactPhone: '+994 50 123 45 67',
    contactEmail: 'info@sahibparfumeriya.az',
    freeDeliveryThreshold: 100
  })
  const { data: session } = useSession()
  const { items } = useCart()

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Add cache busting parameter
        const timestamp = Date.now()
        const response = await fetch(`/api/settings?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          
          timestamp: new Date().toISOString(),
          siteName: data.siteName,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          freeDeliveryThreshold: data.freeDeliveryThreshold
        })
          
        setSettings({
          siteName: data.siteName || 'SAHIB perfumery & cosmetics',
          contactPhone: data.contactPhone || '+994 50 123 45 67',
          contactEmail: data.contactEmail || 'info@sahibparfumeriya.az',
          freeDeliveryThreshold: data.freeDeliveryThreshold || 100
        })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    // Initial fetch
    fetchSettings()
    
    // Refresh settings every 30 seconds to catch updates
    const interval = setInterval(fetchSettings, 30000)
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Add cache busting parameter
        const timestamp = Date.now()
        const response = await fetch(`/api/categories?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          
            timestamp: new Date().toISOString(),
            categoriesCount: data?.length || 0,
            url: `/api/categories?_t=${timestamp}`,
            categories: data?.map((cat: any) => ({ name: cat.name, productCount: cat.productCount }))
          })
          
          // API already filters for active categories with products
          const activeCategories = data.map((cat: any) => ({
            name: cat.name,
            href: `/categories?categoryIds=${cat.id}`
          }))
          setCategories(activeCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    // Initial fetch
    fetchCategories()
    
    // Refresh categories every 30 seconds to catch new ones
    const interval = setInterval(fetchCategories, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Fetch brands by letter
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands')
        if (response.ok) {
          const data = await response.json()
          setBrands(data.brands || {})
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
      }
    }
    fetchBrands()
  }, [])




  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchDropdownOpen(false)
      setSearchSuggestions([])
      router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.length >= 2) {
      // Fetch search suggestions
      fetchSearchSuggestions(value)
      setIsSearchDropdownOpen(true)
    } else {
      setSearchSuggestions([])
      setIsSearchDropdownOpen(false)
    }
  }

  const fetchSearchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        const suggestions = data.products.map((product: any) => product.name)
        setSearchSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setIsSearchDropdownOpen(false)
    router.push(`/categories?search=${encodeURIComponent(suggestion)}`)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsSearchDropdownOpen(false)
      setSearchSuggestions([])
    }
  }

  // Static brand data like in the example
  const brandsByLetter: { [key: string]: string[] } = {
    A: ['Armani', 'Azzaro', 'Alien', 'Angel', 'Acqua di Parma'],
    B: ['Burberry', 'Boss', 'Bulgari', 'Bleu de Chanel', 'Black Opium'],
    C: ['Chanel', 'Calvin Klein', 'Creed', 'Cartier', 'Carolina Herrera'],
    D: ['Dior', 'Dolce & Gabbana', 'DKNY', 'Davidoff', 'Diesel'],
    E: ['Estee Lauder', 'Escada', 'Elizabeth Arden', 'Ermenegildo Zegna'],
    F: ['Flowerbomb', 'Fahrenheit', 'Fresh', 'Furla'],
    G: ['Gucci', 'Giorgio Armani', 'Givenchy', 'Gaultier', 'Guess'],
    H: ['Hugo Boss', 'Hermes', 'Halston', 'Hilfiger'],
    I: ['Issey Miyake', 'Invictus', 'Impulse', 'Intenso'],
    J: ['Jean Paul Gaultier', 'Jimmy Choo', 'Joop!', 'Jovan'],
    K: ['Kenzo', 'Karl Lagerfeld', 'Kenneth Cole', 'Kilian'],
    L: ['Lancome', 'Lacoste', 'La Vie Est Belle', 'Louis Vuitton'],
    M: ['Marc Jacobs', 'Mont Blanc', 'Moschino', 'Michael Kors'],
    N: ['Narciso Rodriguez', 'Nina Ricci', 'Nars', 'Neutrogena'],
    O: ['Olympea', 'Opium', 'Obsession', 'Oscar de la Renta'],
    P: ['Paco Rabanne', 'Polo', 'Prada', 'Pure Poison'],
    Q: ['Quasar', 'Queen Latifah', 'Quintessence'],
    R: ['Ralph Lauren', 'Roberto Cavalli', 'Replay', 'Rochas'],
    S: ['Sauvage', 'Spicebomb', 'Scandal', 'Salvatore Ferragamo'],
    T: ['Tom Ford', 'Thierry Mugler', 'Tiffany & Co', 'Tommy Hilfiger'],
    U: ['Ultraviolet', 'Ungaro', 'Ulric de Varens'],
    V: ['Versace', 'Viktor & Rolf', 'Valentino', 'Van Cleef'],
    W: ['White Tea', 'Wood Sage', 'Wild Rose'],
    X: ['XS', 'Xenon', 'Xerjoff'],
    Y: ['Yves Saint Laurent', 'Youth Dew', 'Yardley'],
    Z: ['Zara', 'Zadig & Voltaire', 'Zegna']
  }



  return (
    <header className="bg-white shadow-sm border-b md:sticky md:top-0 md:z-50">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{settings.contactPhone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>🚚 {settings.freeDeliveryThreshold}₼ üzərində pulsuz çatdırılma</span>
              <span>⭐ 1000+ məmnun müştəri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="https://i.ibb.co/cX2Gyv2T/Sahib-Logo-PNG.png"
                alt={settings.siteName}
                width={77}
                height={77}
                className="h-[77px] w-auto"
                priority
              />
            </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                <span>Məhsullar</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProductsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                  <div className="py-2">
                    {/* Dynamic categories from API */}
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setIsProductsDropdownOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                    {/* Static categories */}
                    {staticCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setIsProductsDropdownOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Haqqımızda
            </Link>
            
            <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Blog
            </Link>
            
            {/* Support Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSupportDropdownOpen(!isSupportDropdownOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Dəstək</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isSupportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSupportDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                  <div className="py-2">
                    <Link
                      href="/support/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsSupportDropdownOpen(false)}
                    >
                      Sifariş Dəstəyi
                    </Link>
                    <Link
                      href="/support/payment"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsSupportDropdownOpen(false)}
                    >
                      Ödəniş Dəstəyi
                    </Link>
                    <Link
                      href="/support/delivery"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsSupportDropdownOpen(false)}
                    >
                      Çatdırılma Dəstəyi
                    </Link>
                    <Link
                      href="/support/loyalty"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsSupportDropdownOpen(false)}
                    >
                      Loyallıq Proqramı
                    </Link>
                    <Link
                      href="/support/returns"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsSupportDropdownOpen(false)}
                    >
                      Geri Qaytarma
                    </Link>
                    <Link
                      href="/support/faq"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsSupportDropdownOpen(false)}
                    >
                      FAQ
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Əlaqə
            </Link>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Məhsul axtar..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
              />
              
              {/* Search Suggestions Dropdown */}
              {isSearchDropdownOpen && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[70] max-h-64 overflow-y-auto">
                  <div className="py-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <Heart className="h-6 w-6" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <UserPopup />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Brand Search Bar */}
        <div className="hidden lg:block border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4 bg-gray-50 rounded-full px-6 py-3">
                <span className="text-base text-gray-700 font-medium">Brend axtar:</span>
                <div className="flex items-center space-x-2">
                  {alphabetFilter.map((letter) => (
                    <div key={letter} className="relative z-50">
                    <button
                      className={`w-8 h-8 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 ${
                        activeLetter === letter
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                      }`}
                      onClick={() => {
                        // Disable hover when clicked
                        isHoverDisabledRef.current = true
                        setActiveLetter(activeLetter === letter ? null : letter)
                        
                        // Re-enable hover after a short delay
                        setTimeout(() => {
                          isHoverDisabledRef.current = false
                        }, 1000)
                      }}
                      onMouseEnter={() => {
                        // If hover is disabled, don't do anything
                        if (isHoverDisabledRef.current) return
                        
                        // Clear any existing timeout
                        if (hoverTimeoutRef.current) {
                          clearTimeout(hoverTimeoutRef.current)
                        }
                        setActiveLetter(letter)
                      }}
                      onMouseLeave={() => {
                        // If hover is disabled, don't do anything
                        if (isHoverDisabledRef.current) return
                        
                        // Close after a short delay to allow moving to other letters
                        hoverTimeoutRef.current = setTimeout(() => {
                          setActiveLetter(null)
                        }, 200)
                      }}
                    >
                      {letter}
                    </button>
                      
                      {/* Individual Brand Dropdown for each letter */}
                      {activeLetter === letter && (
                        <div 
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
                          onMouseEnter={() => {
                            // If hover is disabled, don't do anything
                            if (isHoverDisabledRef.current) return
                            
                            // Clear any existing timeout
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current)
                            }
                            setActiveLetter(letter)
                          }}
                          onMouseLeave={() => {
                            // If hover is disabled, don't do anything
                            if (isHoverDisabledRef.current) return
                            
                            // Close after a short delay
                            hoverTimeoutRef.current = setTimeout(() => {
                              setActiveLetter(null)
                            }, 200)
                          }}
                        >
                          <div className="p-6">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{letter}</span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                "{letter}" hərfi ilə başlayan brendlər
                              </h3>
                            </div>
                          {brands[letter] && brands[letter].length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {brands[letter].map((brand, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                  onClick={() => {
                                    router.push(`/categories?brand=${encodeURIComponent(brand)}`)
                                    setActiveLetter(null)
                                  }}
                                >
                                  <span className="text-gray-700 font-medium text-sm group-hover:text-primary-600 transition-colors">{brand}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 text-center text-gray-500">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search className="h-6 w-6 text-gray-400" />
                              </div>
                              <p>Bu hərf üçün brend tapılmadı</p>
                            </div>
                          )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden mb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Məhsul axtar..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
            />
            
            {/* Mobile Search Suggestions Dropdown */}
            {isSearchDropdownOpen && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[70] max-h-64 overflow-y-auto">
                <div className="py-2">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Ana Səhifə
              </Link>
              
              {/* Mobile Products Dropdown */}
              <div className="space-y-2">
                <div className="text-gray-700 font-medium">Məhsullar</div>
                {/* Dynamic categories from API */}
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block pl-4 text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                {/* Static categories */}
                {staticCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block pl-4 text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              
              <Link
                href="/about"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Haqqımızda
              </Link>
              
              <Link
                href="/blog"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              
              {/* Mobile Support Links */}
              <div className="space-y-2">
                <div className="text-gray-700 font-medium flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Dəstək
                </div>
                <Link
                  href="/support/orders"
                  className="block pl-6 text-gray-600 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sifariş
                </Link>
                <Link
                  href="/support/payment"
                  className="block pl-6 text-gray-600 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ödəniş
                </Link>
                <Link
                  href="/support/delivery"
                  className="block pl-6 text-gray-600 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Çatdırılma
                </Link>
                <Link
                  href="/support/loyalty"
                  className="block pl-6 text-gray-600 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Bonus və loyallıq proqramı
                </Link>
                <Link
                  href="/support/returns"
                  className="block pl-6 text-gray-600 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Geri qaytarma
                </Link>
                <Link
                  href="/support/faq"
                  className="block pl-6 text-gray-600 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
              </div>
              
              <Link
                href="/contact"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Əlaqə
              </Link>
            </nav>

            {/* Mobile Brand Search */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Brend axtar:</h3>
                <div className="flex flex-wrap gap-2">
                  {alphabetFilter.map((letter) => (
                    <button
                      key={letter}
                      className={`w-8 h-8 rounded-full font-semibold text-sm transition-all duration-200 ${
                        activeLetter === letter
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                      }`}
                      onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                
                {/* Mobile Brand Dropdown */}
                {activeLetter && (
                  <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{activeLetter}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800">
                          "{activeLetter}" hərfi ilə başlayan brendlər
                        </h4>
                      </div>
                      {brands[activeLetter] && brands[activeLetter].length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {brands[activeLetter].map((brand, index) => (
                            <button
                              key={index}
                              className="p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition-all duration-200 text-left"
                              onClick={() => {
                                router.push(`/categories?brand=${encodeURIComponent(brand)}`)
                                setActiveLetter(null)
                                setIsMenuOpen(false)
                              }}
                            >
                              <span className="text-gray-700 font-medium text-xs">{brand}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">Bu hərf üçün brend tapılmadı</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(isProductsDropdownOpen || isSupportDropdownOpen || activeLetter || isSearchDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProductsDropdownOpen(false)
            setIsSupportDropdownOpen(false)
            setIsSearchDropdownOpen(false)
            setActiveLetter(null)
            // Re-enable hover when clicking outside
            isHoverDisabledRef.current = false
          }}
        />
      )}
    </header>
  )
}
