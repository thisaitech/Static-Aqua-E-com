'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  GripVertical,
  Filter,
  Tag
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { categories } from '@/data/products';

interface FilterType {
  id: string;
  category_slug: string;
  filter_name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function FilterTypesPage() {
  const [filterTypes, setFilterTypes] = useState<FilterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFilter, setEditingFilter] = useState<FilterType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('equipment');

  const [formData, setFormData] = useState({
    category_slug: 'equipment',
    filter_name: '',
    is_active: true
  });

  const supabase = createClient();

  useEffect(() => {
    fetchFilterTypes();
  }, [selectedCategory]);

  const fetchFilterTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('filter_types')
        .select('*')
        .eq('category_slug', selectedCategory)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFilterTypes(data || []);
    } catch (error) {
      console.error('Error fetching filter types:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFilterType = async () => {
    if (!formData.filter_name.trim()) {
      alert('Please enter a filter name');
      return;
    }

    try {
      if (editingFilter) {
        const { error } = await supabase
          .from('filter_types')
          .update({
            filter_name: formData.filter_name,
            is_active: formData.is_active,
          })
          .eq('id', editingFilter.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('filter_types')
          .insert({
            category_slug: formData.category_slug,
            filter_name: formData.filter_name,
            is_active: formData.is_active,
            display_order: filterTypes.length + 1,
          });

        if (error) throw error;
      }

      setShowModal(false);
      resetForm();
      fetchFilterTypes();
    } catch (error) {
      console.error('Error saving filter type:', error);
      alert('Failed to save filter type');
    }
  };

  const toggleFilterActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('filter_types')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchFilterTypes();
    } catch (error) {
      console.error('Error toggling filter:', error);
    }
  };

  const deleteFilterType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this filter type?')) return;

    try {
      const { error } = await supabase
        .from('filter_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchFilterTypes();
    } catch (error) {
      console.error('Error deleting filter type:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      category_slug: selectedCategory,
      filter_name: '',
      is_active: true
    });
    setEditingFilter(null);
  };

  const editFilter = (filter: FilterType) => {
    setEditingFilter(filter);
    setFormData({
      category_slug: filter.category_slug,
      filter_name: filter.filter_name,
      is_active: filter.is_active
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Filter Types Management</h1>
          <p className="text-slate-600">Manage dynamic filter types for each category</p>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Select Category:</span>
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => {
                  setSelectedCategory(category.slug);
                  setFormData(prev => ({ ...prev, category_slug: category.slug }));
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Types Section */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-500" />
                  Filter Types - {categories.find(c => c.slug === selectedCategory)?.name}
                </h2>
                <p className="text-sm text-slate-600">Manage filter options for this category</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Filter Type
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading filter types...</p>
              </div>
            ) : filterTypes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No filter types created yet for this category</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filterTypes.map((filter) => (
                  <div key={filter.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Tag className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{filter.filter_name}</h3>
                          <p className="text-xs text-gray-500">
                            Order: {filter.display_order}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleFilterActive(filter.id, filter.is_active)}
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            filter.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {filter.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editFilter(filter)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFilterType(filter.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-lg w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {editingFilter ? 'Edit Filter Type' : 'Add Filter Type'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category_slug}
                    onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                    disabled={!!editingFilter}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Name *
                  </label>
                  <input
                    type="text"
                    value={formData.filter_name}
                    onChange={(e) => setFormData({ ...formData, filter_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CO2 Systems, Aquarium Lights"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveFilterType}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingFilter ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}