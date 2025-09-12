'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

export function CartItems() {
  const { items, updateQuantity, removeItem } = useCart()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Səbətdəki Məhsullar
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                    if (placeholder) {
                      placeholder.style.display = 'contents'
                    }
                  }}
                  onLoad={(e) => {
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                    if (placeholder) {
                      placeholder.style.display = 'none'
                    }
                  }}
                />
                <div 
                  className="absolute inset-0 bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium"
                  style={{ display: 'none' }}
                >
                  <div className="text-center">
                    <div className="text-gray-400 mb-1">
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>Şəkil yoxdur</div>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {item.salePrice ? item.salePrice : item.price} ₼
                    </p>
                    {item.salePrice && (
                      <p className="text-sm text-gray-500 line-through">
                        {item.price} ₼
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
