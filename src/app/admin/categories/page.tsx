'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Plus, Edit2, Trash2, Image as ImageIcon, Star } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  is_active: boolean
  show_in_hero: boolean
  types: string[]
  category: string[]
  display_order: number
  created_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image_url: '',
    show_in_hero: false,
    types: [] as string[],
    category: [] as string[]
  })
  const [newTypeName, setNewTypeName] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from database...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      console.log('Categories fetched:', data);
      setCategories(data || [])
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      if (error.message?.includes('relation "categories" does not exist')) {
        alert('Categories table does not exist in database. Please run the SQL script first.');
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: data.publicUrl })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a category name')
      return
    }

    // Generate slug ONLY when creating new category (not when editing)
    const generateSlug = (text: string) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and') // Replace & with 'and'
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    };

    try {
      console.log('Saving category data:', formData);

      if (editingCategory) {
        console.log('Updating category:', editingCategory.id);
        // When editing, DO NOT update slug - keep it unchanged to avoid breaking URLs
        const { data, error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            // slug is NOT updated - remains the same
            image_url: formData.image_url || null,
            show_in_hero: formData.show_in_hero,
            types: formData.types,
            category: formData.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Category updated successfully:', data);
      } else {
        console.log('Inserting new category');
        // Generate slug from name when creating new category
        const slugValue = generateSlug(formData.name);
        
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            slug: slugValue,
            image_url: formData.image_url || null,
            is_active: true,
            show_in_hero: formData.show_in_hero,
            types: formData.types,
            category: formData.category,
            display_order: categories.length + 1,
          })
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Category inserted successfully:', data);
      }

      setShowModal(false)
      setFormData({ name: '', slug: '', image_url: '', show_in_hero: false, types: [], category: [] })
      setNewTypeName('')
      setNewCategoryName('')
      setEditingCategory(null)
      await fetchCategories()
      console.log('Categories refreshed');
    } catch (error: any) {
      console.error('Error saving category:', error)
      alert(`Failed to save category: ${error.message || 'Unknown error'}`)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug || '',
      image_url: category.image_url || '',
      show_in_hero: category.show_in_hero || false,
      types: category.types || [],
      category: category.category || [],
    })
    setShowModal(true)
  }

  const addType = () => {
    if (!newTypeName.trim()) return
    setFormData(prev => ({ 
      ...prev, 
      types: [...prev.types, newTypeName.trim()] 
    }))
    setNewTypeName('')
  }

  const removeType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.filter((_, i) => i !== index)
    }))
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) return
    setFormData(prev => ({ 
      ...prev, 
      category: [...prev.category, newCategoryName.trim()] 
    }))
    setNewCategoryName('')
  }

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.filter((_, i) => i !== index)
    }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchCategories()
    } catch (error) {
      console.error('Error toggling category:', error)
    }
  }

  return (
    <div className="p-2 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Categories</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {loading ? 'Loading...' : `${categories.length} categories`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null)
            setFormData({ name: '', slug: '', image_url: '', show_in_hero: false, types: [], category: [] })
            setNewTypeName('')
            setNewCategoryName('')
            setShowModal(true)
          }}
          className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Add
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-lg p-8 sm:p-12 text-center">
          <p className="text-gray-600 mb-4">No categories yet</p>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 rounded-xl font-semibold shadow-lg"
          >
            Add Your First Category
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-3 sm:p-4 hover:shadow-2xl hover:shadow-purple-200/50 hover:scale-105 transition-all duration-300"
            >
              {/* Mobile: Stack layout | Desktop: Flex layout */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* Row 1: Image + Title + Status (Mobile) / Image (Desktop) */}
                <div className="flex items-center gap-3 sm:block">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Title + Status (Mobile only) */}
                  <div className="flex-1 sm:hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-gray-900">
                        {category.name}
                      </h3>
                      {category.show_in_hero && (
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <button
                      onClick={() => toggleActive(category.id, category.is_active)}
                      className={`mt-1 text-xs px-2 py-0.5 rounded-full font-semibold transition-all duration-300 ${
                        category.is_active
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-lg'
                          : 'bg-gradient-to-r from-slate-300 to-slate-400 text-white shadow-lg'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  {/* Title + Status (Desktop only) */}
                  <div className="hidden sm:flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-base text-gray-900">
                      {category.name}
                    </h3>
                    {category.show_in_hero && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    <button
                      onClick={() => toggleActive(category.id, category.is_active)}
                      className={`text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${
                        category.is_active
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-lg'
                          : 'bg-gradient-to-r from-slate-300 to-slate-400 text-white shadow-lg'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Types */}
                  {category.types && category.types.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.types.map((type, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  {category.category && category.category.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Category:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.category.map((cat, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col gap-2 sm:gap-1.5">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:from-purple-600 hover:to-fuchsia-600 rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-lg hover:shadow-rose-500/50 transition-all duration-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-500/20 max-w-2xl w-full my-4 border border-purple-100 max-h-[95vh] flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-purple-100 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 px-4 py-3 sm:px-6 sm:py-4">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        // Only update name, slug is not changed
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        });
                      }}
                      placeholder="e.g., Fish Tanks"
                      className="w-full px-3 py-2 text-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    />
                    {editingCategory && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        URL slug remains unchanged to prevent breaking links: <span className="font-mono text-blue-600">/category/{editingCategory.slug}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Category Image
                    </label>
                    {formData.image_url ? (
                      <div className="relative">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-24 sm:h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-600 text-white px-2 py-1 rounded text-[10px] sm:text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="block w-full h-24 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2" />
                          <span className="text-xs sm:text-sm">
                            {uploading ? 'Uploading...' : 'Click to upload'}
                          </span>
                        </div>
                    </label>
                  )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show_in_hero"
                      checked={formData.show_in_hero}
                      onChange={(e) => setFormData({ ...formData, show_in_hero: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="show_in_hero" className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                      Show in Hero Section
                    </label>
                  </div>

                  {/* Types Management */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Types
                    </label>
                    
                    {/* Add Type Input */}
                    <div className="flex gap-1.5 sm:gap-2 mb-2">
                      <input
                        type="text"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addType()}
                        placeholder="e.g., 2 Feet Tanks"
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addType}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Types List */}
                    {formData.types.length > 0 && (
                      <div className="space-y-1.5 max-h-32 sm:max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-1.5 sm:p-2">
                        {formData.types.map((type, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded">
                            <span className="text-xs sm:text-sm text-gray-700 truncate flex-1 mr-2">{type}</span>
                            <button
                              type="button"
                              onClick={() => removeType(index)}
                              className="text-red-600 hover:text-red-700 flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Management */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Category
                    </label>
                    
                    {/* Add Category Input */}
                    <div className="flex gap-1.5 sm:gap-2 mb-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                        placeholder="e.g., TC Live Plants"
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addCategory}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Category List */}
                    {formData.category.length > 0 && (
                      <div className="space-y-1.5 max-h-32 sm:max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-1.5 sm:p-2">
                        {formData.category.map((cat, index) => (
                          <div key={index} className="flex items-center justify-between bg-green-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded">
                            <span className="text-xs sm:text-sm text-gray-700 truncate flex-1 mr-2">{cat}</span>
                            <button
                              type="button"
                              onClick={() => removeCategory(index)}
                              className="text-red-600 hover:text-red-700 flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-purple-100 flex-shrink-0">
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="flex-1 text-xs sm:text-sm py-2 border-purple-200 text-gray-700 hover:bg-purple-50 rounded-xl font-semibold transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white text-xs sm:text-sm py-2 rounded-xl font-semibold shadow-lg transition-all duration-300"
                  >
                    {uploading ? 'Uploading...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
