'use client';

import { useState, useEffect } from 'react';
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
  MessageCircle,
  Check,
  Clock,
  Package
} from 'lucide-react';
import { getProductById, getProductsByCategory, Product } from '@/lib/dataFetchers';
import { getCategoryBySlug } from '@/lib/dataFetchers';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn } from '@/lib/utils';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, toggleWishlist, isInWishlist, user, toggleAuthModal } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [selectedImage, setSelectedImage] = useState(0);

  const handleToggleWishlist = () => {
    if (!user) {
      alert('Please login to add items to wishlist');
      toggleAuthModal();
      return;
    }
    if (product) {
      toggleWishlist(product.id);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(productId);
        if (productData) {
          setProduct(productData);

          // Fetch related products
          const related = await getProductsByCategory(productData.category);
          setRelatedProducts(related.filter(p => p.id !== productId).slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

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

  const inWishlist = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!user) {
      alert('Please login to add items to cart');
      toggleAuthModal();
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleWhatsAppInquiry = () => {
    const message = encodeURIComponent(`Hi! I'm interested in: ${product.name}`);
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Mock product images (in real app, fetch from database)
  const productImages = [product.image];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-slate-800 truncate">{product.name}</span>
        </nav>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-card group">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isNew && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                    NEW
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    ⭐ BEST SELLER
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button
                  onClick={handleToggleWishlist}
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all hover:scale-110',
                    inWishlist
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-slate-600 hover:bg-red-500 hover:text-white'
                  )}
                >
                  <Heart className={cn('w-5 h-5', inWishlist && 'fill-current')} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-primary-500 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                      selectedImage === idx
                        ? 'border-primary-500 shadow-md'
                        : 'border-transparent hover:border-slate-300'
                    )}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              <Package className="w-4 h-4" />
              {product.category}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-5 h-5',
                      star <= (product.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-slate-600 font-medium">
                {product.rating || 4.0} ({product.ratingCount || 24} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              {product.contactForPrice ? (
                <div className="space-y-2">
                  <span className="text-2xl font-bold text-slate-800">Contact for Best Price</span>
                  <p className="text-sm text-slate-600">Get a personalized quote</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-xl text-slate-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
                          SAVE {formatPrice(product.originalPrice - product.price)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">Inclusive of all taxes</p>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-slate-100">
              {product.inStock ? (
                <>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-700">In Stock</p>
                    <p className="text-sm text-slate-500">Ready to ship</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700">Out of Stock</p>
                    <p className="text-sm text-slate-500">Notify when available</p>
                  </div>
                </>
              )}
            </div>

            {/* Quantity & Actions */}
            {!product.contactForPrice && (
              <div className="space-y-3">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity
                  </label>
                  <div className="inline-flex items-center bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-16 text-center font-bold text-lg border-x-2 border-slate-200">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  size="lg"
                  className="w-full text-lg h-14 shadow-lg hover:shadow-xl"
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
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20BD5A] transition-all shadow-lg hover:shadow-xl h-14"
            >
              <MessageCircle className="w-5 h-5" fill="currentColor" />
              Inquire on WhatsApp
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Free Shipping</p>
                  <p className="text-[10px] text-slate-500">Above ₹2,000</p>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">100% Genuine</p>
                  <p className="text-[10px] text-slate-500">Quality Assured</p>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto">
                  <RefreshCw className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Easy Returns</p>
                  <p className="text-[10px] text-slate-500">7-Day Policy</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Description */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-card mb-16"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Description</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </motion.div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                You May Also Like
              </h2>
              <Link href="/shop" className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base">
                View All →
              </Link>
            </div>
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
