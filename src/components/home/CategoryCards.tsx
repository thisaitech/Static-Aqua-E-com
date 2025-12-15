'use client';

import Link from 'next/link';
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
  Waves
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Category icons mapping
const categoryIcons: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'fish-tanks': { 
    icon: <Fish className="w-6 h-6" />, 
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  'live-plants': { 
    icon: <Leaf className="w-6 h-6" />, 
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  'co2-lighting': { 
    icon: <Zap className="w-6 h-6" />, 
    color: 'text-yellow-600',
    bg: 'bg-yellow-100'
  },
  'live-fish': { 
    icon: <Waves className="w-6 h-6" />, 
    color: 'text-cyan-600',
    bg: 'bg-cyan-100'
  },
  'fancy-birds': { 
    icon: <Bird className="w-6 h-6" />, 
    color: 'text-orange-600',
    bg: 'bg-orange-100'
  },
  'bird-supplies': { 
    icon: <Home className="w-6 h-6" />, 
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  'foods-medicines': { 
    icon: <Pill className="w-6 h-6" />, 
    color: 'text-red-600',
    bg: 'bg-red-100'
  },
  'tank-accessories': { 
    icon: <Wrench className="w-6 h-6" />, 
    color: 'text-slate-600',
    bg: 'bg-slate-100'
  },
  'accessories': { 
    icon: <Settings className="w-6 h-6" />, 
    color: 'text-indigo-600',
    bg: 'bg-indigo-100'
  },
};

// Specific images for each category (high quality, relevant)
const categoryImageUrls: Record<string, string> = {
  'fish-tanks': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=200&h=200&fit=crop',
  'live-plants': 'https://images.unsplash.com/photo-1518882605630-8eb256b6cd5b?w=200&h=200&fit=crop',
  'co2-lighting': 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=200&h=200&fit=crop',
  'live-fish': 'https://images.unsplash.com/photo-1520302519878-3433a57e9dff?w=200&h=200&fit=crop',
  'fancy-birds': 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop',
  'bird-supplies': 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=200&h=200&fit=crop',
  'foods-medicines': 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=200&h=200&fit=crop',
  'tank-accessories': 'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=200&h=200&fit=crop',
  'accessories': 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=200&h=200&fit=crop',
};

interface Category {
  id: number;
  name: string;
  image_url: string;
  display_order: number;
}

export function CategoryCards() {
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
        .select('*')
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
      <section className="py-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4 sm:gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-200 dark:bg-slate-700 mb-2" />
                <div className="w-12 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              Shop by Category
            </h2>
            <div className="hidden sm:block w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full" />
          </div>
          <Link 
            href="/category/all"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
          >
            View All
            <span className="text-lg">→</span>
          </Link>
        </div>

        {/* Categories Grid - Circular Icons */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4 sm:gap-6">
          {categories.map((category, index) => {
            const slug = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '');
            const iconKey = slug;
            const iconConfig = categoryIcons[iconKey];
            const fallbackImage = categoryImageUrls[iconKey];
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  href={`/category/${slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Circular Image/Icon Container */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    {/* Background Image */}
                    <img
                      src={category.image_url || fallbackImage}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay with Icon */}
                    {iconConfig && (
                      <div className={cn(
                        'absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
                        iconConfig.bg,
                        'bg-opacity-90'
                      )}>
                        <span className={iconConfig.color}>
                          {iconConfig.icon}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs sm:text-sm font-medium line-clamp-2 transition-colors text-slate-600 dark:text-slate-300 group-hover:text-primary-600">
                    {category.name.split('&')[0].trim()}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Deals/Offers Banner with proper images
export function DealsBanner() {
  const deals = [
    {
      title: 'Ultra Clear Tanks',
      discount: 'Up to 30% Off',
      image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
      link: '/category/fish-tanks',
      icon: <Fish className="w-5 h-5" />,
      bgColor: 'from-blue-600 to-blue-700',
    },
    {
      title: 'ADA Live Plants',
      discount: 'Starting ₹250',
      image: 'https://images.unsplash.com/photo-1518882605630-8eb256b6cd5b?w=400&h=300&fit=crop',
      link: '/category/live-plants',
      icon: <Leaf className="w-5 h-5" />,
      bgColor: 'from-green-600 to-green-700',
    },
    {
      title: 'Air Pumps & Filters',
      discount: 'Min 40% Off',
      image: 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=400&h=300&fit=crop',
      link: '/category/co2-lighting',
      icon: <Zap className="w-5 h-5" />,
      bgColor: 'from-purple-600 to-purple-700',
    },
    {
      title: 'Fancy Birds',
      discount: 'Hand-raised',
      image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
      link: '/category/fancy-birds',
      icon: <Bird className="w-5 h-5" />,
      bgColor: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <section className="py-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔥</span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
            Top Deals
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href={deal.link}
                className="group block relative overflow-hidden rounded-xl aspect-[4/3]"
              >
                {/* Background Image */}
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-t opacity-90',
                  deal.bgColor
                )} />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                  {/* Icon Badge */}
                  <div className="flex justify-end">
                    <span className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      {deal.icon}
                    </span>
                  </div>
                  
                  {/* Text */}
                  <div>
                    <span className="inline-block text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded mb-2">
                      {deal.discount}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base">{deal.title}</h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
