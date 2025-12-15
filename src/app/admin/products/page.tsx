'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface Product {
  id: string
  name: string
  slug: string
  category_id: string
  type_id: string | null
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
  button_type: string
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
    if (filterCategory !== 'all' && product.category_id !== filterCategory) return false
    if (filterType !== 'all' && product.type_id !== filterType) return false
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Products</h1>
            <p className="text-gray-500 mt-1">Manage your product catalog</p>
          </div>
          <Link href="/admin/products/add">
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              + Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No products found. Click "+ Add Product" to create your first product.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.slug}</div>
                        <div className="flex gap-1 mt-1">
                          {product.is_new && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">NEW</span>
                          )}
                          {product.is_best_seller && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">BEST</span>
                          )}
                          {product.is_featured && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">★</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getCategoryName(product.category_id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getTypeName(product.type_id)}</td>
                      <td className="px-6 py-4">
                        {product.contact_for_price ? (
                          <span className="text-sm text-gray-500">Contact</span>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">₹{product.price}</div>
                            {product.mrp && product.mrp > (product.price || 0) && (
                              <div className="text-xs text-gray-500 line-through">₹{product.mrp}</div>
                            )}
                            {product.discount_percent && (
                              <div className="text-xs text-green-600">{product.discount_percent}% OFF</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          product.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' :
                          product.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock_status.replace('_', ' ').toUpperCase()}
                        </span>
                        {product.quantity && (
                          <div className="text-xs text-gray-500 mt-1">Qty: {product.quantity}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(product.id, product.is_active)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            product.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {filteredProducts.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  )
}
