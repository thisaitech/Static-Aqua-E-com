-- Fix Admin Access to Orders Table
-- This allows admins to view all orders in the dashboard

-- Step 1: Check current user and their admin status
SELECT
  auth.uid() as current_user_id,
  auth.email() as current_email;

-- Step 2: Check if you are an admin
SELECT
  EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ) as am_i_admin;

-- Step 3: Drop existing SELECT policy on orders table
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Users and admins can view orders" ON orders;

-- Step 4: Create new SELECT policy that allows:
--   a) Users to view their own orders
--   b) Admins to view ALL orders
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

-- Step 5: Verify the policy was created
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'orders'
  AND cmd = 'SELECT';

-- Step 6: Test by counting orders
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_orders,
  SUM(CASE WHEN payment_status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
FROM orders;

-- If the above query returns data, the fix worked!
