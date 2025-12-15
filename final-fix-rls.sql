-- STEP 1: Fix admins table - remove ALL RLS policies causing recursion
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- STEP 2: Fix categories table RLS  
-- Drop all existing category policies
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON categories;
DROP POLICY IF EXISTS "Admin can view all categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admin can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admin can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON categories;

-- Create clean policies for categories
-- 1. Public can see active categories
CREATE POLICY "public_read_active" ON categories
  FOR SELECT 
  USING (is_active = true);

-- 2. Admin can see ALL categories (including inactive)
CREATE POLICY "admin_read_all" ON categories
  FOR SELECT 
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nanthini@thisaitech.com'
  );

-- 3. Admin can insert
CREATE POLICY "admin_insert" ON categories
  FOR INSERT 
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nanthini@thisaitech.com'
  );

-- 4. Admin can update
CREATE POLICY "admin_update" ON categories
  FOR UPDATE 
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nanthini@thisaitech.com'
  );

-- 5. Admin can delete
CREATE POLICY "admin_delete" ON categories
  FOR DELETE 
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nanthini@thisaitech.com'
  );
