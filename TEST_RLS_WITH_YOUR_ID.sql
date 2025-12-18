-- Test RLS with your specific user ID

-- Step 1: Get your user ID
SELECT id, email FROM auth.users WHERE email = 'nanthini@thisaitech.com';

-- Step 2: Check if you're in admins table
SELECT * FROM admins WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'nanthini@thisaitech.com'
);

-- Step 3: Test the exact query the dashboard uses
-- This simulates what happens when YOU query as nanthini@thisaitech.com
SELECT
  total_amount,
  payment_status
FROM orders;

-- Step 4: Check all RLS policies on orders
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'orders';

-- Step 5: Try to see if RLS is even enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'orders';

-- If rowsecurity = true and you still can't see orders via app,
-- we may need to TEMPORARILY disable RLS for testing:
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
--
-- Then test the app, and if it works, re-enable:
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
