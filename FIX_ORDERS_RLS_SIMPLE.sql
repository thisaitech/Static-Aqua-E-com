-- SIMPLE FIX: Clean up RLS policies without requiring auth context

-- Step 1: Drop ALL existing SELECT policies on orders table
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users and admins can view orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;

-- Step 2: Verify all SELECT policies are gone
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'orders' AND cmd = 'SELECT';
-- This should return NO rows (or 0 rows)

-- Step 3: Create ONE single clean policy for SELECT
CREATE POLICY "Users and admins can view orders"
  ON orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Step 4: Verify only ONE SELECT policy exists now
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'orders' AND cmd = 'SELECT';
-- This should return EXACTLY 1 row

-- Step 5: Check your admin email in admins table
-- Replace 'nanthini@thisaitech.com' with your actual email if different
SELECT
  u.id,
  u.email,
  a.id as admin_id,
  CASE WHEN a.id IS NOT NULL THEN 'YES - You are an admin' ELSE 'NO - Not in admins table' END as admin_status
FROM auth.users u
LEFT JOIN admins a ON u.id = a.id
WHERE u.email = 'nanthini@thisaitech.com';

-- Step 6: If Step 5 shows "NO", run this to add yourself as admin:
-- IMPORTANT: Replace 'YOUR-USER-ID-FROM-STEP-5' with the actual ID from Step 5
/*
INSERT INTO admins (id, created_at)
VALUES ('YOUR-USER-ID-FROM-STEP-5', NOW())
ON CONFLICT (id) DO NOTHING;
*/

-- Step 7: After adding yourself as admin, verify again
SELECT
  u.id,
  u.email,
  a.created_at as admin_since
FROM auth.users u
INNER JOIN admins a ON u.id = a.id
WHERE u.email = 'nanthini@thisaitech.com';

-- SUCCESS!
-- Now logout and login again in your app, then refresh the dashboard.
