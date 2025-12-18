# Admin Orders - Complete Setup & Verification Guide

## What Admin Orders Should Show

The admin panel at `/admin/orders` should display:

✅ **All orders from ALL users** (not just admin's own orders)
✅ **Order details:**
- Order ID
- Customer name, email, phone
- Shipping address
- Products list with quantities
- Subtotal, shipping charge, total amount
- Payment status (pending/completed/failed)
- Payment method (razorpay/cod)
- Order status (placed/packed/shipped/delivered/cancelled)
- Created date/time

---

## Current Setup ✅

### 1. Database Structure (Already Correct)
```
orders table:
- id (UUID, primary key)
- user_id (UUID, references auth.users)
- customer_name, customer_email, customer_phone
- shipping_address, shipping_city, shipping_state, shipping_pincode
- products (JSONB array)
- subtotal, shipping_charge, total_amount
- payment_method, payment_status
- razorpay_order_id, razorpay_payment_id
- order_status
- created_at, updated_at
```

### 2. API Route (Already Correct)
**File:** [src/app/api/orders/route.ts](src/app/api/orders/route.ts)

**Logic:**
```typescript
// For admins: Return ALL orders
if (adminData) {
  return all orders from orders table
}

// For regular users: Return only their orders
else {
  return orders WHERE user_id = current_user.id
}
```

### 3. Admin Page (Already Correct)
**File:** [src/app/admin/orders/page.tsx](src/app/admin/orders/page.tsx)

**Features:**
- Fetches all orders via `/api/orders`
- Displays order cards with summary
- Modal with full order details
- Update order status
- Generate/download invoices

---

## Setup Steps

### Step 1: Add User as Admin

**Run in Supabase SQL Editor:**

```sql
-- Add nanthini@thisaitech.com as admin
INSERT INTO admins (id, created_at)
SELECT id, NOW()
FROM auth.users
WHERE email = 'nanthini@thisaitech.com'
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT u.email, a.created_at as admin_since
FROM admins a
INNER JOIN auth.users u ON a.id = u.id
WHERE u.email = 'nanthini@thisaitech.com';
```

**Expected result:**
```
email                    | admin_since
-------------------------|-------------------
nanthini@thisaitech.com | 2025-01-17 ...
```

---

### Step 2: Verify Database Has Orders

```sql
-- Check all orders
SELECT
  id,
  user_id,
  customer_name,
  customer_email,
  total_amount,
  payment_status,
  order_status,
  created_at
FROM orders
ORDER BY created_at DESC;
```

**Expected:** Should show 4 orders (or however many you have)

---

### Step 3: Test Admin Access

1. **Login as admin** (`nanthini@thisaitech.com`)
2. **Go to** `/admin/orders`
3. **Open browser console** (F12)
4. **Look for these logs:**

```
Admin page: Fetching orders from API...
Admin page: API response status: 200
Admin page: API response data: { orders: [...], isAdmin: true }
Admin page: Received 4 orders
Admin page: isAdmin = true
```

**Then on the server terminal:**

```
Fetching orders for user: <uuid>
Is admin: true
Fetched 4 orders from Supabase
```

---

## Troubleshooting

### Issue 1: "Total Orders: 0" or "No Orders Yet"

**Check browser console for:**

#### A) Status 401 Unauthorized
```
Admin page: API response status: 401
Admin page: API response data: { error: "Unauthorized" }
```

**Solution:** You're not logged in
- Go to `/admin` and login
- Refresh `/admin/orders`

---

#### B) isAdmin: false
```
Admin page: isAdmin = false
Admin page: Received 0 orders
```

**Solution:** User not in admins table
- Run the SQL from Step 1 above
- Make sure you're logged in as `nanthini@thisaitech.com`

---

#### C) Server logs show "Is admin: false"
```
Fetching orders for user: abc-123
Is admin: false
Fetched 0 orders from Supabase
```

**Solution:** Wrong user logged in OR not in admins table
- Check which email you're logged in with
- Verify that email is in admins table:

```sql
SELECT u.email
FROM admins a
INNER JOIN auth.users u ON a.id = u.id;
```

---

### Issue 2: RLS Policy Blocking

**Symptom:**
- Browser shows: `isAdmin: true`
- Server shows: `Is admin: true`
- But: `Received 0 orders`

**Solution:** Check RLS policies

```sql
-- Check current policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'orders';
```

**Required policy:**
```sql
-- Policy for admins to view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );
```

**If missing, create it:**
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

### Issue 3: Wrong User Logged In

**Check who's logged in:**

Open browser console and run:
```javascript
fetch('/api/orders')
  .then(r => r.json())
  .then(d => console.log('Current user admin status:', d));
```

**Expected:**
```json
{
  "orders": [...],
  "isAdmin": true
}
```

**If `isAdmin: false`:**
- Logout
- Login as `nanthini@thisaitech.com`
- Try again

---

## Complete Test Checklist

After running the SQL to add admin:

- [ ] Logged in as `nanthini@thisaitech.com`
- [ ] Went to `/admin/orders`
- [ ] Opened browser console (F12)
- [ ] Checked console logs show:
  - [ ] `API response status: 200`
  - [ ] `isAdmin = true`
  - [ ] `Received X orders` (X > 0)
- [ ] Server logs show:
  - [ ] `Is admin: true`
  - [ ] `Fetched X orders from Supabase`
- [ ] Page displays:
  - [ ] "Total Orders: X" (not 0)
  - [ ] Order cards visible
- [ ] Clicked "View Details" on an order
- [ ] Modal shows complete order information
- [ ] Can update order status
- [ ] Can generate invoice

---

## Expected Admin View

### Orders List Page
```
┌─────────────────────────────────────────┐
│  Orders Management                      │
│  Total Orders: 4                    ✅   │
│                        [Refresh]        │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │Order #1 │  │Order #2 │  │Order #3 ││
│  │Name     │  │Name     │  │Name     ││
│  │3 items  │  │1 item   │  │2 items  ││
│  │₹5,000   │  │₹2,500   │  │₹3,200   ││
│  │[Details]│  │[Details]│  │[Details]││
│  └─────────┘  └─────────┘  └─────────┘│
└─────────────────────────────────────────┘
```

### Order Details Modal
```
┌──────────────────────────────────────────┐
│  Order Details                   [X]     │
│  Order #abc-123                          │
├──────────────────────────────────────────┤
│  Update Order Status:                    │
│  [Placed] [Packed] [Shipped] [Delivered]│
│                                          │
│  Customer Information:                   │
│  Name: John Doe                          │
│  Email: john@example.com                 │
│  Phone: 9876543210                       │
│                                          │
│  Shipping Address:                       │
│  123 Test Street                         │
│  Test City, Test District                │
│  PIN: 123456                             │
│                                          │
│  Products (3):                           │
│  - Product 1  x2  ₹2,000                │
│  - Product 2  x1  ₹1,500                │
│  - Product 3  x1  ₹1,500                │
│                                          │
│  Subtotal: ₹5,000                       │
│  Shipping: FREE                          │
│  Total: ₹5,000                          │
│                                          │
│  Payment: Razorpay - Completed           │
└──────────────────────────────────────────┘
```

---

## Quick Fix Commands

### Reset Everything
```sql
-- 1. Check current admin
SELECT email FROM auth.users u
INNER JOIN admins a ON u.id = a.id;

-- 2. Remove all admins (if needed)
DELETE FROM admins;

-- 3. Add nanthini as admin
INSERT INTO admins (id, created_at)
SELECT id, NOW()
FROM auth.users
WHERE email = 'nanthini@thisaitech.com';

-- 4. Verify
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_admins FROM admins;
```

---

## Next Steps After Adding Admin

1. ✅ Run SQL to add admin (from Step 1)
2. ✅ Logout and login as admin
3. ✅ Go to `/admin/orders`
4. ✅ Check browser console logs
5. ✅ Should see all orders!

If still not working, share:
- Browser console screenshot
- Server terminal logs
- Result of admin verification SQL query
