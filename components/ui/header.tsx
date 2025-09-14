'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, Search, Menu, X, Heart, Settings, ChevronDown, Phone, Mail, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { UserPopup } from './user-popup'

interface Settings {
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
  const [searchQuery, setSearchQuery] = useState('')
  const [brands, setBrands] = useState<{[key: string]: string[]}>({})
  const [categories, setCategories] = useState<Array<{name: string, href: string}>>([])
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>({
    contactPhone: '+994 50 123 45 67',
    contactEmail: 'info@sahibparfumeriya.az',
    freeDeliveryThreshold: 100
  })
  const { data: session } = useSession()
  const { items } = useCart()

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings({
            contactPhone: data.contactPhone || '+994 50 123 45 67',
            contactEmail: data.contactEmail || 'info@sahibparfumeriya.az',
            freeDeliveryThreshold: data.freeDeliveryThreshold || 100
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    fetchSettings()
  }, [])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          // Only show active categories with products
          const activeCategories = data
            .filter((cat: any) => cat.isActive && cat.productCount > 0)
            .map((cat: any) => ({
              name: cat.name,
              href: `/categories?categoryIds=${cat.id}`
            }))
          setCategories(activeCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch brands by letter
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands')
        if (response.ok) {
          const data = await response.json()
          console.log('Header: Fetched brands:', data.brands)
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
      router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`)
    }
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
                alt="SAHIB perfumery & cosmetics"
                width={77}
                height={77}
                className="h-[77px] w-auto"
                priority
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

            {/* Brand Search */}
            <div className="flex items-center space-x-1 relative">
              <span className="text-sm text-gray-600 mr-3">Brend axtar:</span>
              {alphabetFilter.map((letter) => (
                <div 
                  key={letter} 
                  className="relative"
                  onMouseEnter={() => setHoveredLetter(letter)}
                >
                  <button
                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded transition-all duration-200 ${
                      hoveredLetter === letter 
                        ? 'text-primary-600 bg-primary-100 scale-110 shadow-md' 
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50 hover:scale-105'
                    }`}
                  >
                    {letter}
                  </button>
                  
                  {/* Brand Dropdown */}
                  {hoveredLetter === letter && brands[letter] && brands[letter].length > 0 && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
                    >
                      <div className="py-2">
                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                          {letter} hərfi ilə başlayan brendlər
                        </div>
                        {brands[letter].map((brand) => (
                          <button
                            key={brand}
                            onClick={() => {
                              router.push(`/categories?brand=${encodeURIComponent(brand)}`)
                              setHoveredLetter(null)
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-150 hover:translate-x-1"
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                href="/contact"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Əlaqə
              </Link>
            </nav>

            {/* Mobile User Menu */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-center">
                <UserPopup />
              </div>
            </div>

            {/* Mobile Brand Search */}
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-3">Brend axtar:</div>
              <div className="grid grid-cols-7 gap-1">
                {alphabetFilter.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setIsMenuOpen(false)}
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
