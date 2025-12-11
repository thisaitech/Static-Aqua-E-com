'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { getProductById } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';

export function WishlistPreview() {
  const { wishlist, user } = useStore();

  // Only show if user is logged in and has items in wishlist
  if (!user || wishlist.length === 0) return null;

  const wishlistProducts = wishlist
    .map(id => getProductById(id))
    .filter(Boolean)
    .slice(0, 4);

  if (wishlistProducts.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-red-50 to-pink-50 dark:from-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
              </div>
              <span className="text-sm font-medium text-red-600">
                Welcome back, {user.name.split(' ')[0]}!
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white font-display"
            >
              Your Wishlist
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              href="/wishlist"
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium group"
            >
              View All ({wishlist.length})
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Wishlist Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product, index) => (
            product && <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

