'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '@/data/products';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge_text: string;
  button_text: string;
  button_link: string;
  video_url: string | null;
  media_type: 'image' | 'video';
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);

  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    badge_text: '',
    button_text: 'Shop Now',
    button_link: '/',
    video_url: '',
    media_type: 'video',
    is_active: true
  });

  const supabase = createClient();



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch banners
      const { data: bannersData, error: bannersError } = await supabase
        .from('hero_banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (bannersError) throw bannersError;

      setBanners(bannersData || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('slug, name')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;

      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${type}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      setBannerFormData(prev => ({
        ...prev,
        [type === 'desktop' ? 'desktop_image' : 'mobile_image']: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setUploading(true);

      // Validate file type
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validVideoTypes.includes(file.type)) {
        alert('Please upload a valid video file (MP4, WebM, or OGG)');
        return;
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert('Video file is too large. Maximum size is 50MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-video.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banner-videos')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('banner-videos')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      setBannerFormData(prev => ({
        ...prev,
        video_url: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Make sure the banner-videos bucket exists in Supabase Storage.');
    } finally {
      setUploading(false);
    }
  };

  const saveBanner = async () => {
    if (!bannerFormData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    try {
      const dataToSave: any = { ...bannerFormData };
      // Remove any accidental image/bg_color fields
      delete dataToSave.desktop_image;
      delete dataToSave.mobile_image;
      delete dataToSave.bg_color;
      if (editingBanner) {
        const { error } = await supabase
          .from('hero_banners')
          .update(dataToSave)
          .eq('id', editingBanner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hero_banners')
          .insert({
            ...dataToSave,
            display_order: banners.length + 1,
          });
        if (error) throw error;
      }
      setShowBannerModal(false);
      resetBannerForm();
      fetchData();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };



  const toggleBannerActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling banner:', error);
    }
  };



  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };



  const resetBannerForm = () => {
    setBannerFormData({
      title: '',
      subtitle: '',
      badge_text: '',
      button_text: 'Shop Now',
      button_link: '/',
      video_url: '',
      media_type: 'video',
      is_active: true
    });
    setEditingBanner(null);
  };

  const editBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      badge_text: banner.badge_text,
      button_text: banner.button_text,
      button_link: banner.button_link,
      video_url: banner.video_url || '',
      media_type: banner.media_type || 'video',
      is_active: banner.is_active
    });
    setShowBannerModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Banners</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Manage hero banners</p>
        </div>
        <button
          onClick={() => {
            resetBannerForm();
            setShowBannerModal(true);
          }}
          className="flex items-center gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-xs sm:text-sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          Add
        </button>
      </div>

      {/* Stats */}
      <div className="mb-3 sm:mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-lg p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Banners</p>
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mt-0.5 sm:mt-1">{banners.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-lg p-8 text-center">
          <p className="text-gray-600">No banners created yet</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 overflow-hidden hover:shadow-2xl hover:shadow-purple-200/50 hover:scale-105 transition-all duration-300"
            >
              {/* Banner Image Preview */}
              {(banner as any).desktop_image && (
                <div className="relative h-24 sm:h-32 bg-gray-100">
                  <img
                    src={(banner as any).desktop_image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${(banner as any).bg_color}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white font-bold text-sm sm:text-lg px-4 text-center line-clamp-2">{banner.title}</h3>
                  </div>
                </div>
              )}

              {/* Banner Info */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  {/* Order indicator */}
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xs sm:text-sm">#{banner.display_order}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title & Status */}
                    <div className="flex items-center gap-2 mb-1">
                      {!(banner as any).desktop_image && (
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{banner.title}</h3>
                      )}
                      <button
                        onClick={() => toggleBannerActive(banner.id, banner.is_active)}
                        className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-semibold flex-shrink-0 transition-all duration-300 shadow-lg ${
                          banner.is_active
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
                            : 'bg-gradient-to-r from-slate-300 to-slate-400 text-white'
                        }`}
                      >
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </button>
                      {banner.badge_text && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold flex-shrink-0 shadow-lg">
                          {banner.badge_text}
                        </span>
                      )}
                    </div>

                    {/* Subtitle */}
                    {banner.subtitle && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-1.5 line-clamp-1">{banner.subtitle}</p>
                    )}

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                      <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {banner.button_text}
                      </span>
                      {banner.media_type === 'video' ? (
                        <span className="text-purple-600 font-medium">🎥 Video</span>
                      ) : (
                        <>
                          {(banner as any).desktop_image && <span className="text-emerald-600 font-medium">✓ Desktop</span>}
                          {(banner as any).mobile_image && <span className="text-emerald-600 font-medium">✓ Mobile</span>}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => editBanner(banner)}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:from-purple-600 hover:to-fuchsia-600 rounded-xl transition-all duration-300 font-semibold shadow-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 rounded-xl transition-all duration-300 font-semibold shadow-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Banner Modal */}
      <AnimatePresence>
        {showBannerModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/20 border border-purple-100"
            >
              <div className="p-6 border-b border-purple-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {editingBanner ? 'Edit Banner' : 'Add Banner'}
                  </h3>
                  <button
                    onClick={() => setShowBannerModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-purple-100 rounded-full transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.title}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    placeholder="Enter banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <textarea
                    value={bannerFormData.subtitle}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    placeholder="Enter banner subtitle"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={bannerFormData.badge_text}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, badge_text: e.target.value })}
                      className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                      placeholder="NEW ARRIVALS"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.button_text}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, button_text: e.target.value })}
                    className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Button Link (Category)
                  </label>
                  <select
                    value={bannerFormData.button_link}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, button_link: e.target.value })}
                    className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all duration-300"
                  >
                    <option value="/">Home</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={`/category/${category.slug}`}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select which category page this banner should link to
                  </p>
                </div>

                {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Upload Video
                    </label>
                    {bannerFormData.video_url ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <video
                            src={bannerFormData.video_url}
                            className="w-full h-48 object-cover rounded-xl"
                            controls
                          />
                          <div className={`absolute inset-0 bg-gradient-to-br ${(bannerFormData as any).bg_color} opacity-50 rounded-xl pointer-events-none`} />
                        </div>
                        <button
                          onClick={() => setBannerFormData({ ...bannerFormData, video_url: '' })}
                          className="text-red-600 text-sm hover:underline font-semibold"
                        >
                          Remove Video
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoUpload(file);
                          }}
                          className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                          disabled={uploading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Supported: MP4, WebM, OGG • Max size: 50MB • Recommended: 1920x1080
                        </p>
                        {uploading && (
                          <p className="text-xs text-purple-600 mt-2 font-semibold">Uploading video...</p>
                        )}
                      </div>
                    )}
                  </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={bannerFormData.is_active}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm font-semibold text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-purple-100 flex gap-3">
                <button
                  onClick={() => setShowBannerModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-purple-200 rounded-xl hover:bg-purple-50 font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBanner}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
