'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Fish, Bird, Store, Leaf, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    title: "Premium Fish Tanks & Live Plants",
    subtitle: 'Ultra Clear Fish Tanks • Live Plants • Tank Accessories & Spares',
    cta: 'Shop Fish Tanks',
    link: '/category/fish-tanks',
    badge: 'NEW ARRIVALS',
    icon: Fish,
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=1920&h=800&fit=crop',
    bgColor: 'from-blue-900/95 via-blue-800/90 to-blue-900/80',
  },
  {
    id: 2,
    title: 'Fancy Birds & Bird Supplies',
    subtitle: 'Live Fish • Fancy Birds • Bird Supplies • Foods & Medicines',
    cta: 'Explore Birds',
    link: '/category/fancy-birds',
    badge: 'HAND-RAISED',
    icon: Bird,
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1920&h=800&fit=crop',
    bgColor: 'from-emerald-900/95 via-emerald-800/90 to-emerald-900/80',
  },
  {
    id: 3,
    title: 'Equipment & Accessories',
    subtitle: 'Equipment • Accessories • Foods & Medicines • Tank Accessories',
    cta: 'View Equipment',
    link: '/category/equipment',
    badge: 'BEST SELLERS',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1520302719682-f77b3bee9c8a?w=1920&h=800&fit=crop',
    bgColor: 'from-purple-900/95 via-purple-800/90 to-purple-900/80',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Touch handling for mobile swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) nextSlide();
    if (touchStart - touchEnd < -75) prevSlide();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <section 
      className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] min-h-[350px] max-h-[550px] overflow-hidden bg-slate-900"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />

          {/* Dark gradient at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                {/* Badge with Icon */}
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-semibold tracking-wider mb-4">
                  <CurrentIcon className="w-4 h-4" />
                  {slides[currentSlide].badge}
                </span>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                  {slides[currentSlide].title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-white/80 mb-6 max-w-md">
                  {slides[currentSlide].subtitle}
                </p>

                {/* CTA */}
                <Link href={slides[currentSlide].link}>
                  <Button size="lg" className="text-base px-8 shadow-xl">
                    {slides[currentSlide].cta}
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Decorative Icon */}
            <div className="hidden lg:block absolute right-20 bottom-20 opacity-10">
              <CurrentIcon className="w-64 h-64 text-white" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-slate-800 shadow-lg transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-slate-800 shadow-lg transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots with Icons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((slide, index) => {
          const SlideIcon = slide.icon;
          return (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'flex items-center justify-center transition-all duration-300 rounded-full',
                currentSlide === index
                  ? 'w-10 h-10 bg-white text-slate-800'
                  : 'w-8 h-8 bg-white/30 text-white hover:bg-white/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            >
              <SlideIcon className={cn(
                currentSlide === index ? 'w-5 h-5' : 'w-4 h-4'
              )} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
