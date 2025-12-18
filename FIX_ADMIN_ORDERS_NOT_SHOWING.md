# Fix: Admin Orders Not Showing (Total Orders: 0)

## Issue
Admin panel shows "Total Orders: 0" and "No Orders Yet" even though Supabase has 4 orders.

## Root Cause
API authentication or admin check is failing, preventing orders from being fetched.

---

## Fix Applied ✅

### 1. Fixed createClient() Call
**File:** [src/app/api/orders/route.ts](src/app/api/orders/route.ts:7)

**Before (WRONG):**
```typescript
const supabase = await createClient(); // ❌ createClient is not async!
```

**After (CORRECT):**
```typescript
const supabase = createClient(); // ✅ No await needed
```

**Why:** The `createClient()` function from `@/lib/supabase/server` is synchronous, not async. Using `await` on it could cause unexpected behavior.

---

## Debugging Steps

### Step 1: Check Browser Console

1. Open **Developer Tools** (F12)
2. Go to **Console** tab
3. Look for errors when visiting `/admin/orders`

**Expected logs:**
```
Fetching orders for user: <uuid>
Is admin: true
Fetched 4 orders from Supabase
```

**If you see:**
- `Auth error`: Not logged in → Login first
- `Is admin: false`: User is not admin → Add to admins table
- `Fetched 0 orders`: Check Supabase data

---

### Step 2: Check Network Tab

1. Open **Developer Tools** (F12)
2. Go to **Network** tab
3. Refresh the page
4. Find the request to `/api/orders`
5. Click on it → **Response** tab

**Check the response:**

**✅ Success (200 OK):**
```json
{
  "orders": [
    { "id": "...", "customer_name": "...", ... },
    { "id": "...", "customer_name": "...", ... },
    ...
  ],
  "isAdmin": true
}
```

**❌ Error (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```
→ **Solution:** Login to admin account

**❌ Empty orders (200 OK but empty):**
```json
{
  "orders": [],
  "isAdmin": false
}
```
→ **Solution:** User is not in admins table

---

### Step 3: Verify Admin Access in Supabase

Run [check-admin-and-orders.sql](check-admin-and-orders.sql) in Supabase SQL Editor:

```sql
-- 1. Check if you're admin
SELECT
  u.id,
  u.email,
  CASE
    WHEN a.id IS NOT NULL THEN 'Admin'
    ELSE 'Regular User'
  END as user_type
FROM auth.users u
LEFT JOIN admins a ON u.id = a.id
WHERE u.email = 'your-email@example.com';  -- UPDATE WITH YOUR EMAIL!
```

**Expected result:**
| id | email | user_type |
|----|-------|-----------|
| abc-123 | you@example.com | **Admin** |

**If it shows "Regular User":**
You need to add yourself to the admins table:

```sql
-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Add to admins table (replace with your ID)
INSERT INTO admins (id, created_at)
VALUES ('your-user-id-here', NOW())
ON CONFLICT (id) DO NOTHING;
```

---

### Step 4: Verify Orders Exist

```sql
SELECT
  id,
  customer_name,
  customer_email,
  total_amount,
  created_at
FROM orders
ORDER BY created_at DESC;
```

**Expected:** 4 rows showing your orders

**If 0 rows:** Orders table is empty → Place a test order first

---

## Common Issues & Solutions

### Issue 1: Not Logged In
**Symptom:** Network tab shows 401 Unauthorized

**Solution:**
1. Go to `/admin` login page
2. Login with admin credentials
3. Refresh `/admin/orders`

---

### Issue 2: Logged In But Not Admin
**Symptom:**
- Network shows `"isAdmin": false`
- Orders array is empty

**Solution:** Add yourself to admins table

```sql
-- Check your user ID
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Add to admins
INSERT INTO admins (id, created_at)
VALUES ('your-id-from-above', NOW());
```

---

### Issue 3: RLS Policy Blocking
**Symptom:**
- `isAdmin: true`
- But `orders: []`
- Supabase has orders

**Check RLS policies:**
```sql
-- View current policies
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

**The policy should be:**
```sql
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );
```

**If policy is missing, recreate it:**
```sql
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );
```

---

## Testing Checklist

After applying the fix:

- [ ] Refresh the page
- [ ] Check browser console for logs
- [ ] Check network tab for API response
- [ ] Verify `isAdmin: true` in response
- [ ] Verify orders array has 4 items
- [ ] Orders should now display in admin panel

---

## Quick Test

1. **Open browser console** (F12)
2. **Go to** `/admin/orders`
3. **Look for these logs:**
   ```
   Fetching orders for user: <uuid>
   Is admin: true
   Fetched 4 orders from Supabase
   ```
4. **Page should show:** "Total Orders: 4" with order cards

---

## If Still Not Working

Share these details:

1. **Browser console logs** (screenshot)
2. **Network tab response** for `/api/orders` (screenshot)
3. **Result of this SQL query:**
   ```sql
   SELECT COUNT(*) FROM admins WHERE id = auth.uid();
   SELECT COUNT(*) FROM orders;
   ```

This will help pinpoint the exact issue! 🔍
