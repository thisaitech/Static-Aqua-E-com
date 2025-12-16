-- Fix Top Deals RLS Policies
-- Run this in your Supabase SQL Editor

-- Step 1: Drop all existing policies on top_deals
DROP POLICY IF EXISTS "Anyone can view active top deals" ON top_deals;
DROP POLICY IF EXISTS "Admins can view all top deals" ON top_deals;
DROP POLICY IF EXISTS "Admins can insert top deals" ON top_deals;
DROP POLICY IF EXISTS "Admins can update top deals" ON top_deals;
DROP POLICY IF EXISTS "Admins can delete top deals" ON top_deals;
DROP POLICY IF EXISTS "public_view_active_deals" ON top_deals;
DROP POLICY IF EXISTS "admins_all_access" ON top_deals;

-- Step 2: Create new simplified policies

-- Public can view active deals
CREATE POLICY "public_view_active_deals" ON top_deals
  FOR SELECT
  USING (is_active = true);

-- Admins can do everything (SELECT, INSERT, UPDATE, DELETE)
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

-- Step 3: Verify you are in the admins table
-- Check your user ID and admin status
SELECT
  auth.uid() as "Your User ID",
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) as "Are You Admin?";

-- Step 4: If you're not an admin, add yourself
-- IMPORTANT: Replace 'your-email@example.com' with your actual email
-- Uncomment the lines below and replace the email:

-- INSERT INTO admins (id, email, role)
-- SELECT auth.uid(), 'your-email@example.com', 'admin'
-- WHERE NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());

-- Step 5: Verify policies are correctly set
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'top_deals';
