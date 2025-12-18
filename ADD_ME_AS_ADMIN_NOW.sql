-- ════════════════════════════════════════════════════════════════
-- 🔐 ADD CURRENT USER AS ADMIN - Quick Fix
-- ════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to fix the 403 error
-- ════════════════════════════════════════════════════════════════

-- Step 1: Check who you are currently logged in as
SELECT
  auth.uid() as my_user_id,
  auth.email() as my_email;

-- Step 2: Check if you're already an admin
SELECT
  EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ) as am_i_admin;

-- Step 3: Add yourself as admin (if not already)
INSERT INTO admins (id, created_at)
VALUES (auth.uid(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify you're now an admin
SELECT
  u.id,
  u.email,
  a.created_at as admin_since
FROM auth.users u
INNER JOIN admins a ON u.id = a.id
WHERE u.id = auth.uid();

-- ════════════════════════════════════════════════════════════════
-- ✅ SUCCESS CHECK
-- ════════════════════════════════════════════════════════════════
-- If the query above returns a row, you're now an admin!
-- Now go back to your app and try generating the invoice again.
-- ════════════════════════════════════════════════════════════════

-- Optional: View all admins
SELECT
  u.email,
  a.created_at as admin_since
FROM admins a
INNER JOIN auth.users u ON a.id = u.id
ORDER BY a.created_at DESC;
