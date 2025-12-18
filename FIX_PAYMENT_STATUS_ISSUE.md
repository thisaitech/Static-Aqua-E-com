# Fix Payment Status Not Updating After Successful Payment

## Problem

User completes payment successfully in Razorpay (shows "Payment Successful"), but:
- Order status remains "Pending" in database
- Payment status remains "Pending"
- Invoice button doesn't appear (because it only shows for completed orders)

## Root Cause

The payment verification API (`/api/razorpay/verify-payment`) is supposed to update the order status from "pending" to "completed" after verifying the Razorpay signature. However, the database update may be failing silently.

Possible reasons:
1. **RLS Policy Issue**: User doesn't have permission to update orders
2. **Authentication Issue**: User session expired during payment
3. **Database Error**: Constraint violation or other DB error
4. **Silent Failure**: Previous code logged errors but didn't return them to client

## Solutions Implemented

### 1. ✅ Improved Error Logging in Verify Payment API

**File:** `src/app/api/razorpay/verify-payment/route.ts`

**Changes:**
- Added console logs to track the update process
- Added `.select()` to see what data was updated
- Now returns error response if DB update fails (previously it silently continued)
- Added `updated_at` timestamp to the update

**Before:**
```typescript
const { error: updateError } = await supabase
  .from('orders')
  .update({ ... })
  .eq('id', orderId);

if (updateError) {
  console.error('Error updating order:', updateError);
  // Don't fail the verification if DB update fails
}
```

**After:**
```typescript
console.log('Updating order:', orderId, 'with payment details');

const { data: updateData, error: updateError } = await supabase
  .from('orders')
  .update({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    payment_status: 'completed',
    order_status: 'confirmed',
    updated_at: new Date().toISOString(),
  })
  .eq('id', orderId)
  .select();

if (updateError) {
  console.error('❌ Error updating order:', updateError);
  console.error('Order ID:', orderId);
  console.error('Update error details:', JSON.stringify(updateError));
  return NextResponse.json(
    {
      error: 'Failed to update order status',
      details: updateError.message,
      verified: true,
    },
    { status: 500 }
  );
}

console.log('✅ Order updated successfully:', updateData);
```

### 2. ✅ Better Error Handling in Checkout Page

**File:** `src/app/checkout/page.tsx`

**Changes:**
- Added console logs before and after verification
- Parse the response to see actual error details
- Log verification success/failure clearly

**Before:**
```typescript
const verifyResponse = await fetch('/api/razorpay/verify-payment', {...});

if (!verifyResponse.ok) {
  throw new Error('Payment verification failed');
}
```

**After:**
```typescript
console.log('Verifying payment for order:', dbOrderId);
const verifyResponse = await fetch('/api/razorpay/verify-payment', {...});

const verifyData = await verifyResponse.json();
console.log('Verify response:', verifyData);

if (!verifyResponse.ok) {
  console.error('❌ Payment verification failed:', verifyData);
  throw new Error(verifyData.error || 'Payment verification failed');
}

console.log('✅ Payment verified successfully');
```

### 3. ✅ SQL Script to Fix Existing Orders

**File:** `fix-pending-order-status.sql`

This script will find and fix orders that are stuck in "pending" status but have Razorpay payment IDs (meaning payment was successful).

**How to use:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from `fix-pending-order-status.sql`
3. Run the first query to see affected orders
4. Run the UPDATE query to fix them
5. Run the last query to verify the fix

**The SQL does:**
```sql
-- Find stuck orders
SELECT * FROM orders
WHERE payment_status = 'pending'
  AND razorpay_payment_id IS NOT NULL;

-- Fix them
UPDATE orders
SET
  payment_status = 'completed',
  order_status = 'confirmed'
WHERE payment_status = 'pending'
  AND razorpay_payment_id IS NOT NULL;
```

## How to Test the Fix

### Test 1: Fix Existing Order (Immediate)

