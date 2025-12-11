'use client';

import { motion } from 'framer-motion';
import { 
  Truck, 
  Shield, 
  Award, 
  Clock, 
  CreditCard, 
  Headphones,
  RefreshCw,
  BadgeCheck,
  Package,
  Percent
} from 'lucide-react';

const trustItems = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Orders above ₹2,000',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: '100% Secure',
    description: 'Safe payments',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: BadgeCheck,
    title: 'Quality Assured',
    description: 'Premium products',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '7-day policy',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
];

export function TrustBar() {
  return (
    <section className="py-6 border-y border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Compact promo banner for under the hero
export function PromoBanner() {
  const promoItems = [
    { icon: Truck, text: 'Free Shipping on ₹2000+' },
    { icon: CreditCard, text: 'COD Available' },
    { icon: Headphones, text: '24/7 Support' },
    { icon: Percent, text: 'Daily Deals' },
  ];

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-500 py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 sm:gap-8 text-white text-xs sm:text-sm font-medium overflow-x-auto whitespace-nowrap">
          {promoItems.map((item, index) => (
            <span key={index} className="flex items-center gap-1.5">
              <item.icon className="w-4 h-4" />
              {item.text}
              {index < promoItems.length - 1 && (
                <span className="hidden sm:inline text-white/50 ml-4">|</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Newsletter section with icon
export function NewsletterSection() {
  return (
    <section className="py-12 bg-gradient-to-r from-primary-600 to-accent-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <Package className="w-8 h-8 text-white" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Subscribe for Exclusive Offers
              </h3>
            </div>
            <p className="text-white/80 text-sm">
              Get updates on new arrivals and special discounts
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-72 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 border border-white/20 focus:outline-none focus:border-white/40"
            />
            <button className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-white/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
