'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface Product {
  id: string
  name: string
  slug: string
  category: string
  type: string | null
  image_url: string | null
  contact_for_price: boolean
  price: number | null
  mrp: number | null
  discount_percent: number | null
  is_new: boolean
  is_best_seller: boolean
  stock_status: string
  quantity: number | null
  rating: number
  rating_count: number
  show_in_category: boolean
  is_featured: boolean
  is_active: boolean
  created_at: string
}

interface Category {
  id: string
  name: string
}

interface CategoryType {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [types, setTypes] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchTypes()
  }, [])

  async function fetchProducts() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return
    }

    setProducts(data || [])
    setLoading(false)
  }

  async function fetchCategories() {
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    setCategories(data || [])
  }

  async function fetchTypes() {
    const supabase = createClient()
    const { data } = await supabase
      .from('category_types')
      .select('id, name')
      .order('name')

    setTypes(data || [])
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting product: ' + error.message)
      return
    }

    alert('Product deleted successfully!')
    fetchProducts()
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      alert('Error updating product: ' + error.message)
      return
    }

    fetchProducts()
  }

  const filteredProducts = products.filter(product => {
    if (filterCategory !== 'all' && product.category !== filterCategory) return false
    if (filterType !== 'all' && product.type !== filterType) return false
    if (filterStatus === 'active' && !product.is_active) return false
    if (filterStatus === 'inactive' && product.is_active) return false
    return true
  })

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'N/A'
  }

  const getTypeName = (id: string | null) => {
    if (!id) return 'N/A'
    return types.find(t => t.id === id)?.name || 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#0F172A]">Products</h1>
            <p className="text-xs sm:text-base text-gray-500 mt-0.5 sm:mt-1">Manage your product catalog</p>
          </div>
          <Link href="/admin/products/add">
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2">
              + Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 mb-3 sm:mb-6">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5 sm:gap-4">
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-1.5 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm border border-gray-300 rounded sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-1.5 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm border border-gray-300 rounded sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-1.5 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm border border-gray-300 rounded sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No products found. Click "+ Add Product" to create your first product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs sm:text-sm">No Image</span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex flex-col gap-0.5 sm:gap-1">
                    {product.is_new && (
                      <span className="px-1 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs font-bold bg-green-500 text-white rounded">NEW</span>
                    )}
                    {product.is_best_seller && (
                      <span className="px-1 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs font-bold bg-yellow-500 text-white rounded">BEST</span>
                    )}
                    {product.is_featured && (
                      <span className="px-1 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs font-bold bg-purple-500 text-white rounded hidden sm:inline-block">★</span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                    <button
                      onClick={() => toggleActive(product.id, product.is_active)}
                      className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs font-medium rounded ${
                        product.is_active
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Off'}
                    </button>
                  </div>

                  {/* Discount Badge */}
                  {product.discount_percent && product.discount_percent > 0 && (
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[9px] sm:text-xs font-bold">
                      {product.discount_percent}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-3 lg:p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-xs sm:text-sm min-h-[2rem] sm:min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Category & Type */}
                  <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2 text-[10px] sm:text-xs text-gray-500">
                    <span>{getCategoryName(product.category)}</span>
                    {product.type && (
                      <>
                        <span>•</span>
                        <span>{product.type}</span>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-2 sm:mb-3">
                    {product.contact_for_price ? (
                      <span className="text-xs sm:text-sm font-medium text-blue-600">Contact</span>
                    ) : (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">₹{product.price}</span>
                        {product.mrp && product.mrp > (product.price || 0) && (
                          <span className="text-[10px] sm:text-xs text-gray-500 line-through">₹{product.mrp}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs font-medium rounded ${
                      product.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' :
                      product.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_status === 'in_stock' ? 'Stock' :
                       product.stock_status === 'low_stock' ? 'Low' : 'Out'}
                    </span>
                    {product.quantity && product.quantity > 0 && (
                      <span className="text-[9px] sm:text-xs text-gray-500">Qty: {product.quantity}</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1.5 sm:gap-2">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-sm font-medium text-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md sm:rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-sm font-medium text-center text-red-600 bg-red-50 hover:bg-red-100 rounded-md sm:rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 text-sm text-gray-500 text-center">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  )
}
