-- Diagnose and Fix Top Deals RLS Policy Issue

-- Step 1: Check if you're logged in and if you're an admin
SELECT 
  auth.uid() as "Your User ID",
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) as "Are You Admin?";

-- Step 2: See all admins in the table
SELECT id, email, created_at FROM admins;

-- Step 3: If you're not in admins table, add yourself
-- Replace 'your-email@example.com' with your actual email
-- INSERT INTO admins (id, email, role)
-- SELECT auth.uid(), 'your-email@example.com', 'admin'
-- WHERE NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());

-- Step 4: Drop all existing policies on top_deals
DROP POLICY IF EXISTS "Anyone can view active top deals" ON top_deals;
DROP POLICY IF EXISTS "Admins can view all top deals" ON top_deals;
DROP POLICY IF EXISTS "Admins can insert top deals" ON top_deals;
DROP POLICY IF EXISTS "Admins can update top deals" ON top_deals;
DROP POLICY IF EXISTS "Admins can delete top deals" ON top_deals;

-- Step 5: Create new simplified policies

-- Public can view active deals
CREATE POLICY "public_view_active_deals" ON top_deals
  FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "admins_all_access" ON top_deals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Step 6: Verify policies are active
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'top_deals';

-- Step 7: Test if you can insert
-- This should work if you're an admin
-- INSERT INTO top_deals (title, discount, image_url, category_slug, icon_name, bg_color, display_order)
-- VALUES ('Test Deal', 'Test Offer', 'https://via.placeholder.com/400x300', 'fish-tanks', 'fish', 'from-blue-600 to-blue-700', 99);
