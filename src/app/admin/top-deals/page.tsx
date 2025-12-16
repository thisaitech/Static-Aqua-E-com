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
  icon_name: string;
  bg_color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const iconOptions = [
  { value: 'fish', label: 'Fish 🐟' },
  { value: 'bird', label: 'Bird 🦜' },
  { value: 'leaf', label: 'Plant 🌿' },
  { value: 'zap', label: 'Lightning ⚡' },
  { value: 'package', label: 'Package 📦' },
  { value: 'gift', label: 'Gift 🎁' },
  { value: 'star', label: 'Star ⭐' },
  { value: 'heart', label: 'Heart ❤️' },
];

const gradientOptions = [
  { value: 'from-blue-600 to-blue-700', label: 'Blue', preview: 'bg-gradient-to-r from-blue-600 to-blue-700' },
  { value: 'from-green-600 to-green-700', label: 'Green', preview: 'bg-gradient-to-r from-green-600 to-green-700' },
  { value: 'from-purple-600 to-purple-700', label: 'Purple', preview: 'bg-gradient-to-r from-purple-600 to-purple-700' },
  { value: 'from-orange-500 to-orange-600', label: 'Orange', preview: 'bg-gradient-to-r from-orange-500 to-orange-600' },
  { value: 'from-red-600 to-red-700', label: 'Red', preview: 'bg-gradient-to-r from-red-600 to-red-700' },
  { value: 'from-pink-600 to-pink-700', label: 'Pink', preview: 'bg-gradient-to-r from-pink-600 to-pink-700' },
  { value: 'from-teal-600 to-teal-700', label: 'Teal', preview: 'bg-gradient-to-r from-teal-600 to-teal-700' },
  { value: 'from-indigo-600 to-indigo-700', label: 'Indigo', preview: 'bg-gradient-to-r from-indigo-600 to-indigo-700' },
];

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
    icon_name: 'package',
    bg_color: 'from-blue-600 to-blue-700',
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
            icon_name: formData.icon_name,
            bg_color: formData.bg_color,
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
            icon_name: formData.icon_name,
            bg_color: formData.bg_color,
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
        icon_name: 'package',
        bg_color: 'from-blue-600 to-blue-700',
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
      icon_name: deal.icon_name,
      bg_color: deal.bg_color,
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
            <h1 className="text-2xl font-bold text-gray-900">Top Deals</h1>
            <p className="text-sm text-gray-600">Manage featured deals on homepage</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Deals Grid */}
      {deals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Flame className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deals Yet</h3>
          <p className="text-gray-600 mb-4">Create your first top deal to display on the homepage.</p>
          <Button onClick={() => setShowModal(true)}>
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
              className={`bg-white rounded-xl border-2 overflow-hidden ${
                deal.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'
              }`}
            >
              {/* Preview Card */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={deal.image_url}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${deal.bg_color} opacity-90`} />
                <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                  <div className="flex justify-end">
                    <span className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-xs">
                      {deal.icon_name === 'fish' && '🐟'}
                      {deal.icon_name === 'bird' && '🦜'}
                      {deal.icon_name === 'leaf' && '🌿'}
                      {deal.icon_name === 'zap' && '⚡'}
                      {deal.icon_name === 'package' && '📦'}
                      {deal.icon_name === 'gift' && '🎁'}
                      {deal.icon_name === 'star' && '⭐'}
                      {deal.icon_name === 'heart' && '❤️'}
                    </span>
                  </div>
                  <div>
                    <span className="inline-block text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded mb-2">
                      {deal.discount}
                    </span>
                    <h3 className="font-bold text-sm">{deal.title}</h3>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-2">
                <div className="text-xs text-gray-600">
                  {deal.category_slug ? (
                    <span>Links to: /category/{deal.category_slug}</span>
                  ) : deal.custom_link ? (
                    <span>Links to: {deal.custom_link}</span>
                  ) : (
                    <span className="text-gray-400">No link set</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleActive(deal)}
                    variant={deal.is_active ? 'outline' : 'primary'}
                    className="flex-1 text-sm"
                  >
                    {deal.is_active ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleEdit(deal)}
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(deal.id)}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="w-3 h-3" />
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
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${formData.bg_color} opacity-50 rounded-lg`} />
                    </div>
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

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon.value}
                      onClick={() => setFormData({ ...formData, icon_name: icon.value })}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        formData.icon_name === icon.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{icon.label.split(' ')[1]}</span>
                      <p className="text-xs mt-1">{icon.label.split(' ')[0]}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Gradient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Gradient
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {gradientOptions.map((gradient) => (
                    <button
                      key={gradient.value}
                      onClick={() => setFormData({ ...formData, bg_color: gradient.value })}
                      className={`p-2 border-2 rounded-lg overflow-hidden ${
                        formData.bg_color === gradient.value
                          ? 'border-gray-900'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className={`h-12 rounded ${gradient.preview}`} />
                      <p className="text-xs mt-1 text-center">{gradient.label}</p>
                    </button>
                  ))}
                </div>
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
