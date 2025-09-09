'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Grid, List, Filter, Package, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        console.error('Failed to fetch products')
        setProducts([])
      }
    } catch (error) {
      console.error('Products fetch error:', error)
      setProducts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesStatus = !selectedStatus || product.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock < 10) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Məhsullar</h1>
              <p className="text-gray-600 mt-1">
                Bütün məhsulları idarə edin və yeni məhsullar əlavə edin
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                disabled
                className="flex items-center px-4 py-2 text-gray-400 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Yenilə
              </button>
              <Link
                href="/admin/products/new"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Məhsul
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Məhsullar</h1>
            <p className="text-gray-600 mt-1">
              Bütün məhsulları idarə edin və yeni məhsullar əlavə edin
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchProducts}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yenilə
            </button>
            <Link
              href="/admin/products/new"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Məhsul
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Məhsul, marka və ya SKU axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bütün kateqoriyalar</option>
            <option value="Kadın Parfümü">Kadın Parfümü</option>
            <option value="Kişi Parfümü">Kişi Parfümü</option>
            <option value="Unisex Parfümü">Unisex Parfümü</option>
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bütün statuslar</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Deaktiv</option>
          </select>
        </div>
        
        {/* Results and View Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {filteredProducts.length} məhsul tapıldı
            {(searchTerm || selectedCategory || selectedStatus) && (
              <span className="text-blue-600 ml-2">
                (filtrlənmiş)
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isNew && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Yeni
                    </span>
                  )}
                  {product.isOnSale && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Endirim
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                    {product.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">{product.category}</p>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  
                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Variantlar:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.variants.slice(0, 3).map((variant: any) => (
                          <span key={variant.id} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                            {variant.volume}
                          </span>
                        ))}
                        {product.variants.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-full">
                            +{product.variants.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-3">
                  {product.salePrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">{product.salePrice} ₼</span>
                      <span className="text-sm text-gray-500 line-through">{product.price} ₼</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">{product.price} ₼</span>
                  )}
                </div>

                {/* Stock */}
                <div className="mb-4">
                  <span className={`text-sm font-medium ${getStockColor(product.stock)}`}>
                    Stok: {product.stock} ədəd
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Bax"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Redaktə et"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Məhsul
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Marka
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Kateqoriya
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Variantlar
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Qiymət
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Stok
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Status
                   </th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Əməliyyatlar
                   </th>
                 </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {product.brand}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {product.category}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm">
                         {product.variants && product.variants.length > 0 ? (
                           <div className="space-y-1">
                             {product.variants.slice(0, 2).map((variant: any) => (
                               <div key={variant.id} className="text-xs">
                                 <span className="font-medium">{variant.volume}:</span>
                                 <span className="ml-1">
                                   {variant.salePrice ? (
                                     <span className="text-red-600">{variant.salePrice} ₼</span>
                                   ) : (
                                     <span>{variant.price} ₼</span>
                                   )}
                                 </span>
                               </div>
                             ))}
                             {product.variants.length > 2 && (
                               <div className="text-xs text-gray-500">
                                 +{product.variants.length - 2} variant
                               </div>
                             )}
                           </div>
                         ) : (
                           <span className="text-gray-500">Variant yoxdur</span>
                         )}
                       </div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {product.salePrice ? (
                          <div>
                            <span className="text-red-600 font-medium">{product.salePrice} ₼</span>
                            <div className="text-gray-500 line-through text-xs">{product.price} ₼</div>
                          </div>
                        ) : (
                          <span className="text-gray-900">{product.price} ₼</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStockColor(product.stock)}`}>
                        {product.stock} ədəd
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-green-600 hover:text-green-900 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button className="text-red-600 hover:text-red-900 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {products.length === 0 ? 'Məhsul yoxdur' : 'Məhsul tapılmadı'}
          </h3>
          <p className="text-gray-600 mb-4">
            {products.length === 0 
              ? 'Hələ heç bir məhsul əlavə edilməyib. İlk məhsulu əlavə etmək üçün "Yeni Məhsul" düyməsini basın.'
              : 'Axtarış kriteriyalarınıza uyğun məhsul tapılmadı.'
            }
          </p>
          {products.length === 0 ? (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              İlk Məhsulu Əlavə Et
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setSelectedStatus('')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Bütün məhsulları göstər
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <span>Göstərilir:</span>
              <span className="font-medium mx-1">1-{filteredProducts.length}</span>
              <span>üçün</span>
              <span className="font-medium mx-1">{products.length}</span>
              <span>nəticə</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Əvvəlki
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                1
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Sonrakı
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
