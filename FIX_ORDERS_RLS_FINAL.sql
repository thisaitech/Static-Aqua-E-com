-- FINAL FIX: Remove all conflicting RLS policies and create one clean policy

-- Step 1: Drop ALL existing SELECT policies on orders table
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users and admins can view orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;

-- Step 2: Verify all SELECT policies are gone
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'orders' AND cmd = 'SELECT';
-- This should return NO rows

-- Step 3: Make sure you're in the admins table
INSERT INTO admins (id, created_at)
VALUES (auth.uid(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify you're in admins
SELECT id FROM admins WHERE id = auth.uid();

-- Step 5: Create ONE single clean policy for SELECT
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

-- Step 6: Verify only ONE SELECT policy exists now
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'orders' AND cmd = 'SELECT';
-- This should return EXACTLY 1 row

-- Step 7: Test if you can see orders now
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_orders,
  SUM(CASE WHEN payment_status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
FROM orders;
-- This should show: total_orders=3, completed_orders=3, total_revenue=7232

-- SUCCESS! If Step 7 shows the data, the fix worked!
