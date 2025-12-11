'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ChevronRight, 
  Heart, 
  ShoppingCart, 
  Share2, 
  Minus, 
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Star,
  MessageCircle
} from 'lucide-react';
import { getProductById, getProductsByCategory, categories, Product } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn } from '@/lib/utils';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  
  const product = getProductById(productId);
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Product Not Found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.category);
  const relatedProducts = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 4);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleWhatsAppInquiry = () => {
    const message = encodeURIComponent(`Hi! I'm interested in: ${product.name}`);
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          {category && (
            <>
              <Link 
                href={`/category/${category.slug}`}
                className="hover:text-primary-600 transition-colors"
              >
                {category.name}
              </Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </>
          )}
          <span className="text-slate-800 truncate">{product.name}</span>
        </nav>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="px-4 py-1.5 bg-accent-500 text-white text-sm font-bold rounded-full shadow-lg">
                  NEW
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-4 py-1.5 bg-amber-500 text-white text-sm font-bold rounded-full shadow-lg">
                  BEST SELLER
                </span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="px-4 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all',
                  inWishlist
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-red-500 hover:text-white'
                )}
              >
                <Heart className={cn('w-6 h-6', inWishlist && 'fill-current')} />
              </button>
              <button className="w-12 h-12 rounded-xl bg-white text-slate-600 hover:bg-primary-500 hover:text-white flex items-center justify-center shadow-lg transition-all">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Category */}
            <p className="text-sm text-primary-600 font-medium uppercase tracking-wider mb-2">
              {category?.name || product.category}
            </p>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white font-display mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-5 h-5',
                      star <= 4 ? 'text-amber-400 fill-current' : 'text-slate-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-slate-500">(4.0)</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">24 reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              {product.contactForPrice ? (
                <span className="text-3xl font-bold text-slate-800">Contact for Price</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                        Save {formatPrice(product.originalPrice - product.price)}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-8">
              <span className={cn(
                'w-3 h-3 rounded-full',
                product.inStock ? 'bg-green-500' : 'bg-red-500'
              )} />
              <span className={cn(
                'font-medium',
                product.inStock ? 'text-green-600' : 'text-red-500'
              )}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity & Add to Cart */}
            {!product.contactForPrice && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Quantity Selector */}
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  size="lg" 
                  className="flex-1 text-lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            )}

            {/* WhatsApp Inquiry */}
            <button
              onClick={handleWhatsAppInquiry}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#25D366] text-white font-medium hover:bg-[#20BD5A] transition-colors mb-8"
            >
              <MessageCircle className="w-5 h-5" fill="currentColor" />
              Inquire on WhatsApp
            </button>

            {/* Trust Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Free Shipping</p>
                  <p className="text-xs text-slate-500">Orders over ₹2,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Quality Assured</p>
                  <p className="text-xs text-slate-500">100% genuine</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Easy Returns</p>
                  <p className="text-xs text-slate-500">7-day policy</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

