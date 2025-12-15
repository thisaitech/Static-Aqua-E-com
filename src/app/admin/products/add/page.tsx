'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface CategoryType {
  id: string
  name: string
  category_id: string
}

export default function AddProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Categories and Types
  const [categories, setCategories] = useState<Category[]>([])
  const [types, setTypes] = useState<CategoryType[]>([])
  const [filteredTypes, setFilteredTypes] = useState<CategoryType[]>([])
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    type_id: '',
    image_url: '',
    
    // Pricing
    contact_for_price: false,
    price: '',
    mrp: '',
    discount_percent: '',
    
    // Badges
    is_new: false,
    is_best_seller: false,
    
    // Stock
    stock_status: 'in_stock',
    quantity: '',
    
    // Rating
    rating: '4.0',
    rating_count: '0',
    
    // Display
    show_in_category: true,
    is_featured: false,
    
    // Button Type
    button_type: 'add_to_cart',
    
    // Status
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
    fetchTypes()
  }, [])

  useEffect(() => {
    // Auto-generate slug from name
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name])

  useEffect(() => {
    // Filter types when category changes
    if (formData.category_id) {
      const filtered = types.filter(t => t.category_id === formData.category_id)
      setFilteredTypes(filtered)
      setFormData(prev => ({ ...prev, type_id: '' }))
    } else {
      setFilteredTypes([])
    }
  }, [formData.category_id, types])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('display_order')
    
    setCategories(data || [])
  }

  const fetchTypes = async () => {
    const { data } = await supabase
      .from('category_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    
    setTypes(data || [])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter product name')
      return
    }
    if (!formData.category_id) {
      alert('Please select a category')
      return
    }
    if (!formData.image_url) {
      alert('Please upload a product image')
      return
    }
    if (!formData.contact_for_price && !formData.price) {
      alert('Please enter price or enable "Contact for Price"')
      return
    }

    setSaving(true)
    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        category_id: formData.category_id,
        type_id: formData.type_id || null,
        image_url: formData.image_url,
        
        contact_for_price: formData.contact_for_price,
        price: formData.contact_for_price ? null : parseFloat(formData.price) || null,
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : 0,
        
        is_new: formData.is_new,
        is_best_seller: formData.is_best_seller,
        
        stock_status: formData.stock_status,
        quantity: formData.quantity ? parseInt(formData.quantity) : 0,
        
        rating: parseFloat(formData.rating) || 4.0,
        rating_count: parseInt(formData.rating_count) || 0,
        
        show_in_category: formData.show_in_category,
        is_featured: formData.is_featured,
        
        button_type: formData.button_type,
        is_active: formData.is_active
      }

      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) throw error

      alert('Product added successfully!')
      router.push('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-[#64748B] hover:text-[#0F172A]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Add New Product</h1>
          <p className="text-sm text-[#64748B]">Fill in the details below</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-6">
        
        {/* 1. BASIC DETAILS */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Basic Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Black-cheeked Lovebird – Hand-raised"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated from name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type (Sub-category)
                </label>
                <select
                  value={formData.type_id}
                  onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                  disabled={!formData.category_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Type</option>
                  {filteredTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PRODUCT IMAGE */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Product Image</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Image <span className="text-red-500">*</span>
            </label>
            
            {formData.image_url ? (
              <div className="relative inline-block">
                <img
                  src={formData.image_url}
                  alt="Product"
                  className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => setFormData({ ...formData, image_url: '' })}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2563EB] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm">
                    {uploading ? 'Uploading...' : 'Click to upload'}
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* 3. PRICING */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Pricing</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="contact_for_price"
                checked={formData.contact_for_price}
                onChange={(e) => setFormData({ ...formData, contact_for_price: e.target.checked })}
                className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
              <label htmlFor="contact_for_price" className="text-sm font-medium text-gray-700">
                Contact for Price (hide price on user side)
              </label>
            </div>

            {!formData.contact_for_price && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    placeholder="1299"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="23"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. BADGES & OFFERS */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Badges & Offers</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_new"
                checked={formData.is_new}
                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
              <label htmlFor="is_new" className="text-sm font-medium text-gray-700">
                New Product (shows "NEW" badge)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_best_seller"
                checked={formData.is_best_seller}
                onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
              <label htmlFor="is_best_seller" className="text-sm font-medium text-gray-700">
                Best Seller (appears in Best Sellers section)
              </label>
            </div>
          </div>
        </div>

        {/* 5. STOCK & AVAILABILITY */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Stock & Availability</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <select
                value={formData.stock_status}
                onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_stock">Low Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (optional)
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* 6. RATINGS */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Ratings (Optional)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating Value
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating Count
              </label>
              <input
                type="number"
                value={formData.rating_count}
                onChange={(e) => setFormData({ ...formData, rating_count: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* 7. DISPLAY CONTROL */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Display Control</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_in_category"
                checked={formData.show_in_category}
                onChange={(e) => setFormData({ ...formData, show_in_category: e.target.checked })}
                className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
              <label htmlFor="show_in_category" className="text-sm font-medium text-gray-700">
                Show in Category Page
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                Featured Product (show in home sections)
              </label>
            </div>
          </div>
        </div>

        {/* 8. BUTTON TYPE */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Action Button</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Type
            </label>
            <select
              value={formData.button_type}
              onChange={(e) => setFormData({ ...formData, button_type: e.target.value })}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="add_to_cart">Add to Cart</option>
              <option value="contact_store">Contact Store</option>
            </select>
          </div>
        </div>

        {/* 9. STATUS */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Status</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active (visible on website)
            </label>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            {saving ? 'Saving...' : 'Add Product'}
          </Button>
        </div>
      </div>
    </div>
  )
}
