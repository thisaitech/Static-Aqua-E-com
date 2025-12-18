-- 🔍 Address Persistence - Database Verification Script
-- Run this in Supabase SQL Editor to verify setup

-- ═══════════════════════════════════════════════════════
-- 1. CHECK IF TABLE EXISTS
-- ═══════════════════════════════════════════════════════
SELECT
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_addresses'
  ) AS "user_addresses_table_exists";

-- Expected: true


-- ═══════════════════════════════════════════════════════
-- 2. CHECK TABLE STRUCTURE
-- ═══════════════════════════════════════════════════════
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_addresses'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid, NOT NULL)
-- user_id (uuid, NOT NULL)
-- full_name (text, NOT NULL)
-- phone (text, NOT NULL)
-- email (text, nullable)
-- address (text, NOT NULL)
-- city (text, NOT NULL)
-- district (text, NOT NULL)
-- pin_code (text, NOT NULL)
-- is_default (boolean, default false)
-- created_at (timestamp with time zone)
-- updated_at (timestamp with time zone)


-- ═══════════════════════════════════════════════════════
-- 3. CHECK RLS POLICIES
-- ═══════════════════════════════════════════════════════
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_addresses';

-- Expected 4 policies:
-- 1. Users can view their own addresses (SELECT)
-- 2. Users can insert their own addresses (INSERT)
-- 3. Users can update their own addresses (UPDATE)
-- 4. Users can delete their own addresses (DELETE)


-- ═══════════════════════════════════════════════════════
-- 4. CHECK INDEXES
-- ═══════════════════════════════════════════════════════
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_addresses';

-- Expected indexes:
-- 1. idx_user_addresses_user_id
-- 2. idx_user_addresses_default


-- ═══════════════════════════════════════════════════════
-- 5. CHECK TRIGGERS
-- ═══════════════════════════════════════════════════════
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_addresses';

-- Expected 3 triggers:
-- 1. ensure_single_default_address_trigger (BEFORE INSERT/UPDATE)
-- 2. set_first_address_as_default_trigger (BEFORE INSERT)
-- 3. update_user_addresses_updated_at (BEFORE UPDATE)


-- ═══════════════════════════════════════════════════════
-- 6. CHECK FOREIGN KEY ON ORDERS TABLE
-- ═══════════════════════════════════════════════════════
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'address_id';

-- Expected: address_id (uuid, nullable)


-- ═══════════════════════════════════════════════════════
-- 7. CHECK CURRENT USER ADDRESSES (for logged-in user)
-- ═══════════════════════════════════════════════════════
-- Note: This will only return data when run as authenticated user
SELECT
  id,
  full_name,
  address,
  city,
  district,
  pin_code,
  is_default,
  created_at
FROM user_addresses
ORDER BY is_default DESC, created_at DESC;

-- Expected: Your saved addresses (if any)


-- ═══════════════════════════════════════════════════════
-- 8. COUNT ADDRESSES PER USER
-- ═══════════════════════════════════════════════════════
-- Run as admin/service_role to see all users
SELECT
  user_id,
  COUNT(*) as address_count,
  SUM(CASE WHEN is_default THEN 1 ELSE 0 END) as default_count
FROM user_addresses
GROUP BY user_id;

-- Expected: Each user should have default_count = 0 or 1


-- ═══════════════════════════════════════════════════════
-- 9. VERIFY DEFAULT ADDRESS UNIQUENESS
-- ═══════════════════════════════════════════════════════
-- This should return 0 rows (no users with multiple defaults)
SELECT
  user_id,
  COUNT(*) as default_addresses
FROM user_addresses
WHERE is_default = true
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Expected: 0 rows (trigger ensures only 1 default per user)


-- ═══════════════════════════════════════════════════════
-- 10. CHECK ORDERS WITH ADDRESSES
-- ═══════════════════════════════════════════════════════
SELECT
  o.id as order_id,
  o.customer_name,
  o.total_amount,
  o.address_id,
  a.full_name as address_name,
  a.city,
  a.district
FROM orders o
LEFT JOIN user_addresses a ON o.address_id = a.id
ORDER BY o.created_at DESC
LIMIT 10;

-- Expected: Orders with linked addresses (if any orders exist)


-- ═══════════════════════════════════════════════════════
-- ✅ VERIFICATION CHECKLIST
-- ═══════════════════════════════════════════════════════
-- [ ] user_addresses table exists
-- [ ] All columns present with correct types
-- [ ] 4 RLS policies active
-- [ ] 2 indexes created
-- [ ] 3 triggers functioning
-- [ ] address_id column in orders table
-- [ ] No users with multiple default addresses
-- [ ] Addresses linked to orders correctly

-- ═══════════════════════════════════════════════════════
-- 🧪 MANUAL TEST QUERIES
-- ═══════════════════════════════════════════════════════

-- Test 1: Insert sample address (will auto-set as default if first)
-- Run as authenticated user in Supabase
/*
INSERT INTO user_addresses (
  user_id,
  full_name,
  phone,
  email,
  address,
  city,
  district,
  pin_code
) VALUES (
  auth.uid(),
  'Test User',
  '9876543210',
  'test@example.com',
  '123 Test Street',
  'Chennai',
  'Chennai',
  '600001'
) RETURNING *;
*/

-- Test 2: Insert 2nd address and verify only 1 default
/*
INSERT INTO user_addresses (
  user_id,
  full_name,
  phone,
  address,
  city,
  district,
  pin_code,
  is_default
) VALUES (
  auth.uid(),
  'Test User',
  '9876543210',
  '456 Office Street',
  'Coimbatore',
  'Coimbatore',
  '641001',
  true  -- This will make previous default = false
) RETURNING *;

-- Verify only 1 default
SELECT full_name, is_default
FROM user_addresses
WHERE user_id = auth.uid();
*/

-- ═══════════════════════════════════════════════════════
-- 🔧 TROUBLESHOOTING
-- ═══════════════════════════════════════════════════════

-- If table doesn't exist, run this:
-- \i create-user-addresses-table-final.sql

-- If RLS is not working:
-- ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- If triggers are missing, check:
-- SELECT * FROM pg_trigger WHERE tgname LIKE '%address%';

-- ═══════════════════════════════════════════════════════
-- END OF VERIFICATION SCRIPT
-- ═══════════════════════════════════════════════════════
