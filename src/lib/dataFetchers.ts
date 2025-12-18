/**
 * Data Fetching Utilities for Dynamic E-Commerce
 * This file provides functions to fetch data from Supabase
 * while maintaining the same interface as the old hardcoded data
 */

import { createClient } from '@/lib/supabase/client';

// ============================================
// TYPES (matching existing interfaces)
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  icon?: string;
  subcategories?: { name: string; slug: string }[];
  types?: string[];
  category?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  type?: string;
  image: string;
  description: string;
  inStock: boolean;
  stockStatus?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  contactForPrice?: boolean;
  rating?: number;
  ratingCount?: number;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================

/**
 * Fetch all active categories
 * Used in: Header (navbar), Homepage (category cards)
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Transform to match existing Category interface
  return (data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image_url || '',
    description: cat.description || '',
    icon: cat.icon,
    types: cat.types || [],
    category: cat.category || [],
    subcategories: (cat.types || []).map((type: string) => ({
      name: type,
      slug: type.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))
  }));
}

/**
 * Fetch categories that should appear in navbar
 */
export async function getNavbarCategories(): Promise<Category[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .eq('show_in_navbar', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching navbar categories:', error);
    return [];
  }

  return (data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image_url || '',
    description: cat.description || '',
    icon: cat.icon,
    types: cat.types || [],
    subcategories: (cat.types || []).map((type: string) => ({
      name: type,
      slug: type.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))
  }));
}

/**
 * Fetch categories that should appear in hero section
 */
export async function getHeroCategories(): Promise<Category[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .eq('show_in_hero', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching hero categories:', error);
    return [];
  }

  return (data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image_url || '',
    description: cat.description || '',
    icon: cat.icon,
    types: cat.types || []
  }));
}

/**
 * Fetch single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('Error fetching category:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    image: data.image_url || '',
    description: data.description || '',
    icon: data.icon,
    types: data.types || [],
    category: data.category || [],
    subcategories: (data.types || []).map((type: string) => ({
      name: type,
      slug: type.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))
  };
}

// ============================================
// PRODUCT FUNCTIONS
// ============================================

/**
 * Fetch all active products
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(transformProduct);
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = createClient();
  
  // First get the category ID
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return (data || []).map(transformProduct);
}

/**
 * Fetch products by category and subcategory/type
 */
export async function getProductsBySubcategory(categorySlug: string, subcategorySlug: string): Promise<Product[]> {
  const supabase = createClient();
  
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];

  // Find the actual type name from slug
  const type = category.types?.find(t => 
    t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === subcategorySlug
  );

  if (!type) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category.id)
    .eq('type', type)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching products by subcategory:', error);
    return [];
  }

  return (data || []).map(transformProduct);
}

/**
 * Fetch featured products
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(8);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return (data || []).map(transformProduct);
}

/**
 * Fetch new arrivals
 */
export async function getNewProducts(): Promise<Product[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching new products:', error);
    return [];
  }

  return (data || []).map(transformProduct);
}

/**
 * Fetch best sellers
 */
export async function getBestSellers(): Promise<Product[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_best_seller', true)
    .order('display_order', { ascending: true })
    .limit(8);

  if (error) {
    console.error('Error fetching best sellers:', error);
    return [];
  }

  return (data || []).map(transformProduct);
}

/**
 * Fetch single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('Error fetching product:', error);
    return null;
  }

  return transformProduct(data);
}

// ============================================
// HERO BANNER FUNCTIONS
// ============================================

/**
 * Fetch active hero banners
 */
export async function getHeroBanners(): Promise<HeroBanner[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching hero banners:', error);
    return [];
  }

  return data || [];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transform database product to app Product interface
 */
function transformProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.contact_for_price ? 0 : (dbProduct.price || 0),
    originalPrice: dbProduct.original_price || dbProduct.mrp,
    category: dbProduct.category,
    subcategory: dbProduct.type,
    type: dbProduct.type,
    image: dbProduct.image_url || '',
    description: dbProduct.description || '',
    inStock: dbProduct.stock_status === 'in_stock',
    stockStatus: dbProduct.stock_status,
    isNew: dbProduct.is_new || false,
    isBestSeller: dbProduct.is_best_seller || false,
    isFeatured: dbProduct.is_featured || false,
    contactForPrice: dbProduct.contact_for_price || false,
    rating: dbProduct.rating || 4.0,
    ratingCount: dbProduct.rating_count || 0
  };
}

/**
 * Cache categories for performance (optional)
 */
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCategoriesCached(): Promise<Category[]> {
  const now = Date.now();
  
  if (categoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return categoriesCache;
  }
  
  categoriesCache = await getCategories();
  cacheTimestamp = now;
  
  return categoriesCache;
}

/**
 * Clear categories cache (call when admin updates categories)
 */
export function clearCategoriesCache() {
  categoriesCache = null;
  cacheTimestamp = 0;
}
