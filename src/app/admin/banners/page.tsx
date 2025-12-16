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
  desktop_image: string | null;
  mobile_image: string | null;
  video_url: string | null;
  media_type: 'image' | 'video';
  bg_color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
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
    desktop_image: '',
    mobile_image: '',
    bg_color: 'from-blue-900/95 via-blue-800/90 to-blue-900/80',
    is_active: true
  });

  const supabase = createClient();

  const bgColorOptions = [
    'from-blue-900/95 via-blue-800/90 to-blue-900/80',
    'from-emerald-900/95 via-emerald-800/90 to-emerald-900/80',
    'from-purple-900/95 via-purple-800/90 to-purple-900/80',
    'from-orange-900/95 via-orange-800/90 to-orange-900/80',
    'from-red-900/95 via-red-800/90 to-red-900/80',
    'from-teal-900/95 via-teal-800/90 to-teal-900/80'
  ];

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
      if (editingBanner) {
        const { error } = await supabase
          .from('hero_banners')
          .update({
            ...bannerFormData,
          })
          .eq('id', editingBanner.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hero_banners')
          .insert({
            ...bannerFormData,
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
      desktop_image: '',
      mobile_image: '',
      video_url: '',
      media_type: 'video',
      bg_color: 'from-blue-900/95 via-blue-800/90 to-blue-900/80',
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
      desktop_image: banner.desktop_image || '',
      mobile_image: banner.mobile_image || '',
      video_url: banner.video_url || '',
      media_type: banner.media_type || 'video',
      bg_color: banner.bg_color,
      is_active: banner.is_active
    });
    setShowBannerModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Banners</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Manage hero banners</p>
        </div>
        <button
          onClick={() => {
            resetBannerForm();
            setShowBannerModal(true);
          }}
          className="flex items-center gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          Add
        </button>
      </div>

      {/* Stats */}
      <div className="mb-3 sm:mb-6">
        <div className="bg-white rounded-lg sm:rounded-xl border border-[#E2E8F0] p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-[#64748B]">Total Banners</p>
              <p className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-0.5 sm:mt-1">{banners.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-lg sm:rounded-xl border border-[#E2E8F0] p-8 text-center">
          <p className="text-gray-500">No banners created yet</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-200"
            >
              {/* Banner Image Preview */}
              {banner.desktop_image && (
                <div className="relative h-24 sm:h-32 bg-gray-100">
                  <img
                    src={banner.desktop_image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${banner.bg_color}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white font-bold text-sm sm:text-lg px-4 text-center line-clamp-2">{banner.title}</h3>
                  </div>
                </div>
              )}

              {/* Banner Info */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  {/* Order indicator */}
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xs sm:text-sm">#{banner.display_order}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title & Status */}
                    <div className="flex items-center gap-2 mb-1">
                      {!banner.desktop_image && (
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">{banner.title}</h3>
                      )}
                      <button
                        onClick={() => toggleBannerActive(banner.id, banner.is_active)}
                        className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium flex-shrink-0 ${
                          banner.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </button>
                      {banner.badge_text && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded flex-shrink-0">
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
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {banner.button_text}
                      </span>
                      {banner.media_type === 'video' ? (
                        <span className="text-purple-600 font-medium">🎥 Video</span>
                      ) : (
                        <>
                          {banner.desktop_image && <span className="text-green-600 font-medium">✓ Desktop</span>}
                          {banner.mobile_image && <span className="text-green-600 font-medium">✓ Mobile</span>}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => editBanner(banner)}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {editingBanner ? 'Edit Banner' : 'Add Banner'}
                  </h3>
                  <button
                    onClick={() => setShowBannerModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.title}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <textarea
                    value={bannerFormData.subtitle}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter banner subtitle"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={bannerFormData.badge_text}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, badge_text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="NEW ARRIVALS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color (Optional)
                    </label>
                    <select
                      value={bannerFormData.bg_color}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, bg_color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {bgColorOptions.map((color, index) => (
                        <option key={color} value={color}>
                          {index === 0 ? 'Blue (Default)' : 
                           index === 1 ? 'Green' :
                           index === 2 ? 'Purple' :
                           index === 3 ? 'Orange' :
                           index === 4 ? 'Red' : 'Teal'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Color overlay on banner image</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={bannerFormData.button_text}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, button_text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Shop Now"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={bannerFormData.button_link}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, button_link: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/category/fish-tanks"
                    />
                  </div>
                </div>

                {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Video
                    </label>
                    {bannerFormData.video_url ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <video 
                            src={bannerFormData.video_url} 
                            className="w-full h-48 object-cover rounded-lg"
                            controls
                          />
                          <div className={`absolute inset-0 bg-gradient-to-br ${bannerFormData.bg_color} opacity-50 rounded-lg pointer-events-none`} />
                        </div>
                        <button
                          onClick={() => setBannerFormData({ ...bannerFormData, video_url: '' })}
                          className="text-red-600 text-sm hover:underline"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={uploading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Supported: MP4, WebM, OGG • Max size: 50MB • Recommended: 1920x1080
                        </p>
                        {uploading && (
                          <p className="text-xs text-blue-600 mt-2">Uploading video...</p>
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
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowBannerModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBanner}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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