-- ============================================
-- COMPLETE FIX FOR PAYMENT STATUS ISSUE
-- Run this in Supabase SQL Editor
-- ============================================

-- PART 1: Check Current State
-- ============================================

-- 1.1 Check RLS status on orders table
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'orders';

-- 1.2 Check existing policies
SELECT
  policyname,
  cmd as command,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'orders';

-- 1.3 Check recent orders with pending status but have payment IDs
SELECT
  id,
  user_id,
  customer_name,
  payment_status,
  order_status,
  razorpay_payment_id,
  created_at
FROM orders
WHERE payment_status = 'pending'
  AND razorpay_payment_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;


-- PART 2: Fix RLS Policies
-- ============================================

-- 2.1 Drop existing problematic update policies
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "System can update order status" ON orders;
DROP POLICY IF EXISTS "Users and system can update orders" ON orders;

-- 2.2 Create comprehensive UPDATE policy
-- This allows both users and the authenticated system to update orders
CREATE POLICY "Allow order updates"
  ON orders
  FOR UPDATE
  USING (
    -- User can update their own orders
    auth.uid() = user_id
    OR
    -- Authenticated requests can update orders (for payment verification)
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    -- Same condition for the check
    auth.uid() = user_id
    OR
    auth.uid() IS NOT NULL
  );

-- 2.3 If the above doesn't work, use this more permissive policy
-- (Comment out the above and uncomment this if needed)
/*
DROP POLICY IF EXISTS "Allow order updates" ON orders;

CREATE POLICY "Allow authenticated order updates"
  ON orders
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
*/


-- PART 3: Fix Existing Pending Orders
-- ============================================

-- 3.1 Update all orders that have successful payments but stuck in pending
UPDATE orders
SET
  payment_status = 'completed',
  order_status = 'confirmed',
  updated_at = NOW()
WHERE payment_status = 'pending'
  AND razorpay_payment_id IS NOT NULL
  AND razorpay_payment_id != '';

-- 3.2 Verify the update worked
SELECT
  id,
  customer_name,
  payment_status,
  order_status,
  razorpay_payment_id,
  created_at
FROM orders
WHERE razorpay_payment_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;


-- PART 4: Verification
-- ============================================

-- 4.1 Check if policies are correct now
SELECT
  policyname,
  cmd,
  qual as policy_condition
FROM pg_policies
WHERE tablename = 'orders'
  AND cmd = 'UPDATE';

-- 4.2 Count orders by status
SELECT
  payment_status,
  COUNT(*) as count
FROM orders
GROUP BY payment_status;


-- PART 5: Nuclear Option (Only if above doesn't work)
-- ============================================
-- This completely removes RLS temporarily for testing
-- DO NOT use in production without re-enabling RLS!

-- Uncomment ONLY if you want to temporarily disable RLS:
/*
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable it:
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
*/


-- PART 6: Alternative Service Role Approach
-- ============================================
-- If the issue persists, it means the API needs to use service role
-- This requires code changes (see instructions below)

/*
The API route needs to use createClient with service role:

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

This bypasses RLS entirely and allows the API to update any order.
*/


-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Run PART 1 to see current state
-- 2. Run PART 2 to fix RLS policies
-- 3. Run PART 3 to fix existing pending orders
-- 4. Run PART 4 to verify the fix
-- 5. If still not working, check PART 6 notes
-- ============================================
