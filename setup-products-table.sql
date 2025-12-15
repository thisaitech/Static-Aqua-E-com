-- Complete products table schema for user product card requirements
-- To add new columns to existing table, use ALTER TABLE ADD COLUMN IF NOT EXISTS
-- Or DROP TABLE products CASCADE; and run this to recreate

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type_id UUID REFERENCES category_types(id) ON DELETE SET NULL,
  
  -- Images
  image_url TEXT,
  gallery_images TEXT[], -- Array for future multiple images
  
  -- Pricing
  contact_for_price BOOLEAN DEFAULT false,
  price DECIMAL(10, 2),
  mrp DECIMAL(10, 2),
  discount_percent INTEGER DEFAULT 0,
  
  -- Badges
  is_new BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  
  -- Stock
  stock_status TEXT DEFAULT 'in_stock', -- 'in_stock', 'out_of_stock', 'low_stock'
  quantity INTEGER DEFAULT 0,
  
  -- Rating
  rating DECIMAL(2, 1) DEFAULT 4.0,
  rating_count INTEGER DEFAULT 0,
  
  -- Display Control
  show_in_category BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Button Type
  button_type TEXT DEFAULT 'add_to_cart', -- 'add_to_cart', 'contact_store'
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for user website)
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Allow admins full access (using JWT to avoid recursion)
DROP POLICY IF EXISTS "Admins can do everything" ON products;
CREATE POLICY "Admins can do everything" ON products
  FOR ALL USING (auth.jwt()->>'email' = 'nanthini@thisaitech.com');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_type_id ON products(type_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);

-- Note: Old offer_type/offer_value fields removed in favor of:
-- discount_percent, price, mrp for clearer pricing logic

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_updated_at ON products;
CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
