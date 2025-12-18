'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/data/products';
import { createClient } from '@/lib/supabase/client';
import { Search, Package } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchProducts(query);
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Search products by name, description, and category
      const searchTerm = `%${searchQuery}%`;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching products:', error);
        setProducts([]);
      } else {
        setProducts((data || []).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price || 0,
          originalPrice: p.mrp || undefined,
          image: p.image_url,
          category: p.category,
          description: p.description || undefined,
          rating: p.rating || 4.0,
          ratingCount: p.rating_count || 0,
          discountPercent: p.discount_percent || undefined,
          inStock: p.stock_status === 'in_stock',
          stockStatus: p.stock_status,
          stockQuantity: p.quantity ?? 0,
          isNew: p.is_new || false,
          isBestSeller: p.is_best_seller || false,
          contactForPrice: false,
          slug: p.slug,
          type: p.type,
          product_category: p.product_category
        })));
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-6 h-6 text-primary-500" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Search Results
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {query ? (
              <>
                Showing results for <span className="font-semibold text-primary-600 dark:text-primary-400">&quot;{query}&quot;</span>
              </>
            ) : (
              'Enter a search term to find products'
            )}
          </p>
          {!loading && products.length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Found {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Searching products...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && query && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-8 mb-6">
              <Package className="w-16 h-16 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              No products found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
              We couldn&apos;t find any products matching &quot;{query}&quot;. Try searching with different keywords or browse our categories.
            </p>
          </div>
        )}

        {/* No Search Query */}
        {!loading && !query && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-8 mb-6">
              <Search className="w-16 h-16 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              Start searching
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
              Use the search bar above to find fish tanks, plants, birds, and more.
            </p>
          </div>
        )}

        {/* Search Results */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
