-- SIMPLEST FIX - Use JWT email directly (no table queries)

-- 1. Disable RLS on admins table
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 2. Fix PRODUCTS table
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can do everything" ON products;
DROP POLICY IF EXISTS "public_read_products" ON products;
DROP POLICY IF EXISTS "admin_all_products" ON products;
DROP POLICY IF EXISTS "public_view_products" ON products;
DROP POLICY IF EXISTS "admin_manage_products" ON products;

CREATE POLICY "public_view_products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_manage_products" ON products
  FOR ALL USING (auth.jwt()->>'email' = 'nanthini@thisaitech.com');

-- 3. Fix CATEGORIES table
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON categories;
DROP POLICY IF EXISTS "Admin can view all categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admin can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admin can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON categories;
DROP POLICY IF EXISTS "public_read_active" ON categories;
DROP POLICY IF EXISTS "admin_read_all" ON categories;
DROP POLICY IF EXISTS "admin_insert" ON categories;
DROP POLICY IF EXISTS "admin_update" ON categories;
DROP POLICY IF EXISTS "admin_delete" ON categories;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
DROP POLICY IF EXISTS "admin_all_categories" ON categories;
DROP POLICY IF EXISTS "public_view_categories" ON categories;
DROP POLICY IF EXISTS "admin_manage_categories" ON categories;

CREATE POLICY "public_view_categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_manage_categories" ON categories
  FOR ALL USING (auth.jwt()->>'email' = 'nanthini@thisaitech.com');
