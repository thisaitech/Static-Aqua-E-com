-- ============================================
-- COMPLETE DATABASE SCHEMA FOR DYNAMIC E-COMMERCE
-- This makes the app fully data-driven from admin
-- ============================================

-- 1. CATEGORIES TABLE (Main categories for navbar and homepage)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT,
  description TEXT,
  icon VARCHAR(50), -- For storing icon name (e.g., 'fish', 'leaf', 'bird')
  
  -- Display settings
  is_active BOOLEAN DEFAULT true,
  show_in_hero BOOLEAN DEFAULT false, -- Show in hero carousel
  show_in_navbar BOOLEAN DEFAULT true, -- Show in navigation bar
  
  -- Subcategories as arrays (types and category from admin)
  types TEXT[] DEFAULT ARRAY[]::TEXT[], -- e.g., ['2 Feet Tanks', '3 Feet Tanks']
  category TEXT[] DEFAULT ARRAY[]::TEXT[], -- Additional categorization
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE (All products)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  
  -- Category relationship
  category VARCHAR(255) NOT NULL, -- Category ID from categories table
  type VARCHAR(255), -- Type/subcategory (from categories.types array)
  
  -- Product details
  description TEXT,
  image_url TEXT,
  
  -- Pricing
  contact_for_price BOOLEAN DEFAULT false,
  price DECIMAL(10, 2),
  mrp DECIMAL(10, 2), -- Maximum Retail Price
  original_price DECIMAL(10, 2),
  discount_percent INTEGER,
  
  -- Badges
  is_new BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  
  -- Stock management
  stock_status VARCHAR(50) DEFAULT 'in_stock', -- 'in_stock', 'out_of_stock', 'pre_order'
  quantity INTEGER DEFAULT 0,
  
  -- Rating
  rating DECIMAL(2, 1) DEFAULT 4.0,
  rating_count INTEGER DEFAULT 0,
  
  -- Display settings
  show_in_category BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HERO BANNERS TABLE (For hero carousel)
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  button_text VARCHAR(100),
  button_link VARCHAR(255),
  
  -- Display settings
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FILTER TYPES TABLE (Dynamic filters for category pages)
CREATE TABLE IF NOT EXISTS filter_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug VARCHAR(255) NOT NULL, -- Which category this filter belongs to
  filter_name VARCHAR(255) NOT NULL,
  
  -- Display settings
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USERS TABLE (Already exists, but ensuring it has proper fields)
-- This should already be managed by Supabase Auth, but we can extend it

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_navbar ON categories(show_in_navbar);
CREATE INDEX IF NOT EXISTS idx_categories_hero ON categories(show_in_hero);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);

CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE INDEX IF NOT EXISTS idx_hero_active ON hero_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_order ON hero_banners(display_order);

CREATE INDEX IF NOT EXISTS idx_filters_category ON filter_types(category_slug);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Categories: Read access to all, write access to authenticated admin
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated full access to categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Products: Read access to all active, write access to authenticated admin
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated full access to products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Hero Banners: Read access to all active, write access to authenticated
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active banners" ON hero_banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated full access to banners" ON hero_banners
  FOR ALL USING (auth.role() = 'authenticated');

-- Filter Types: Read access to all, write access to authenticated
ALTER TABLE filter_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to filters" ON filter_types
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to filters" ON filter_types
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample categories (you can customize this based on your needs)
INSERT INTO categories (name, slug, icon, show_in_hero, show_in_navbar, types, display_order) VALUES
('Fish Tanks & Aquascaping', 'fish-tanks', 'fish', true, true, ARRAY['2 Feet Tanks', '3 Feet Tanks', '4 Feet Tanks', '5+ Feet Tanks', 'Planted Open Tanks'], 1),
('Live Plants & ADA Products', 'live-plants', 'leaf', true, true, ARRAY['TC Live Plants', 'Cup Live Plants', 'ADA Fertilizers', 'Substrates & Sands'], 2),
('CO2, Lighting, Filtration, Air Pumps', 'equipment', 'zap', true, true, ARRAY['CO2 Systems', 'Aquarium Lights', 'Filters', 'Air Pumps'], 3),
('Live Fish & Shrimp', 'live-fish', 'waves', true, true, ARRAY['Fancy Koi', 'Fancy Guppies', 'Shrimps', 'Betta Fish'], 4),
('Fancy Birds', 'fancy-birds', 'bird', true, true, ARRAY['Lovebirds', 'Cockatiels', 'Budgerigars', 'Finches', 'Conures', 'Cockatoos'], 5),
('Bird Cages, Nests & Toys', 'bird-supplies', 'home', false, true, ARRAY['Bird Cages', 'Nests & Breeding Boxes', 'Toys & Perches', 'Bird Feeds'], 6),
('Foods & Medicines', 'foods-medicines', 'pill', false, true, ARRAY['Fish Foods', 'Bird Foods', 'Medicines', 'Supplements'], 7),
('Tank Accessories', 'tank-accessories', 'wrench', false, true, ARRAY['Decorations', 'Substrates', 'Tools', 'Maintenance'], 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FUNCTIONS & TRIGGERS (Auto-update timestamps)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_banners_updated_at BEFORE UPDATE ON hero_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
