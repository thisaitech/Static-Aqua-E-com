'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ChevronRight, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { getProductById } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';

export default function WishlistPage() {
  const { wishlist, user, toggleAuthModal } = useStore();

  const wishlistProducts = wishlist
    .map(id => getProductById(id))
    .filter(Boolean);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800">Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <Heart className="w-7 h-7 text-red-500 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-display">
              Your Wishlist
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {/* Content */}
        {!user ? (
          // Not logged in
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              Sign in to view your wishlist
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Create an account or sign in to save your favorite products and access them anytime.
            </p>
            <Button onClick={toggleAuthModal} size="lg">
              Sign In / Register
            </Button>
          </motion.div>
        ) : wishlistProducts.length === 0 ? (
          // Empty wishlist
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Start adding products you love! Click the heart icon on any product to save it here.
            </p>
            <Link href="/">
              <Button size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          // Wishlist with items
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product, index) => (
              product && <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

