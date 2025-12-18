'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface Category {
  id: string
  name: string
  types: string[]
  category: string[]
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const productId = params.id
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Categories and Types
  const [categories, setCategories] = useState<Category[]>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    type: '',
    product_category: '',
    image_url: '',

    // Pricing
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

    // Status
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (categories.length > 0) {
      fetchProductData()
    }
  }, [categories])

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

  // Auto-calculate selling price based on MRP and discount
  useEffect(() => {
    const mrp = parseFloat(formData.mrp)
    const discount = parseFloat(formData.discount_percent)

    if (mrp && discount && discount > 0) {
      const sellingPrice = mrp * (1 - discount / 100)
      const roundedPrice = Math.round(sellingPrice) // Round to whole number
      setFormData(prev => ({ ...prev, price: roundedPrice.toString() }))
    } else if (mrp && !discount) {
      // If no discount, selling price = MRP
      setFormData(prev => ({ ...prev, price: Math.round(mrp).toString() }))
    }
  }, [formData.mrp, formData.discount_percent])

  const fetchProductData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error

      if (data) {
        // Pre-fill form with existing product data
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          category_id: data.category || '',
          type: data.type || '',
          product_category: data.product_category || '',
          image_url: data.image_url || '',

          price: data.price ? data.price.toString() : '',
          mrp: data.mrp ? data.mrp.toString() : '',
          discount_percent: data.discount_percent ? data.discount_percent.toString() : '',

          is_new: data.is_new || false,
          is_best_seller: data.is_best_seller || false,

          stock_status: data.stock_status || 'in_stock',
          quantity: data.quantity ? data.quantity.toString() : '',

          rating: data.rating ? data.rating.toString() : '4.0',
          rating_count: data.rating_count ? data.rating_count.toString() : '0',

          show_in_category: data.show_in_category !== false,
          is_featured: data.is_featured || false,

          is_active: data.is_active !== false
        })

        // Set available types and categories for the selected category
        if (data.category) {
          const selectedCategory = categories.find(cat => cat.id === data.category)
          if (selectedCategory) {
            if (selectedCategory.types) {
              setAvailableTypes(selectedCategory.types)
            }
            if (selectedCategory.category) {
              setAvailableCategories(selectedCategory.category)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Failed to load product data')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, types, category')
      .eq('is_active', true)
      .order('display_order')
    
    if (error) {
      console.error('Error fetching categories:', error)
    } else {
      console.log('Categories fetched in edit page:', data)
      setCategories(data || [])
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, category_id: categoryId, type: '', product_category: '' })
    
    const selectedCategory = categories.find(cat => cat.id === categoryId)
    console.log('=== Edit Page: Category Change Debug ===')
    console.log('Category ID:', categoryId)
    console.log('Selected category:', selectedCategory)
    console.log('Types from category:', selectedCategory?.types)
    console.log('Is array?:', Array.isArray(selectedCategory?.types))
    console.log('Length:', selectedCategory?.types?.length)
    
    if (selectedCategory && selectedCategory.types && selectedCategory.types.length > 0) {
      console.log('✓ Setting available types:', selectedCategory.types)
      setAvailableTypes(selectedCategory.types)
    } else {
      console.log('✗ No types found, clearing dropdown')
      setAvailableTypes([])
    }
    
    if (selectedCategory && selectedCategory.category && selectedCategory.category.length > 0) {
      console.log('✓ Setting available categories:', selectedCategory.category)
      setAvailableCategories(selectedCategory.category)
    } else {
      console.log('✗ No categories found, clearing dropdown')
      setAvailableCategories([])
    }
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
    if (!formData.price) {
      alert('Please enter price')
      return
    }

    setSaving(true)
    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        category: formData.category_id,
        type: formData.type || null,
        product_category: formData.product_category || null,
        image_url: formData.image_url,

        price: parseFloat(formData.price) || null,
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
        is_active: formData.is_active
      }

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)

      if (error) throw error

      alert('Product updated successfully!')
      router.push('/admin/products')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mb-4"></div>
            <p className="text-gray-600">Loading product data...</p>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-[#0F172A]">Edit Product</h1>
          <p className="text-sm text-[#64748B]">Update the details below</p>
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

            {/* Slug field hidden - auto-generated from product name */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type 
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={!formData.category_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Type</option>
                  {availableTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Filter
                </label>
                <select
                  value={formData.product_category}
                  onChange={(e) => setFormData({ ...formData, product_category: e.target.value })}
                  disabled={!formData.category_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Category</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
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
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="999"
                    className="w-full px-2 py-2 sm:px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    placeholder="1299"
                    className="w-full px-2 py-2 sm:px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="23"
                    className="w-full px-2 py-2 sm:px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
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

        {/* 8. STATUS */}
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
            {saving ? 'Updating...' : 'Update Product'}
          </Button>
        </div>
      </div>
    </div>
  )
}
