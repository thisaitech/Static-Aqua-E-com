-- FINAL FIX: Remove the conflicting "Users can view own orders" policy

-- Step 1: Check what SELECT policies currently exist
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'orders' AND cmd = 'SELECT';

-- Step 2: Drop the old conflicting policy
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Step 3: Verify it's gone
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'orders' AND cmd = 'SELECT';
-- Should only show "Users and admins can view orders"

-- Step 4: Test the query that the dashboard uses
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_orders,
  SUM(CASE WHEN payment_status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
FROM orders;
-- Should show: 3, 3, 7232

-- Step 5: Verify you're an admin
SELECT * FROM admins WHERE email = 'nanthini@thisaitech.com';

-- SUCCESS!
-- After running this:
-- 1. Close all browser tabs of your app
-- 2. Open a new tab and go to your app
-- 3. Login again
-- 4. Go to /admin/dashboard
-- 5. Hard refresh (Ctrl + Shift + R)
