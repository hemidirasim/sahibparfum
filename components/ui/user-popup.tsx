'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { User, LogOut, Settings, ShoppingBag, Heart, Package, ChevronDown } from 'lucide-react'

export function UserPopup() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    setIsOpen(false)
  }

  if (!session) {
    return (
      <div className="relative" ref={popupRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="User menu"
        >
          <User className="h-5 w-5 text-gray-600" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600 mb-3">Hesaba daxil olun</p>
              <div className="space-y-2">
                <Link
                  href="/auth/signin"
                  className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Giriş Et
                </Link>
                <Link
                  href="/auth/signup"
                  className="w-full btn btn-outline btn-sm flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  Hesab Yarat
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 transition-colors"
        aria-label="User menu"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name || 'İstifadəçi'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 py-2 px-4"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              Profil
            </Link>
            
            <Link
              href="/orders"
              className="flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 py-2 px-4"
              onClick={() => setIsOpen(false)}
            >
              <Package className="h-4 w-4" />
              Sifarişlərim
            </Link>
            
            <Link
              href="/wishlist"
              className="flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 py-2 px-4"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="h-4 w-4" />
              Sevimlilər
            </Link>
            
            <Link
              href="/cart"
              className="flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 py-2 px-4"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="h-4 w-4" />
              Səbət
            </Link>

            {session.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 py-2 px-4"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 w-full py-2 px-4 text-left"
            >
              <LogOut className="h-4 w-4" />
              Çıxış Et
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
