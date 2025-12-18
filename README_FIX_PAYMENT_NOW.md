# 🚨 Fix Payment Status Issue NOW

## The Problem

Payment shows "Successful" in Razorpay but order status remains "Pending" and no invoice button.

## The Fix (5 Minutes)

### Step 1: Add Service Role Key (2 min)

1. Go to: https://supabase.com/dashboard
2. Settings → API
3. Copy the **"service_role secret"** key (long key that starts with `eyJ...`)
4. Open `.env.local` file in your project
5. Find this line:
   ```
   # SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
6. Change it to (paste your actual key):
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
7. Save the file
8. Stop your dev server (Ctrl+C)
9. Restart: `npm run dev`

### Step 2: Fix Existing Orders (1 min)

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste this:

```sql
UPDATE orders
SET payment_status = 'completed', order_status = 'confirmed'
WHERE payment_status = 'pending'
  AND razorpay_payment_id IS NOT NULL;
```

3. Click "Run"
4. Done!

### Step 3: Verify (1 min)

1. Refresh your My Orders page
2. Order should show "COMPLETED" ✅
3. Invoice button should be there ✅
4. Click invoice → Opens ✅

## That's It!

**Future payments will now work automatically!**

- ✅ Payment status updates correctly
- ✅ Invoice button appears
- ✅ No more stuck "pending" orders

## Files to Check

- `.env.local` - Should have `SUPABASE_SERVICE_ROLE_KEY=...` (uncommented)
- Supabase orders table - Should show "completed" status

## Still Not Working?

Check:
1. Did you restart the dev server after adding the key?
2. Did you uncomment the line (remove the `#`)?
3. Is the key the "service_role secret" (not the anon key)?

## Need More Help?

See detailed guides:
- [PAYMENT_STATUS_FINAL_FIX.md](PAYMENT_STATUS_FINAL_FIX.md) - Complete guide
- [SETUP_SERVICE_ROLE_KEY.md](SETUP_SERVICE_ROLE_KEY.md) - Service role key setup
- [COMPLETE_FIX_PAYMENT_STATUS.sql](COMPLETE_FIX_PAYMENT_STATUS.sql) - Advanced SQL fixes

---

**Quick Action:**
1. Add service role key to `.env.local`
2. Restart server
3. Run SQL to fix existing orders
4. ✅ Done!
