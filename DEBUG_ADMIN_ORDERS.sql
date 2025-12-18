-- Debug why admin can't see orders in the app

-- Step 1: Check your current user ID
SELECT
  auth.uid() as my_user_id,
  auth.email() as my_email;

-- Step 2: Check if you're in the admins table (by ID)
SELECT * FROM admins WHERE id = auth.uid();

-- Step 3: Check all records in admins table
SELECT * FROM admins;

-- Step 4: Check if the orders table has any data
SELECT
  id,
  user_id,
  customer_name,
  total_amount,
  payment_status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- Step 5: Test if you can see orders with current RLS policy
SELECT COUNT(*) as orders_i_can_see FROM orders;

-- Step 6: Check the exact RLS policy
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'orders';