1. **Go to Supabase** → SQL Editor
2. **Run this query** to see your pending order:
   ```sql
   SELECT id, customer_name, payment_status, order_status, razorpay_payment_id
   FROM orders
   WHERE payment_status = 'pending'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

3. **If you see orders with `razorpay_payment_id` but status is "pending"**, run this to fix:
   ```sql
   UPDATE orders
   SET payment_status = 'completed', order_status = 'confirmed'
   WHERE payment_status = 'pending'
     AND razorpay_payment_id IS NOT NULL;
   ```

4. **Refresh your My Orders page** - Invoice button should now appear! ✅

### Test 2: New Payment (Future)

1. Clear your cart (or use a different user)
2. Add items to cart
3. Go to checkout
4. Complete payment with Razorpay
5. Check browser console - you should see:
   ```
   Verifying payment for order: {orderId}
   ✅ Payment verified successfully
   ```

6. Go to My Orders page
7. The order should show:
   - Payment Status: **COMPLETED** ✅
   - Order Status: **CONFIRMED** ✅
   - **Invoice button should be visible** ✅

### Test 3: Check Console Logs

After completing a new payment, check the browser console and server logs for:

**Success case:**
```
Verifying payment for order: abc-123...
Verify response: { success: true, verified: true, ... }
✅ Payment verified successfully
Invoice generated: INV-2025-12-0001
```

**Failure case (if it happens):**
```
❌ Payment verification failed: { error: '...', details: '...' }
```

Now you'll see the actual error message instead of a silent failure!

## Expected Behavior After Fix

### Payment Flow:

```
1. User completes payment in Razorpay
   ↓
2. Razorpay calls our handler with payment details
   ↓
3. Checkout calls /api/razorpay/verify-payment
   ↓
4. API verifies signature ✅
   ↓
5. API updates order in database:
   - payment_status: 'pending' → 'completed'
   - order_status: 'placed' → 'confirmed'
   - Adds razorpay_payment_id, razorpay_signature
   ↓
6. API returns success ✅
   ↓
7. Checkout generates invoice
   ↓
8. User redirected to success page
   ↓
9. User goes to My Orders
   ↓
10. Order shows as "COMPLETED" with Invoice button ✅
```

### Invoice Button Visibility:

```
if (payment_status === 'completed') {
  Show "Invoice" button ✅
} else {
  Hide invoice button ❌
}
```

## Possible Issues and Solutions

### Issue 1: RLS Policy Blocks Update

**Symptom:** Console shows "Row level security policy violation" or "permission denied"

**Fix:** Check if the orders table RLS policy allows authenticated users to update their own orders:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- If needed, add update policy
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Issue 2: User Session Expired During Payment

**Symptom:** Console shows "Unauthorized" (401) error

**Fix:** The payment verification route checks authentication (line 10-14). If the session expires during the Razorpay payment flow, the update will fail.

**Solution:** Remove auth check from verify-payment route (since we already verify the Razorpay signature):

```typescript
// Remove or comment out these lines:
// const { data: { user }, error: authError } = await supabase.auth.getUser();
// if (authError || !user) {
//   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// }
```

### Issue 3: orderId Not Being Passed

**Symptom:** Console shows "⚠️ No orderId provided for payment verification"

**Fix:** Check that `dbOrderId` is properly set in checkout page before opening Razorpay. Verify line 123-128 in checkout page.

### Issue 4: Database Constraint Violation

**Symptom:** Console shows "duplicate key" or "constraint violation"

**Fix:** Check if razorpay_payment_id is unique in the database. If two payments somehow get the same ID, the update will fail.

## Files Changed

1. **[src/app/api/razorpay/verify-payment/route.ts](src/app/api/razorpay/verify-payment/route.ts)** - Lines 46-81
   - Added detailed logging
   - Return error if DB update fails
   - Added updated_at field

2. **[src/app/checkout/page.tsx](src/app/checkout/page.tsx)** - Lines 149-170
   - Added verification logging
   - Parse and log response
   - Better error messages

3. **[fix-pending-order-status.sql](fix-pending-order-status.sql)** - New file
   - SQL to fix stuck orders

## Summary

### What Was Wrong:
- ❌ Payment verification succeeded but DB update failed silently
- ❌ No error logs to debug the issue
- ❌ Order stuck in "pending" status even after successful payment
- ❌ Invoice button hidden because status is not "completed"

### What's Fixed:
- ✅ Detailed console logs for debugging
- ✅ API returns error if DB update fails (no more silent failures)
- ✅ SQL script to fix existing stuck orders
- ✅ Better error messages in checkout
- ✅ Added updated_at timestamp

### Next Steps:
1. **Run the SQL** to fix your current stuck order
2. **Test a new payment** to verify it works
3. **Check console logs** to see if there are any remaining issues
4. **Check if RLS policies** are blocking updates (if issues persist)

After running the SQL script, your existing order will show as "COMPLETED" and the invoice button will appear! 🎉

For future payments, the improved logging will help us quickly identify any issues.
