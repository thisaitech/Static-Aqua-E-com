'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Zap, Sparkles, TrendingUp, Check, Phone } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/data/products';
import { formatPrice, cn } from '@/lib/utils';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, index = 0, variant = 'default' }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, user, toggleAuthModal } = useStore();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to add items to cart');
      toggleAuthModal();
      return;
    }
    if (!product.contactForPrice) {
      addToCart(product);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to add items to wishlist');
      toggleAuthModal();
      return;
    }
  
    toggleWishlist(product.id);
  };

  // Use discount from database if available, otherwise calculate
  const discount = product.discountPercent ?? (
    product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0
  );

  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.03 }}
        className="group flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary-200 transition-all"
      >
        <Link href={`/product/${product.id}`} className="flex-shrink-0">
          <div className="relative w-28 h-28 bg-slate-50 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-medium text-slate-800 dark:text-white line-clamp-2 text-sm group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">
              {product.rating?.toFixed(1) || '4.0'} <Star className="w-3 h-3 fill-current" />
            </span>
            <span className="text-xs text-slate-400">({product.ratingCount || 0})</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {product.contactForPrice ? (
              <span className="text-sm font-semibold text-slate-800">Contact for Price</span>
            ) : (
              <>
                <span className="font-bold text-slate-800 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {discount}% off
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="product-card group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300"
    >
      {/* Image Container */}
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-700">
          <img
            src={product.image}
            alt={product.name}
            className="product-image w-full h-full object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded">
                <Sparkles className="w-3 h-3" />
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">
                <TrendingUp className="w-3 h-3" />
                BESTSELLER
              </span>
            )}
            {discount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded">
                <Zap className="w-3 h-3" />
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md',
              inWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white text-slate-400 hover:text-red-500'
            )}
          >
            <Heart className={cn('w-4 h-4', inWishlist && 'fill-current')} />
          </button>

          {/* Quick Add Button - Shows on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleAddToCart}
              className={cn(
                'w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all',
                product.contactForPrice
                  ? 'bg-slate-800 text-white'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              )}
            >
              {product.contactForPrice ? (
                <>
                  <Phone className="w-4 h-4" />
                  Contact Store
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <Link href={`/product/${product.id}`}>
        <div className="p-3">
          {/* Brand/Category Tag */}
          <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wider mb-1">
            {product.category.replace(/-/g, ' ')}
          </p>
          
          {/* Name */}
          <h3 className="font-medium text-slate-800 dark:text-white line-clamp-2 text-sm leading-snug group-hover:text-primary-600 transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating & Stock */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">
              {product.rating?.toFixed(1) || '4.0'} <Star className="w-3 h-3 fill-current" />
            </span>
            <span className="text-xs text-slate-400">({product.ratingCount || 0})</span>
            {product.stockStatus === 'in_stock' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-200">
                <Check className="w-3 h-3" />
                In Stock
              </span>
            )}
            {product.stockStatus === 'low_stock' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded border border-amber-200">
                Low Stock
              </span>
            )}
            {product.stockStatus === 'out_of_stock' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-700 text-xs font-semibold rounded border border-red-200">
                Out of Stock
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-2 space-y-0.5">
            {product.contactForPrice ? (
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                Contact for Price
              </span>
            ) : (
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                <span className="text-lg font-bold text-slate-800 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Free Delivery Tag */}
          {!product.contactForPrice && product.price >= 1000 && (
            <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Free delivery above ₹1,000
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
