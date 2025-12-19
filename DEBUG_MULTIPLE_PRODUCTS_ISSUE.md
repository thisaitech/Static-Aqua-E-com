# Debug: Multiple Products Not Saving to Orders

## Issue
When placing an order with multiple products in cart, the `orders` table isn't storing all products correctly.

## What We've Added - Debugging Logs

### 1. Frontend Logging (checkout/page.tsx)
Added at line 290-293 to log what's being sent:
```typescript

```

### 2. Backend Logging (api/orders/route.ts)
Added at line 79-80 to log what's received:
```typescript

```

Added at line 112-114 to log what was saved:
```typescript

```

---

## How to Debug

### Step 1: Test with Multiple Products
1. Add **3-4 different products** to cart
2. Go to checkout
3. Fill in shipping details
4. Click "Place Order"

### Step 2: Check Console Logs

**In Browser Console (F12):**
Look for these logs:
```
Cart items: 3
Order data products: 3
Products being sent: [
  {
    "id": "prod-1",
    "name": "Product 1",
    ...
  },
  {
    "id": "prod-2",
    "name": "Product 2",
    ...
  },
  {
    "id": "prod-3",
    "name": "Product 3",
    ...
  }
]
```

**In Terminal/Server Logs:**
Look for:
```
Creating order with products: [...]
Number of products: 3
Order created successfully: uuid-here
Saved products: [...]
Saved products count: 3
```

### Step 3: Check Database

Run [check-order-products.sql](check-order-products.sql) in Supabase SQL Editor:

```sql
-- Check most recent orders
SELECT
  id,
  customer_name,
  jsonb_array_length(products) as product_count,
  products
FROM orders
ORDER BY created_at DESC
LIMIT 5;
```

---

## Possible Issues & Solutions

### Issue 1: Frontend sends wrong data
**Symptom:** Browser console shows `Order data products: 1` even though cart has 3 items

**Solution:** Check if `cart` array is correct in StoreContext

---

### Issue 2: Backend receives wrong data
**Symptom:** Server logs show `Number of products: 1` but browser sent 3

**Solution:** Check if JSON parsing is working correctly in API route

---

### Issue 3: Supabase truncates data
**Symptom:** Server logs show correct count (3) but database only has 1

**Possible causes:**
1. **Column type wrong** - Should be JSONB, not TEXT
2. **Data too large** - Check if JSONB has size limits
3. **RLS policy blocking** - Check if policies allow full insert

**Run this to verify column type:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'products';
```

Should return: `products | jsonb`

---

### Issue 4: Product structure wrong
**Symptom:** Database has array but items are malformed

**Check this query:**
```sql
SELECT jsonb_pretty(products) FROM orders ORDER BY created_at DESC LIMIT 1;
```

Should look like:
```json
[
  {
    "id": "string",
    "name": "string",
    "price": number,
    "quantity": number,
    "image": "string",
    "mrp": number
  },
  {
    "id": "string",
    ...
  }
]
```

---

## Expected Flow

1. ✅ User has 3 products in cart
2. ✅ Frontend sends array with 3 products
3. ✅ Backend receives array with 3 products
4. ✅ Supabase saves JSONB array with 3 products
5. ✅ Database query shows 3 products

---

## Test Checklist

After adding logs, test and report:

- [ ] How many products in cart?
- [ ] What does browser console show for product count?
- [ ] What do server logs show for product count?
- [ ] What does database query return for product count?
- [ ] Share screenshots of:
  - [ ] Browser console logs
  - [ ] Server terminal logs
  - [ ] Supabase query results

---

## Quick Fix Script

If you find orders with wrong product counts, you can manually fix them:

```sql
-- Find the order
SELECT id, products FROM orders WHERE id = 'your-order-id';

-- Update it with correct products (example)
UPDATE orders
SET products = '[
  {"id": "prod-1", "name": "Product 1", "price": 100, "quantity": 2},
  {"id": "prod-2", "name": "Product 2", "price": 200, "quantity": 1}
]'::jsonb
WHERE id = 'your-order-id';
```

---

## Next Steps

1. **Place a test order** with multiple products
2. **Check all console logs** (browser + server)
3. **Run SQL query** to check database
4. **Report back** what each step shows

This will help us pinpoint exactly where the data is being lost! 🔍
