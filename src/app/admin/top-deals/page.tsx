'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Save,
  X,
  Eye,
  EyeOff,
  GripVertical,
  Flame,
  Upload
} from 'lucide-react';

interface TopDeal {
  id: string;
  title: string;
  discount: string;
  image_url: string;
  category_slug: string | null;
  custom_link: string | null;
  icon_name?: string;
  bg_color?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function TopDealsPage() {
  const [deals, setDeals] = useState<TopDeal[]>([]);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<TopDeal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    image_url: '',
    category_slug: '',
    custom_link: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchDeals();
    fetchCategories();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('top_deals')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching top deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('slug, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-deal.${fileExt}`;
      const filePath = `deals/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.discount.trim()) {
      alert('Please fill in title and discount');
      return;
    }

    if (!formData.image_url.trim()) {
      alert('Please upload an image');
      return;
    }

    try {
      if (editingDeal) {
        const { error } = await supabase
          .from('top_deals')
          .update({
            title: formData.title,
            discount: formData.discount,
            image_url: formData.image_url,
            category_slug: formData.category_slug || null,
            custom_link: formData.custom_link || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingDeal.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('top_deals')
          .insert({
            title: formData.title,
            discount: formData.discount,
            image_url: formData.image_url,
            category_slug: formData.category_slug || null,
            custom_link: formData.custom_link || null,
            is_active: true,
            display_order: deals.length + 1,
          });

        if (error) throw error;
      }

      await fetchDeals();
      setShowModal(false);
      setEditingDeal(null);
      setFormData({
        title: '',
        discount: '',
        image_url: '',
        category_slug: '',
        custom_link: '',
      });
    } catch (error: any) {
      console.error('Error saving deal:', error);
      alert(`Failed to save: ${error.message}`);
    }
  };

  const handleEdit = (deal: TopDeal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      discount: deal.discount,
      image_url: deal.image_url || '',
      category_slug: deal.category_slug || '',
      custom_link: deal.custom_link || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const { error } = await supabase
        .from('top_deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchDeals();
    } catch (error: any) {
      console.error('Error deleting deal:', error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const toggleActive = async (deal: TopDeal) => {
    try {
      const { error } = await supabase
        .from('top_deals')
        .update({ is_active: !deal.is_active })
        .eq('id', deal.id);

      if (error) throw error;
      await fetchDeals();
    } catch (error: any) {
      console.error('Error toggling active:', error);
      alert(`Failed to toggle: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Top Deals</h1>
            <p className="text-sm text-gray-600">Manage featured deals on homepage</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Deals Grid */}
      {deals.length === 0 ? (
        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-lg">
          <Flame className="w-16 h-16 mx-auto text-orange-400 mb-4" />
          <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">No Deals Yet</h3>
          <p className="text-gray-600 mb-4">Create your first top deal to display on the homepage.</p>
          <Button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 rounded-xl font-semibold shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Create First Deal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group bg-white/80 backdrop-blur-sm rounded-2xl border overflow-hidden hover:shadow-2xl hover:shadow-purple-200/50 hover:scale-105 transition-all duration-300 ${
                deal.is_active ? 'border-purple-100/50' : 'border-slate-300 opacity-60'
              }`}
            >
              {/* Preview Card */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                <img
                  src={deal.image_url}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
                {/* Text overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="inline-block text-xs font-semibold bg-white/90 text-gray-900 px-2 py-1 rounded mb-2">
                    {deal.discount}
                  </span>
                  <h3 className="font-bold text-sm text-white">{deal.title}</h3>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-3">
                <div className="text-xs text-gray-600 min-h-[2rem]">
                  {deal.category_slug ? (
                    <span>Links to: /category/{deal.category_slug}</span>
                  ) : deal.custom_link ? (
                    <span>Links to: {deal.custom_link}</span>
                  ) : (
                    <span className="text-gray-400">No link set</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => toggleActive(deal)}
                    className={`w-full text-xs px-2 py-2 flex flex-col items-center gap-1 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                      deal.is_active
                        ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-white hover:from-slate-400 hover:to-slate-500'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white hover:from-emerald-500 hover:to-teal-500'
                    }`}
                  >
                    {deal.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Show</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleEdit(deal)}
                    className="w-full text-xs px-2 py-2 flex flex-col items-center gap-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:from-purple-600 hover:to-fuchsia-600 rounded-xl font-semibold shadow-lg transition-all duration-300"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    onClick={() => handleDelete(deal.id)}
                    className="w-full text-xs px-2 py-2 flex flex-col items-center gap-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 rounded-xl font-semibold shadow-lg transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingDeal ? 'Edit Deal' : 'Add New Deal'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDeal(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Ultra Clear Tanks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer/Discount Text *
                </label>
                <input
                  type="text"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="e.g., Up to 30% Off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deal Image *
                </label>
                {formData.image_url ? (
                  <div className="space-y-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload deal image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="deal-image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="deal-image-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Choose Image'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 400x300px, JPG or PNG
                    </p>
                  </div>
                )}
              </div>

              {/* Category Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Category (Recommended)
                </label>
                <select
                  value={formData.category_slug}
                  onChange={(e) => setFormData({ ...formData, category_slug: e.target.value, custom_link: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Link (Alternative) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Custom Link
                </label>
                <input
                  type="text"
                  value={formData.custom_link}
                  onChange={(e) => setFormData({ ...formData, custom_link: e.target.value, category_slug: '' })}
                  placeholder="/custom-page"
                  disabled={!!formData.category_slug}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setEditingDeal(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={uploading}>
                <Save className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : editingDeal ? 'Update Deal' : 'Create Deal'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
