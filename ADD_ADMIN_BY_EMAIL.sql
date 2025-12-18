-- ════════════════════════════════════════════════════════════════
-- 🔐 ADD ADMIN BY EMAIL - Works Without Auth Context
-- ════════════════════════════════════════════════════════════════
-- This script adds a user as admin using their email address
-- Run this in Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════

-- Step 1: First, let's see all users in your system
SELECT
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- ════════════════════════════════════════════════════════════════
-- Step 2: Add user as admin by email
-- ════════════════════════════════════════════════════════════════
-- REPLACE 'your-email@example.com' with your actual email below

INSERT INTO admins (id, created_at)
SELECT id, NOW()
FROM auth.users
WHERE email = 'nanthini@thisaitech.com'  -- ⚠️ CHANGE THIS to your email
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- Step 3: Verify the admin was added
-- ════════════════════════════════════════════════════════════════

SELECT
  u.id,
  u.email,
  a.created_at as admin_since
FROM admins a
JOIN auth.users u ON a.id = u.id
WHERE u.email = 'nanthini@thisaitech.com';  -- ⚠️ CHANGE THIS to your email

-- ════════════════════════════════════════════════════════════════
-- Step 4: View all current admins
-- ════════════════════════════════════════════════════════════════

SELECT
  u.email,
  u.created_at as user_since,
  a.created_at as admin_since
FROM admins a
JOIN auth.users u ON a.id = u.id
ORDER BY a.created_at DESC;

-- ════════════════════════════════════════════════════════════════
-- ✅ SUCCESS INDICATORS
-- ════════════════════════════════════════════════════════════════
-- After running this script:
-- 1. Step 3 should return 1 row with your email
-- 2. Step 4 should show you in the list of admins
-- 3. Now go back to your app and try generating the invoice!
-- ════════════════════════════════════════════════════════════════
