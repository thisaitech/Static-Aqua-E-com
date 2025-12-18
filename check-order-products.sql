-- Check how products are being stored in orders table
-- Run this in Supabase SQL Editor to debug

-- 1. Check the most recent orders and their products
SELECT
  id,
  customer_name,
  created_at,
  products,
  jsonb_array_length(products) as product_count,
  total_amount
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check if any orders have empty or single products
SELECT
  id,
  customer_name,
  created_at,
  jsonb_array_length(products) as product_count,
  products
FROM orders
WHERE jsonb_array_length(products) < 2
ORDER BY created_at DESC
LIMIT 10;

-- 3. View the actual product data structure
SELECT
  id,
  customer_name,
  jsonb_pretty(products) as products_formatted,
  jsonb_array_length(products) as product_count
FROM orders
ORDER BY created_at DESC
LIMIT 3;

-- 4. Check if products column is properly JSONB
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name = 'products';
