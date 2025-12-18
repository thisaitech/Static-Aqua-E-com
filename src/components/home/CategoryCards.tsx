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
  Waves,
  Package,
  Gift,
  Star,
  Heart
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

interface TopDeal {
  id: string;
  title: string;
  discount: string;
  image_url: string;
  category_slug: string | null;
  custom_link: string | null;
  icon_name: string;
  bg_color: string;
  display_order: number;
}

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
  'equipment': { 
    icon: <Zap className="w-6 h-6" />, 
    color: 'text-amber-600',
    bg: 'bg-amber-100'
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
  'equipment': 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=200&h=200&fit=crop',
  'accessories': 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=200&h=200&fit=crop',
};

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
        .select('id, name, slug, image_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true});

      if (data && data.length > 0) {
        // Map to include image_url in the image field
        const mappedData = data.map(cat => ({
          ...cat,
          image: cat.image_url || undefined
        }));
        setCategories(mappedData);
      }
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
          {/* Loading Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="hidden sm:block w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            </div>
            <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          
          {/* Loading Categories */}
          <div className="overflow-x-auto pb-4">
            <div className="animate-pulse flex gap-4 min-w-max">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-24 sm:w-28 md:w-32 h-20 sm:h-24 md:h-28 rounded-xl bg-slate-200 dark:bg-slate-700 mb-2" />
                  <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show only first 8 categories
  const displayedCategories = categories.slice(0, 8);
  const hasMoreCategories = categories.length > 8;

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
          {/* Only show View All button if there are more than 8 categories */}
          {hasMoreCategories && (
            <Link
              href="/categories"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <span className="text-lg">→</span>
            </Link>
          )}
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="relative">
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
            <div className="flex gap-4 min-w-max">
              {displayedCategories.map((category, index) => {
                const iconKey = category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '');
                const iconConfig = categoryIcons[iconKey];
                const fallbackImage = categoryImageUrls[iconKey];
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link 
                      href={`/category/${category.slug || iconKey}`}
                      className="group flex flex-col items-center text-center"
                    >
                      {/* Category Card Container */}
                      <div className={cn(
                        'relative w-24 sm:w-28 md:w-32 h-20 sm:h-24 md:h-28 rounded-xl overflow-hidden mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg border border-slate-200 dark:border-slate-700',
                        category.slug === 'fancy-birds' 
                          ? 'ring-2 ring-primary-500 ring-offset-2' 
                          : ''
                      )}>
                        {/* Background Image */}
                        <img
                          src={category.image || fallbackImage}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        {/* Icon Overlay */}
                        {iconConfig && (
                          <div className="absolute top-2 right-2 transition-opacity">
                            <span className="w-6 h-6 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                              <span className={cn(iconConfig.color, "text-sm")}>
                                {iconConfig.icon}
                              </span>
                            </span>
                          </div>
                        )}
                        {/* Category Name on Card */}
                        <div className="absolute bottom-1 left-1 right-1">
                          <span className="text-xs font-semibold text-white line-clamp-1 drop-shadow-md">
                            {category.name.length > 15 ? category.name.substring(0, 15) + '...' : category.name}
                          </span>
                        </div>
                      </div>
                      
                      {/* Full Label Below Card */}
                      <span className="text-xs sm:text-sm font-medium line-clamp-2 transition-colors text-slate-600 dark:text-slate-300 group-hover:text-primary-600 max-w-24 sm:max-w-28 md:max-w-32">
                        {category.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Icon mapping helper
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    fish: <Fish className="w-5 h-5" />,
    bird: <Bird className="w-5 h-5" />,
    leaf: <Leaf className="w-5 h-5" />,
    zap: <Zap className="w-5 h-5" />,
    package: <Package className="w-5 h-5" />,
    gift: <Gift className="w-5 h-5" />,
    star: <Star className="w-5 h-5" />,
    heart: <Heart className="w-5 h-5" />,
  };
  return iconMap[iconName] || <Package className="w-5 h-5" />;
};

// Fallback static deals (if database is empty or fails)
const staticDeals = [
  {
    title: 'Ultra Clear Tanks',
    discount: 'Up to 30% Off',
    image_url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
    category_slug: 'fish-tanks',
    icon_name: 'fish',
    bg_color: 'from-blue-600 to-blue-700',
  },
  {
    title: 'ADA Live Plants',
    discount: 'Starting ₹250',
    image_url: 'https://images.unsplash.com/photo-1518882605630-8eb256b6cd5b?w=400&h=300&fit=crop',
    category_slug: 'live-plants',
    icon_name: 'leaf',
    bg_color: 'from-green-600 to-green-700',
  },
  {
    title: 'Air Pumps & Filters',
    discount: 'Min 40% Off',
    image_url: 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=400&h=300&fit=crop',
    category_slug: 'co2-lighting',
    icon_name: 'zap',
    bg_color: 'from-purple-600 to-purple-700',
  },
  {
    title: 'Fancy Birds',
    discount: 'Hand-raised',
    image_url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
    category_slug: 'fancy-birds',
    icon_name: 'bird',
    bg_color: 'from-orange-500 to-orange-600',
  },
];

// Deals/Offers Banner with proper images
export function DealsBanner() {
  const [deals, setDeals] = useState<TopDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data, error } = await supabase
          .from('top_deals')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        // Use database deals if available, otherwise fallback to static
        setDeals(data && data.length > 0 ? data : staticDeals as any);
      } catch (error) {
        console.error('Error fetching top deals:', error);
        // Fallback to static deals on error
        setDeals(staticDeals as any);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

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
          {deals.map((deal, index) => {
            // Determine link: category_slug takes priority, then custom_link
            const dealLink = deal.category_slug 
              ? `/category/${deal.category_slug}` 
              : deal.custom_link || '#';

            return (
              <motion.div
                key={deal.id || deal.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  href={dealLink}
                  className="group block relative overflow-hidden rounded-xl aspect-[4/3]"
                >
                  {/* Background Image */}
                  <img
                    src={deal.image_url}
                    alt={deal.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-t opacity-90',
                    deal.bg_color
                  )} />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                  {/* Icon Badge */}
                  <div className="flex justify-end">
                    <span className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      {getIconComponent(deal.icon_name)}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
