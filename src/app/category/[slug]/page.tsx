'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ChevronRight, 
  SlidersHorizontal, 
  Grid3X3, 
  LayoutGrid, 
  X,
  ChevronDown,
  Star,
  Check,
  Filter,
  Tag,
  Package,
  IndianRupee
} from 'lucide-react';
import { categories, getProductsByCategory, getProductsBySubcategory, Product } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  
  const category = categories.find(c => c.slug === slug);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'newest' | 'rating'>('relevance');
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['subcategory', 'price']);

  const products = useMemo(() => {
    let filtered: Product[];
    
    if (selectedSubcategory) {
      filtered = getProductsBySubcategory(slug, selectedSubcategory);
    } else {
      filtered = getProductsByCategory(slug);
    }

    // Filter by price
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter in stock
    if (showInStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    // Sort products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'rating':
          return 0; // Would sort by rating if available
        default:
          return 0;
      }
    });
  }, [slug, selectedSubcategory, sortBy, priceRange, showInStockOnly]);

  const toggleFilter = (filter: string) => {
    setExpandedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Category Not Found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-primary-600">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-800 dark:text-white font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Flipkart style */}
          <aside className={cn(
            'hidden lg:block w-64 flex-shrink-0',
          )}>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 sticky top-24">
              {/* Filters Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-600" />
                  <h2 className="font-bold text-slate-800 dark:text-white">Filters</h2>
                </div>
                <button 
                  onClick={() => {
                    setSelectedSubcategory(null);
                    setPriceRange([0, 200000]);
                    setShowInStockOnly(false);
                  }}
                  className="text-sm text-primary-600 hover:underline"
                >
                  CLEAR ALL
                </button>
              </div>

              {/* Subcategories Filter */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="border-b border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => toggleFilter('subcategory')}
                    className="flex items-center justify-between w-full p-4 text-left"
                  >
                    <span className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-white uppercase">
                      <Tag className="w-4 h-4 text-primary-500" />
                      {category.name.includes('Bird') ? 'Bird Type' : 'Type'}
                    </span>
                    <ChevronDown className={cn(
                      'w-4 h-4 text-slate-400 transition-transform',
                      expandedFilters.includes('subcategory') && 'rotate-180'
                    )} />
                  </button>
                  {expandedFilters.includes('subcategory') && (
                    <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="subcategory"
                          checked={!selectedSubcategory}
                          onChange={() => setSelectedSubcategory(null)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-primary-600">
                          All {category.name}
                        </span>
                      </label>
                      {category.subcategories.map((sub) => (
                        <label key={sub.slug} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="subcategory"
                            checked={selectedSubcategory === sub.slug}
                            onChange={() => setSelectedSubcategory(sub.slug)}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-primary-600">
                            {sub.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Filter */}
              <div className="border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => toggleFilter('price')}
                  className="flex items-center justify-between w-full p-4 text-left"
                >
                  <span className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-white uppercase">
                    <IndianRupee className="w-4 h-4 text-green-500" />
                    Price
                  </span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-slate-400 transition-transform',
                    expandedFilters.includes('price') && 'rotate-180'
                  )} />
                </button>
                {expandedFilters.includes('price') && (
                  <div className="px-4 pb-4 space-y-3">
                    {[
                      { label: 'Under ₹500', range: [0, 500] },
                      { label: '₹500 - ₹1,000', range: [500, 1000] },
                      { label: '₹1,000 - ₹5,000', range: [1000, 5000] },
                      { label: '₹5,000 - ₹10,000', range: [5000, 10000] },
                      { label: '₹10,000 - ₹50,000', range: [10000, 50000] },
                      { label: 'Above ₹50,000', range: [50000, 200000] },
                    ].map((item) => (
                      <label key={item.label} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={priceRange[0] === item.range[0] && priceRange[1] === item.range[1]}
                          onChange={() => setPriceRange(item.range as [number, number])}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-primary-600">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability Filter */}
              <div className="border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => toggleFilter('availability')}
                  className="flex items-center justify-between w-full p-4 text-left"
                >
                  <span className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-white uppercase">
                    <Package className="w-4 h-4 text-blue-500" />
                    Availability
                  </span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-slate-400 transition-transform',
                    expandedFilters.includes('availability') && 'rotate-180'
                  )} />
                </button>
                {expandedFilters.includes('availability') && (
                  <div className="px-4 pb-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={showInStockOnly}
                        onChange={(e) => setShowInStockOnly(e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-primary-600">
                        In Stock Only
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Rating Filter */}
              <div className="p-4">
                <button
                  onClick={() => toggleFilter('rating')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-white uppercase">
                    <Star className="w-4 h-4 text-amber-500" />
                    Customer Ratings
                  </span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-slate-400 transition-transform',
                    expandedFilters.includes('rating') && 'rotate-180'
                  )} />
                </button>
                {expandedFilters.includes('rating') && (
                  <div className="mt-3 space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">
                          {rating} <Star className="w-3 h-3 fill-current" />
                        </span>
                        <span className="text-sm text-slate-500">& above</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-1 min-w-0">
            {/* Category Header */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                    {category.name}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Showing {products.length} products
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 hidden sm:inline">Sort By</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-white focus:border-primary-400 focus:outline-none"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="rating">Customer Rating</option>
                    </select>
                  </div>

                  {/* Grid Toggle */}
                  <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setGridCols(3)}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        gridCols === 3 ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-400'
                      )}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGridCols(4)}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        gridCols === 4 ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-400'
                      )}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Applied Filters */}
              {(selectedSubcategory || showInStockOnly || priceRange[0] > 0 || priceRange[1] < 200000) && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-sm text-slate-500">Applied:</span>
                  {selectedSubcategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                      {category.subcategories?.find(s => s.slug === selectedSubcategory)?.name}
                      <button onClick={() => setSelectedSubcategory(null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {showInStockOnly && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                      In Stock
                      <button onClick={() => setShowInStockOnly(false)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className={cn(
                'grid gap-4',
                gridCols === 3 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              )}>
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">No products found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters</p>
                <Button variant="outline" onClick={() => {
                  setSelectedSubcategory(null);
                  setPriceRange([0, 200000]);
                  setShowInStockOnly(false);
                }}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Subcategories */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-white uppercase mb-3">
                    Category
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="mobile-subcategory"
                        checked={!selectedSubcategory}
                        onChange={() => setSelectedSubcategory(null)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-300">All</span>
                    </label>
                    {category.subcategories.map((sub) => (
                      <label key={sub.slug} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="mobile-subcategory"
                          checked={selectedSubcategory === sub.slug}
                          onChange={() => setSelectedSubcategory(sub.slug)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* In Stock Toggle */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800 dark:text-white">
                    In Stock Only
                  </span>
                  <input
                    type="checkbox"
                    checked={showInStockOnly}
                    onChange={(e) => setShowInStockOnly(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSelectedSubcategory(null);
                  setShowInStockOnly(false);
                }}
              >
                Clear All
              </Button>
              <Button className="flex-1" onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
