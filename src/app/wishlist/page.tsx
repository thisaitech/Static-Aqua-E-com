'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ChevronRight, ShoppingBag, RefreshCw } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { getProductById, Product } from '@/lib/dataFetchers';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';

export default function WishlistPage() {
  const { wishlist, user, toggleAuthModal } = useStore();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // Fetch products from Supabase when wishlist changes
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setWishlistProducts([]);
        return;
      }

      setLoading(true);
      console.log('Fetching products for wishlist:', wishlist);

      try {
        const products = await Promise.all(
          wishlist.map(id => getProductById(id))
        );

        const validProducts = products.filter((p): p is Product => p !== null);
        console.log('Fetched wishlist products:', validProducts);
        setWishlistProducts(validProducts);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
        setWishlistProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchWishlistProducts();
    }
  }, [wishlist, mounted]);

  // Debug logging
  useEffect(() => {
    console.log('Wishlist Page - User:', user);
    console.log('Wishlist Page - Wishlist array:', wishlist);
    console.log('Wishlist Page - Wishlist products:', wishlistProducts);
    console.log('Wishlist Page - LocalStorage wishlist:', localStorage.getItem('rainbow-aqua-wishlist'));
  }, [wishlist, user, wishlistProducts]);

  // Wait for initial mount and user load
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading on initial mount
  if (!mounted) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

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
        {loading ? (
          // Loading state
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
          </div>
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
              {!user && <span className="block mt-2 font-medium">Sign in to sync your wishlist across devices.</span>}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button size="lg">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
              {!user && (
                <Button onClick={toggleAuthModal} size="lg" variant="outline">
                  Sign In
                </Button>
              )}
            </div>
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

