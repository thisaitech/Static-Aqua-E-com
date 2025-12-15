-- FIX ADMINS TABLE RLS POLICIES (to prevent infinite recursion)
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Anyone can view admins" ON admins;

-- Simple policy: Only the specific admin can view admins table
CREATE POLICY "Admin email can view admins" ON admins
  FOR SELECT USING (email = 'nanthini@thisaitech.com');

-- NOW FIX CATEGORIES TABLE
-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

-- Public can view active categories
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Admin (by email) can view ALL categories
CREATE POLICY "Admin can view all categories" ON categories
  FOR SELECT USING (auth.jwt()->>'email' = 'nanthini@thisaitech.com');

-- Admin can insert categories  
CREATE POLICY "Admin can insert categories" ON categories
  FOR INSERT WITH CHECK (auth.jwt()->>'email' = 'nanthini@thisaitech.com');

-- Admin can update categories
CREATE POLICY "Admin can update categories" ON categories
  FOR UPDATE USING (auth.jwt()->>'email' = 'nanthini@thisaitech.com');

-- Admin can delete categories
CREATE POLICY "Admin can delete categories" ON categories
  FOR DELETE USING (auth.jwt()->>'email' = 'nanthini@thisaitech.com');

-- Insert categories if they don't exist
INSERT INTO categories (name, image_url, is_active, display_order) 
SELECT * FROM (VALUES
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
  ('Accessories', NULL, true, 11)
) AS v(name, image_url, is_active, display_order)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories.name = v.name);
