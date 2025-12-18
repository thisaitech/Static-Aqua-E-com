# Test Multiple Products Flow - Complete Guide

## What's Already Working ✅

Your code is **correctly structured** to handle multiple products:

### Frontend (checkout/page.tsx)
- ✅ Maps all cart items to products array (line 275-282)
- ✅ Sends full array to API

### Backend (api/orders/route.ts)
- ✅ Receives products array (line 65)
- ✅ Validates array has items (line 74)
- ✅ Saves entire array to Supabase (line 90)

### Admin Page (admin/orders/page.tsx)
- ✅ Fetches all orders from Supabase (line 92)
- ✅ Displays product count (line 318)
- ✅ Shows all products in detail view (lines 455-474)

---

## Test Steps

### 1. Add Multiple Products to Cart
1. Go to homepage
2. Add **3-4 different products** to cart
3. Click cart icon - verify all items show

### 2. Place Order
1. Go to checkout
2. Fill in shipping details:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Address: 123 Test Street
   - City: Test City
   - District: Test District
   - Pincode: 123456
3. Select payment method (Razorpay or COD)
4. Click "Place Order"

### 3. Check Console Logs

**Browser Console (F12 → Console tab):**
```
Cart items: 3
Order data products: 3
Products being sent: [
  { id: "...", name: "...", quantity: 1, ... },
  { id: "...", name: "...", quantity: 2, ... },
  { id: "...", name: "...", quantity: 1, ... }
]
```

**Server Terminal:**
```
Creating order with products: [...]
Number of products: 3
Order created successfully: <uuid>
Saved products: [...]
Saved products count: 3
```

### 4. Check Admin Panel
1. Login to admin panel
2. Go to **Orders** section
3. Find your test order
4. Verify it shows "3 item(s)" or your product count
5. Click "View Details"
6. Verify all 3 products are listed with:
   - Product image
   - Product name
   - Quantity
   - Price

### 5. Check Supabase Directly
Run in Supabase SQL Editor:
```sql
-- Get most recent order
SELECT
  id,
  customer_name,
  jsonb_array_length(products) as product_count,
  jsonb_pretty(products) as products_json
FROM orders
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- `product_count`: 3 (or your number of products)
- `products_json`: Properly formatted JSON array with all products

---

## What Each Log Means

### Frontend Logs
| Log | What It Shows | Expected Value |
|-----|---------------|----------------|
| `Cart items:` | Items in your cart | 3 (or your count) |
| `Order data products:` | Products being sent to API | 3 (should match cart) |
| `Products being sent:` | Full product details | Array of product objects |

### Backend Logs
| Log | What It Shows | Expected Value |
|-----|---------------|----------------|
| `Creating order with products:` | What API received | Same as frontend sent |
| `Number of products:` | Product count received | 3 (or your count) |
| `Saved products count:` | What Supabase actually saved | 3 (should match) |

---

## If Products Are Missing

### Scenario 1: Frontend shows less products
**Symptoms:**
- Cart has 3 items
- `Order data products: 1`

**Problem:** Cart state issue in StoreContext

**Solution:** Check cart state before checkout

---

### Scenario 2: Backend receives less products
**Symptoms:**
- Frontend sends 3 products
- Backend logs show `Number of products: 1`

**Problem:** JSON serialization issue

**Solution:** Check network tab in browser DevTools

---

### Scenario 3: Database has less products
**Symptoms:**
- Backend logs show 3 products
- Supabase query shows 1 product

**Problem:** Supabase issue

**Possible causes:**
1. JSONB column size limit
2. Insert truncation
3. Wrong data type

**Check column type:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'products';
```

Should return: `products | jsonb`

---

## Example: Successful Test

```
✅ Browser Console:
   Cart items: 3
   Order data products: 3
   Products being sent: [...3 products...]

✅ Server Logs:
   Number of products: 3
   Saved products count: 3

✅ Admin Panel:
   Shows "3 item(s)"
   Detail view lists all 3 products

✅ Supabase:
   product_count = 3
   All 3 products visible in JSON
```

---

## Debugging Checklist

- [ ] Added 3+ products to cart
- [ ] Placed order successfully
- [ ] Checked browser console logs
- [ ] Checked server terminal logs
- [ ] Verified in admin panel
- [ ] Ran Supabase SQL query
- [ ] All counts match (3 = 3 = 3 = 3)

If all checkboxes pass → Everything works! ✅
If any fail → Note which step and check that section's troubleshooting

---

## Quick SQL Checks

```sql
-- 1. Latest order with product details
SELECT
  customer_name,
  jsonb_array_length(products) as count,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 1;

-- 2. All products in that order
SELECT jsonb_array_elements(products) as product
FROM orders
ORDER BY created_at DESC
LIMIT 1;

-- 3. Count orders with multiple products
SELECT COUNT(*) as orders_with_multiple_products
FROM orders
WHERE jsonb_array_length(products) > 1;
```

Ready to test! 🚀
