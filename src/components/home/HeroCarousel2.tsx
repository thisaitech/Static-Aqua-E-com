'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Fish, Bird, Leaf, Zap, Star, Heart, Shield, Award, Droplet, Sun, Moon, Wind, Flame, Snowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
}

interface BannerIcon {
  id: string;
  icon_name: string;
  icon_type: 'category' | 'page' | 'url';
  link_value: string;
  display_name: string;
  is_active: boolean;
  display_order: number;
}

// Icon mapping
const iconMap = {
  Fish,
  Bird,
  Leaf,
  Zap,
  Star,
  Heart,
  Shield,
  Award,
  Droplet,
  Sun,
  Moon,
  Wind,
  Flame,
  Snowflake
};

// Fallback slides for when Supabase fails
// Get category data from products.ts
const livePlantsCategory = categories.find(cat => cat.id === 'live-plants');
const fishTanksCategory = categories.find(cat => cat.id === 'fish-tanks');
const equipmentCategory = categories.find(cat => cat.id === 'co2-lighting');

const fallbackSlides = [
  {
    id: '1',
    title: livePlantsCategory?.name || "Live Plants & ADA Products",
    subtitle: livePlantsCategory?.description || "Premium ADA tissue culture plants and aquascaping supplies",
    badge_text: "NEW ARRIVALS",
    button_text: "Shop Plants",
    button_link: `/category/${livePlantsCategory?.slug || 'live-plants'}`,
    desktop_image: "https://images.unsplash.com/photo-1518882605630-8eb256b6cd5b?q=80&w=2070&auto=format&fit=crop",
    mobile_image: null,
    video_url: null,
    media_type: 'image' as const,
    bg_color: "from-emerald-900/95 via-emerald-800/90 to-emerald-900/80",
    is_active: true,
    display_order: 1
  },
  {
    id: '2',
    title: fishTanksCategory?.name || "Fish Tanks & Aquariums",
    subtitle: fishTanksCategory?.description || "Premium aquarium tanks for all your aquatic needs",
    badge_text: "BEST SELLERS",
    button_text: "Explore Tanks",
    button_link: `/category/${fishTanksCategory?.slug || 'fish-tanks'}`,
    desktop_image: "https://images.unsplash.com/photo-1564415027985-3fdfe20141f7?q=80&w=2070&auto=format&fit=crop",
    mobile_image: null,
    video_url: null,
    media_type: 'image' as const,
    bg_color: "from-blue-900/95 via-blue-800/90 to-blue-900/80",
    is_active: true,
    display_order: 2
  },
  {
    id: '3',
    title: equipmentCategory?.name || "CO2, Lighting & Equipment",
    subtitle: equipmentCategory?.description || "Professional aquatic equipment and filtration systems",
    badge_text: "PREMIUM QUALITY",
    button_text: "View Equipment",
    button_link: `/category/${equipmentCategory?.slug || 'co2-lighting'}`,
    desktop_image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=1974&auto=format&fit=crop",
    mobile_image: null,
    video_url: null,
    media_type: 'image' as const,
    bg_color: "from-purple-900/95 via-purple-800/90 to-purple-900/80",
    is_active: true,
    display_order: 3
  }
];

interface HeroCategory {
  id: string;
  name: string;
  slug: string;
}

export function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>(fallbackSlides);
  const [heroCategories, setHeroCategories] = useState<HeroCategory[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

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
        .eq('is_active', true)
        .order('display_order', { ascending: true});

      if (bannersError) {
        console.error('Error fetching banners:', bannersError);
      } else if (bannersData && bannersData.length > 0) {
        setBanners(bannersData);
      }

      // Fetch categories with show_in_hero = true
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .eq('show_in_hero', true)
        .order('display_order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching hero categories:', categoriesError);
        setHeroCategories([]);
      } else if (categoriesData) {
        setHeroCategories(categoriesData);
      } else {
        setHeroCategories([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Keep fallback data on error
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const getCategoryIcon = (name: string) => {
    const iconNameMap: { [key: string]: keyof typeof iconMap } = {
      'fish tanks': 'Fish',
      'live plants': 'Leaf',
      'fancy birds': 'Bird',
      'equipment': 'Zap',
      'live fish': 'Fish',
      'bird supplies': 'Bird',
      'foods & medicines': 'Droplet',
      'tank accessories': 'Shield',
      'accessories': 'Star',
      'co2 & lighting': 'Flame',
    };
    const iconName = iconNameMap[name.toLowerCase()] || 'Star';
    return iconMap[iconName] || Fish;
  };

  const getIconLink = (slug: string) => {
    return `/category/${slug}`;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  if (loading) {
    return (
      <div className="relative w-full h-[500px] md:h-[400px] bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-blue-900/80 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[400px] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              nextSlide();
            } else if (swipe > swipeConfidenceThreshold) {
              prevSlide();
            }
          }}
          className="absolute inset-0"
        >
          <div
            className={cn(
              "relative w-full h-full flex items-center",
              "bg-gradient-to-br",
              banners[currentSlide]?.bg_color || "from-blue-900/95 via-blue-800/90 to-blue-900/80"
            )}
          >
            {/* Background Image or Video */}
            {banners[currentSlide]?.media_type === 'video' && banners[currentSlide]?.video_url ? (
              <div className="absolute inset-0">
                <video
                  src={banners[currentSlide].video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br",
                  banners[currentSlide]?.bg_color || "from-blue-900/95 via-blue-800/90 to-blue-900/80"
                )} />
              </div>
            ) : banners[currentSlide]?.desktop_image ? (
              <div className="absolute inset-0">
                <picture>
                  {banners[currentSlide]?.mobile_image && (
                    <source
                      media="(max-width: 768px)"
                      srcSet={banners[currentSlide].mobile_image}
                    />
                  )}
                  <img
                    src={banners[currentSlide].desktop_image}
                    alt={banners[currentSlide].title}
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br",
                  banners[currentSlide]?.bg_color || "from-blue-900/95 via-blue-800/90 to-blue-900/80"
                )} />
              </div>
            ) : null}

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-12">
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    {banners[currentSlide]?.badge_text && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-2 sm:mb-4">
                        {banners[currentSlide].badge_text}
                      </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
                      {banners[currentSlide]?.title || "Welcome to Our Store"}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0">
                      {banners[currentSlide]?.subtitle || "Discover amazing products for your needs"}
                    </p>
                    <Link href={banners[currentSlide]?.button_link || '/'}>
                      <Button 
                        size="lg" 
                        className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-5 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 text-sm sm:text-base md:text-lg"
                      >
                        {banners[currentSlide]?.button_text || "Shop Now"}
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1);
                setCurrentSlide(index);
              }}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                currentSlide === index
                  ? "bg-white"
                  : "bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}

      {/* Bottom Icons - Hero Categories */}
      {heroCategories.length > 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-6">
          {heroCategories.map((category) => {
            const IconComponent = getCategoryIcon(category.name);
            return (
              <Link key={category.id} href={getIconLink(category.slug)}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors cursor-pointer group"
                >
                  <IconComponent className="w-5 h-5 text-white" />
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {category.name}
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}