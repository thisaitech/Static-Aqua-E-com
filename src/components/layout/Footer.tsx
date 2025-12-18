'use client';

import Link from 'next/link';
import { Fish, Bird, Mail, Phone, MapPin, Instagram, Facebook, Youtube, Twitter, Smartphone, HelpCircle, FileText, Truck, CreditCard, RefreshCw, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-slate-800 text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* About */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Fish className="w-6 h-6 text-white" />
                <Bird className="w-3 h-3 text-white absolute -bottom-0.5 -right-0.5 bg-accent-500 rounded-full p-0.5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rainbow Aqua</h3>
                <p className="text-xs text-slate-400">Aquarium & Aviculture</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              India's premier destination for premium aquascaping supplies and hand-raised exotic birds.
              Serving passionate hobbyists across Tamil Nadu since 2015.
            </p>
            <div className="flex gap-2">
              <a href="#" className="w-9 h-9 bg-slate-700 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-700 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-700 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-700 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/faq" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/payments" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                  Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">
                  No 11, B & C, Near By Palayamkottai Railway Station, Railway Feeder Road, Palayamkottai
                  Tirunelveli-627002, Tamil Nadu
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href="tel:+918870777420" className="text-sm text-slate-400 hover:text-primary-400">
                  +91 88707 77420
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href="mailto:info@rainbowaqua.in" className="text-sm text-slate-400 hover:text-primary-400">
                  info@rainbowaqua.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="mt-10 pt-8 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <div className="text-left">
                  <p className="text-xs text-slate-400">Download App</p>
                  <p className="text-sm text-white font-medium">Coming Soon</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">Get exclusive offers on the app</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Languages:  English</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500">
              <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
              <span>•</span>
              <Link href="#" className="hover:text-slate-300">Terms of Use</Link>
              <span>•</span>
              <Link href="#" className="hover:text-slate-300">Sitemap</Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 text-slate-500">
              <span>© {currentYear} Rainbow Aqua. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span>
                Powered by{' '}
                <a 
                  href="https://thisaitech.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  ThisAI Technologies
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
