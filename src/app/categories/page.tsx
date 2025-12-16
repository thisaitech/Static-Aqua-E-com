'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Fish,
  Leaf,
  Zap,
  Bird,
  Home,
  Pill,
  Wrench,
  Settings,
  Waves,
  ArrowLeft
} from 'lucide-react';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

// Category icons mapping
const categoryIcons: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'fish-tanks': {
    icon: <Fish className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  'live-plants': {
    icon: <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  'co2-lighting': {
    icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100'
  },
  'live-fish': {
    icon: <Waves className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-cyan-600',
    bg: 'bg-cyan-100'
  },
  'fancy-birds': {
    icon: <Bird className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-orange-600',
    bg: 'bg-orange-100'
  },
  'bird-supplies': {
    icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  'foods-medicines': {
    icon: <Pill className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-red-600',
    bg: 'bg-red-100'
  },
  'tank-accessories': {
    icon: <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-slate-600',
    bg: 'bg-slate-100'
  },
  'equipment': {
    icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-amber-600',
    bg: 'bg-amber-100'
  },
  'accessories': {
    icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100'
  },
};

// Fallback images for each category
const categoryImageUrls: Record<string, string> = {
  'fish-tanks': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
  'live-plants': 'https://images.unsplash.com/photo-1518882605630-8eb256b6cd5b?w=400&h=300&fit=crop',
  'co2-lighting': 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=400&h=300&fit=crop',
  'live-fish': 'https://images.unsplash.com/photo-1520302519878-3433a57e9dff?w=400&h=300&fit=crop',
  'fancy-birds': 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
  'bird-supplies': 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=300&fit=crop',
  'foods-medicines': 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400&h=300&fit=crop',
  'tank-accessories': 'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=400&h=300&fit=crop',
  'equipment': 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=400&h=300&fit=crop',
  'accessories': 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=400&h=300&fit=crop',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, image_url, is_active, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Loading Header */}
          <div className="mb-6">
            <div className="w-48 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
            <div className="w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>

          {/* Loading Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4">
                <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 sm:mb-3 animate-pulse" />
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                <div className="w-2/3 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2">
            All Categories
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Browse all {categories.length} categories
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((category, index) => {
              const iconKey = category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '');
              const iconConfig = categoryIcons[iconKey];
              const fallbackImage = categoryImageUrls[iconKey];

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.4 }}
                >
                  <Link
                    href={`/category/${category.slug || iconKey}`}
                    className="group block relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    {/* Card Container with gradient border effect */}
                    <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[2px] rounded-2xl">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={category.image_url || fallbackImage}
                            alt={category.name}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                          />

                          {/* Animated Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                          {/* Shine Effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          </div>

                          {/* Icon Badge - Floating */}
                          {iconConfig && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className={cn(
                                'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300',
                                iconConfig.bg,
                                'group-hover:scale-110 group-hover:rotate-6'
                              )}>
                                <span className={iconConfig.color}>
                                  {iconConfig.icon}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Category Name Overlay - Bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                            <h3 className="font-bold text-sm sm:text-base text-white drop-shadow-lg line-clamp-2 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                              {category.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <span className="text-xs text-white/90 font-medium">Shop Now</span>
                              <svg className="w-4 h-4 text-white/90 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
