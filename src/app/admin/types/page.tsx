'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface CategoryType {
  id: number;
  category_id: number;
  name: string;
  is_active: boolean;
  display_order: number;
  categories?: { name: string };
}

export default function CategoryTypesPage() {
  const [types, setTypes] = useState<CategoryType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<CategoryType | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    display_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = createClient();
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      // Fetch types with category names
      const { data: typesData } = await supabase
        .from('category_types')
        .select('*, categories(name)')
        .order('display_order');

      setCategories(categoriesData || []);
      setTypes(typesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type?: CategoryType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        category_id: type.category_id.toString(),
        name: type.name,
        display_order: type.display_order,
      });
    } else {
      setEditingType(null);
      setFormData({
        category_id: '',
        name: '',
        display_order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const supabase = createClient();
      
      if (editingType) {
        // Update existing type
        const { error } = await supabase
          .from('category_types')
          .update({
            category_id: parseInt(formData.category_id),
            name: formData.name,
            display_order: formData.display_order,
          })
          .eq('id', editingType.id);

        if (error) throw error;
      } else {
        // Create new type
        const { error } = await supabase
          .from('category_types')
          .insert({
            category_id: parseInt(formData.category_id),
            name: formData.name,
            display_order: formData.display_order,
          });

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving type:', error);
      alert('Failed to save type');
    }
  };

  const toggleActive = async (type: CategoryType) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('category_types')
        .update({ is_active: !type.is_active })
        .eq('id', type.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this type?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('category_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting type:', error);
      alert('Failed to delete type');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group types by category
  const typesByCategory = types.reduce((acc, type) => {
    const categoryName = (type.categories as any)?.name || 'Unknown';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(type);
    return acc;
  }, {} as Record<string, CategoryType[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Category Types</h1>
          <p className="text-sm text-slate-600 mt-1">Manage sub-categories for each main category</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Type
        </button>
      </div>

      {/* Types grouped by category */}
      <div className="space-y-6">
        {Object.entries(typesByCategory).map(([categoryName, categoryTypes]) => (
          <div key={categoryName} className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">{categoryName}</h2>
              <p className="text-sm text-slate-600">{categoryTypes.length} types</p>
            </div>
            <div className="divide-y divide-slate-100">
              {categoryTypes.map((type) => (
                <div
                  key={type.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-800">{type.name}</p>
                      <p className="text-xs text-slate-500">Order: {type.display_order}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Active Toggle */}
                    <button
                      onClick={() => toggleActive(type)}
                      className={`p-2 rounded-lg transition-colors ${
                        type.is_active
                          ? 'text-green-600 bg-green-50 hover:bg-green-100'
                          : 'text-slate-400 bg-slate-50 hover:bg-slate-100'
                      }`}
                      title={type.is_active ? 'Active' : 'Inactive'}
                    >
                      {type.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenModal(type)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingType ? 'Edit Type' : 'Add New Type'}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Category Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Training Mirrors"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingType ? 'Save Changes' : 'Add Type'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
