-- Add nanthini@thisaitech.com as admin
-- Run this in Supabase SQL Editor

-- Step 1: Find the user ID for nanthini@thisaitech.com
SELECT id, email, created_at
FROM auth.users
WHERE email = 'nanthini@thisaitech.com';

-- Step 2: Add to admins table
-- Copy the ID from Step 1 result and use it below
-- OR use this combined query that does it automatically:

INSERT INTO admins (id, created_at)
SELECT id, NOW()
FROM auth.users
WHERE email = 'nanthini@thisaitech.com'
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify admin was added
SELECT
  u.id,
  u.email,
  a.created_at as admin_since
FROM auth.users u
INNER JOIN admins a ON u.id = a.id
WHERE u.email = 'nanthini@thisaitech.com';

-- Step 4: Check all admins
SELECT
  u.email,
  a.created_at as admin_since
FROM admins a
INNER JOIN auth.users u ON a.id = u.id
ORDER BY a.created_at DESC;
