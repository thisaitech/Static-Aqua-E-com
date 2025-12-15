-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active categories (for user website)
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Allow admins to view all categories (including inactive)
DROP POLICY IF EXISTS "Admins can view all categories" ON categories;
CREATE POLICY "Admins can view all categories" ON categories
  FOR SELECT USING (
    auth.jwt()->>'email' = 'nanthini@thisaitech.com'
  );

-- Allow admins to insert categories
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT WITH CHECK (
    auth.jwt()->>'email' = 'nanthini@thisaitech.com'
  );

-- Allow admins to update categories
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (
    auth.jwt()->>'email' = 'nanthini@thisaitech.com'
  );

-- Allow admins to delete categories
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (
    auth.jwt()->>'email' = 'nanthini@thisaitech.com'
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS trigger_update_categories_updated_at ON categories;
CREATE TRIGGER trigger_update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update products table to add category_id foreign key
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Temporarily disable RLS to insert data
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Delete existing data (if any)
DELETE FROM categories;

-- Insert existing categories from your user website
INSERT INTO categories (name, image_url, is_active, display_order) VALUES
  ('Fish Tanks', NULL, true, 1),
  ('Live Plants & ADA', NULL, true, 2),
  ('Live Plants', NULL, true, 3),
  ('CO2, Lighting, Filtration, Air Pumps', NULL, true, 4),
  ('Live Fish & Shrimp', NULL, true, 5),
  ('Live Fish', NULL, true, 6),
  ('Fancy Birds', NULL, true, 7),
  ('Bird Cages, Nests', NULL, true, 8),
  ('Foods', NULL, true, 9),
  ('Tank Accessories', NULL, true, 10),
  ('Accessories', NULL, true, 11);

-- Re-enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
