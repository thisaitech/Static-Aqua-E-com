'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Fish,
  Bird,
  ChevronDown,
  MapPin,
  Truck,
  Package,
  LogOut,
  Settings
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  show_in_hero: boolean;
}

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export function Header() {
  const router = useRouter();
  const { cartCount, toggleCart, toggleAuthModal, wishlist } = useStore();
  const { user, userRole, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [mainCategories, setMainCategories] = useState<NavCategory[]>([]);
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when user changes (login/logout)
  useEffect(() => {
    setShowUserMenu(false);
  }, [user]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Live search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performLiveSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchDropdown(false);
      }
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showSearchDropdown || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchDropdown, showUserMenu]);

  const performLiveSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
        setShowSearchDropdown(true);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, show_in_hero')
        .eq('is_active', true)
        .eq('show_in_hero', true)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        setMainCategories(data);
      } else {
        setMainCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMainCategories([]);
    }
  };

  const getCategoryIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'fish tanks': '🐠',
      'live plants': '🌿',
      'fancy birds': '🦜',
      'equipment': '⚡',
      'live fish': '🐟',
      'bird supplies': '🏠',
      'foods & medicines': '🍽️',
      'tank accessories & spares': '🔧',
      'accessories': '🎨',
      'co2 & lighting': '💡',
    };
    return iconMap[name.toLowerCase()] || '📦';
  };

  const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Main Header */}
      <header 
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled 
            ? 'bg-white dark:bg-slate-900 shadow-md' 
            : 'bg-white dark:bg-slate-900'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <Fish className="w-6 h-6 text-white" />
                <Bird className="w-3 h-3 text-white absolute -bottom-0.5 -right-0.5 bg-accent-500 rounded-full p-0.5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                  Rainbow Aqua
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 italic">
                  Explore <span className="text-primary-500">Plus</span>
                </p>
              </div>
            </Link>

            {/* Search Bar - Flipkart style with Live Search */}
            <div className="hidden md:flex flex-1 max-w-2xl relative search-container">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for Fish Tanks, Plants, Birds and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                  className="w-full pl-12 pr-4 py-2.5 bg-primary-50 dark:bg-slate-800 border-0 rounded-lg text-sm text-slate-800 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  </div>
                )}
              </form>

              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto z-50">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                    >
                      <img
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
                          ₹{product.price.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                  {searchResults.length > 0 && (
                    <button
                      onClick={handleViewAllResults}
                      className="w-full px-4 py-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search */}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode */}
              <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Login/User Menu - Flipkart style */}
              <div className="hidden sm:block relative user-menu-container">
                <button
                  onClick={() => user ? setShowUserMenu(!showUserMenu) : toggleAuthModal()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-slate-700 dark:text-white">
                      {user ? user.email?.split('@')[0] : 'Login'}
                    </span>
                    {user && userRole === 'admin' && (
                      <span className="text-xs text-primary-600 dark:text-primary-400">Admin</span>
                    )}
                  </div>
                  {user && <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {/* User Dropdown Menu */}
                {user && showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {user.email}
                      </p>
                      {userRole === 'admin' && (
                        <p className="text-xs text-primary-600 dark:text-primary-400">Administrator</p>
                      )}
                    </div>

                    <div className="py-2">
                      {userRole === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/my-orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Wishlist
                        {wishlist.length > 0 && (
                          <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {wishlist.length}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-600">
                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          await signOut();
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* My Orders */}
              <Link
                href="/orders"
                className="hidden lg:flex items-center gap-1 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Orders</span>
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Heart className={cn(
                  "w-5 h-5",
                  wishlist.length > 0 && "fill-red-500 text-red-500"
                )} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart - Flipkart style */}
              <button
                onClick={toggleCart}
                className="relative flex items-center gap-1 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Cart</span>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 sm:top-0 sm:right-6 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile Menu */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar with Live Search */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden pb-3 overflow-visible relative search-container"
              >
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                    </div>
                  )}
                </form>

                {/* Mobile Search Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto z-50">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          handleProductClick(product.id);
                          setShowSearch(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                      >
                        <img
                          src={product.image_url || '/placeholder.png'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-800 dark:text-white line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                            ₹{product.price.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        handleViewAllResults();
                        setShowSearch(false);
                      }}
                      className="w-full px-3 py-2.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Navigation - Flipkart style */}
        <div className="hidden lg:block border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 py-2 overflow-x-auto">
              {mainCategories.map((cat, index) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    cat.show_in_hero
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  )}
                >
                  <span>{getCategoryIcon(cat.name)}</span>
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-50 shadow-2xl flex flex-col"
            >
              {/* User Section */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-full bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user ? user.email?.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {user ? `Hello, ${user.email?.split('@')[0]}` : 'Welcome'}
                    </p>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        toggleAuthModal();
                      }}
                      className="text-white/80 text-sm hover:underline"
                    >
                      {user ? 'View Profile' : 'Login / Sign Up'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Shop by Category
                </p>
                <div className="space-y-1">
                  {mainCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                        cat.show_in_hero
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <span className="text-lg">
                        {getCategoryIcon(cat.name)}
                      </span>
                      <span className="font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-slate-200 my-4" />

                <div className="space-y-1">
                  <Link
                    href="/my-orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <Package className="w-5 h-5" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <Heart className="w-5 h-5" />
                    <span>My Wishlist</span>
                    {wishlist.length > 0 && (
                      <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <User className="w-5 h-5" />
                    <span>My Account</span>
                  </Link>
                </div>
              </nav>

              {/* Bottom Links */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>© Rainbow Aqua</span>
                  <div className="flex items-center gap-2">
                    <span>தமிழ்</span>
                    <span>•</span>
                    <span>English</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
