'use client';

import { HeroCarousel } from '@/components/home/HeroCarousel';
import { WishlistPreview } from '@/components/home/WishlistPreview';
import { CategoryCards, DealsBanner } from '@/components/home/CategoryCards';
import { FeaturedProducts, NewArrivals, BestSellers } from '@/components/home/ProductSections';
import { TrustBar, PromoBanner } from '@/components/home/TrustBar';

export default function HomePage() {
  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />
      
      {/* Promo Banner */}
      <PromoBanner />

      {/* Trust Bar */}
      <TrustBar />

      {/* Category Cards - Flipkart style circular icons */}
      <CategoryCards />

      {/* Deals Banner */}
      <DealsBanner />

      {/* Wishlist Preview (only shows for logged-in users with items) */}
      <WishlistPreview />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Best Sellers */}
      <BestSellers />
    </>
  );
}
