-- Check and fix Orders table RLS policies
-- This might be blocking the payment status update

-- 1. Check current RLS policies on orders table
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
WHERE tablename = 'orders';

-- 2. Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'orders';

-- 3. Check a recent order to see what user_id it has
SELECT
  id,
  user_id,
  customer_name,
  payment_status,
  order_status,
  razorpay_payment_id,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 3;

-- 4. If RLS is blocking updates, we need to allow system updates
-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "System can update order status" ON orders;

-- 5. Create new update policy that allows:
--    a) Users to update their own orders
--    b) Service role (API) to update any order
CREATE POLICY "Users and system can update orders"
  ON orders
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

-- 6. Alternative: Temporarily disable RLS for testing
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- 7. Verify the new policy
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'orders'
  AND cmd = 'UPDATE';

-- 8. Test: Try to update a pending order manually
-- (Replace the order ID with your actual pending order ID)
/*
UPDATE orders
SET
  payment_status = 'completed',
  order_status = 'confirmed'
WHERE id = 'YOUR-ORDER-ID-HERE'
  AND razorpay_payment_id IS NOT NULL;
*/
