-- TEMPORARY: Disable RLS to test if app works
-- We'll re-enable it after confirming the app code is correct

-- Step 1: Disable RLS on orders table
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'orders';
-- rowsecurity should now be FALSE

-- Step 3: Test query (should return all 3 orders)
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_orders,
  SUM(CASE WHEN payment_status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
FROM orders;

-- NOW GO TO YOUR APP AND REFRESH THE DASHBOARD
-- If the orders appear (3 orders, ₹7,232), then RLS was the issue
-- If they still don't appear, there's a different problem

-- After testing, RE-ENABLE RLS with this command:
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
