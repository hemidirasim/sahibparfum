'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, Search, Menu, X, Heart, Settings, ChevronDown, Phone, Mail, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'

const productCategories = [
  { name: 'Kişi Parfümləri', href: '/products?category=men' },
  { name: 'Qadın Parfümləri', href: '/products?category=women' },
  { name: 'Unisex Parfümlər', href: '/products?category=unisex' },
  { name: 'Mini Parfümlər', href: '/products?category=mini' },
  { name: 'Yeni Gələnlər', href: '/products?new=true' },
  { name: 'Endirimlər', href: '/products?sale=true' },
]

const alphabetFilter = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: session } = useSession()
  const { items } = useCart()

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleAlphabetFilter = (letter: string) => {
    window.location.href = `/products?filter=${letter}`
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+994 50 123 45 67</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@sahibparfumeriya.az</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>🚚 100₼ üzərində pulsuz çatdırılma</span>
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
              alt="Sahib Parfumeriya"
              width={140}
              height={50}
              className="h-12 w-auto"
            />
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Haqqımızda
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Əlaqə
            </Link>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Məhsul axtar..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
              />
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
            {session ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-700 hidden md:block">
                    {session.user?.name || session.user?.email}
                  </span>
                  <div className="flex items-center space-x-1">
                                         {session.user?.role === 'ADMIN' && (
                       <Link href="/admin/dashboard" className="p-2 text-gray-700 hover:text-primary-600 transition-colors" title="Admin Panel">
                         <Settings className="h-5 w-5" />
                       </Link>
                     )}
                    <Link href="/profile" className="p-2 text-gray-700 hover:text-primary-600 transition-colors" title="Profil">
                      <User className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="p-2 text-gray-700 hover:text-red-600 transition-colors"
                      title="Çıxış"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  Giriş
                </Link>
                <Link href="/auth/signup" className="btn btn-primary btn-sm">
                  Qeydiyyat
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Products Navigation Bar */}
        <div className="hidden lg:block border-t border-gray-200 py-3">
          <div className="flex items-center justify-between">
            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                <span>Məhsullar</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProductsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {productCategories.map((category) => (
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

            {/* Alphabetical Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600 mr-3">Hərfə görə:</span>
              {alphabetFilter.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleAlphabetFilter(letter)}
                  className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                >
                  {letter}
                </button>
              ))}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Məhsul axtar..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
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
                {productCategories.map((category) => (
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
                href="/contact"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Əlaqə
              </Link>
            </nav>

            {/* Mobile User Menu */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              {session ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {session.user?.name || session.user?.email}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' })
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Çıxış</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Qeydiyyat
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Alphabetical Filter */}
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-3">Hərfə görə filtr:</div>
              <div className="grid grid-cols-7 gap-1">
                {alphabetFilter.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => {
                      handleAlphabetFilter(letter)
                      setIsMenuOpen(false)
                    }}
                    className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isProductsDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProductsDropdownOpen(false)}
        />
      )}
    </header>
  )
}
