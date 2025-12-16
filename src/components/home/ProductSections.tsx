'use client';

import { motion } from 'framer-motion';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/data/products';
import { Sparkles, Clock, TrendingUp, ChevronRight, Star, Flame, Gift } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ProductSectionProps {
  title: string;
  icon: React.ReactNode;
  products: Product[];
  viewAllLink?: string;
  bgColor?: string;
  iconBg?: string;
}

function ProductSection({ 
  title, 
  icon,
  products, 
  viewAllLink,
  bgColor = 'bg-white dark:bg-slate-800',
  iconBg = 'bg-primary-100 text-primary-600'
}: ProductSectionProps) {
  return (
    <section className={`py-6 sm:py-8 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                {title}
              </h2>
            </div>
            <div className="hidden sm:block w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full ml-2" />
          </div>
          {viewAllLink && (
            <Link 
              href={viewAllLink}
              className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.slice(0, 10).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);
      
      if (!error && data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price || 0,
          originalPrice: p.mrp || undefined,
          image: p.image_url,
          category: p.category,
          rating: p.rating || 4.0,
          inStock: p.stock_status === 'in_stock',
          isNew: p.is_new || false,
          isBestSeller: p.is_best_seller || false,
          slug: p.slug
        })));
      }
    };
    fetchProducts();
  }, []);

  return (
    <ProductSection
      title="Featured Products"
      icon={<Star className="w-5 h-5" />}
      products={products}
      viewAllLink="/featured-products"
      iconBg="bg-amber-100 text-amber-600"
    />
  );
}

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_new', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (!error && data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price || 0,
          originalPrice: p.mrp || undefined,
          image: p.image_url,
          category: p.category,
          rating: p.rating || 4.0,
          inStock: p.stock_status === 'in_stock',
          isNew: p.is_new || false,
          isBestSeller: p.is_best_seller || false,
          slug: p.slug
        })));
      }
    };
    fetchProducts();
  }, []);

  return (
    <ProductSection
      title="New Arrivals"
      icon={<Sparkles className="w-5 h-5" />}
      products={products}
      viewAllLink="/new-arrivals"
      bgColor="bg-slate-50 dark:bg-slate-900"
      iconBg="bg-blue-100 text-blue-600"
    />
  );
}

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_best_seller', true)
        .eq('is_active', true)
        .limit(8);
      
      if (!error && data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price || 0,
          originalPrice: p.mrp || undefined,
          image: p.image_url,
          category: p.category,
          rating: p.rating || 4.0,
          inStock: p.stock_status === 'in_stock',
          isNew: p.is_new || false,
          isBestSeller: p.is_best_seller || false,
          slug: p.slug
        })));
      }
    };
    fetchProducts();
  }, []);

  return (
    <ProductSection
      title="Best Sellers"
      icon={<Flame className="w-5 h-5" />}
      products={products}
      viewAllLink="/best-sellers"
      iconBg="bg-red-100 text-red-600"
    />
  );
}

// Special Offers Section
export function SpecialOffers() {
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('mrp', 'is', null)
        .not('price', 'is', null)
        .limit(8);
      
      if (!error && data) {
        // Filter products with actual discounts (mrp > price)
        const discountedProducts = data.filter(p => p.mrp && p.price && p.mrp > p.price);
        setProducts(discountedProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price || 0,
          originalPrice: p.mrp || undefined,
          image: p.image_url,
          category: p.category,
          rating: p.rating || 4.0,
          inStock: p.stock_status === 'in_stock',
          isNew: p.is_new || false,
          isBestSeller: p.is_best_seller || false,
          slug: p.slug
        })));
      }
    };
    fetchProducts();
  }, []);

  return (
    <ProductSection
      title="Special Offers"
      icon={<Gift className="w-5 h-5" />}
      products={products}
      viewAllLink="/category/all?filter=offers"
      bgColor="bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-800"
      iconBg="bg-red-100 text-red-600"
    />
  );
}
