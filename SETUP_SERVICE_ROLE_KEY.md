# Setup Supabase Service Role Key

## Why We Need This

The payment verification is failing to update the order status because of Row Level Security (RLS) policies. The service role key allows the API to bypass RLS and update orders reliably.

## How to Get Your Service Role Key

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project
3. Click "Settings" in the left sidebar (⚙️ icon)
4. Click "API" in the settings menu

### Step 2: Find Your Service Role Key

You'll see two keys:

```
┌─────────────────────────────────────────────┐
│  Project API keys                           │
│  ─────────────────────────────────────      │
│                                             │
│  anon public                                │
│  [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...]  │
│  This key is safe to use in a browser       │
│  ↑ You already have this one                │
│                                             │
│  service_role secret                        │
│  [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...]  │
│  This key can bypass Row Level Security     │
│  ↑ YOU NEED THIS ONE!                       │
│                                             │
│  ⚠️ Never expose the service_role key in    │
│     client-side code or public repositories │
└─────────────────────────────────────────────┘
```

### Step 3: Copy the Service Role Key

1. Find the **"service_role secret"** key
2. Click the "Copy" button or "Reveal" to see it
3. Copy the entire key (starts with `eyJ...`)

### Step 4: Add to Your .env.local File

1. Open `.env.local` in your project root
2. Find this line:
   ```
   # SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Uncomment it and replace with your actual key:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Z2hi...
   ```

4. **Save the file**

### Step 5: Restart Your Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart it:
npm run dev
```

## Verification

After adding the key and restarting:

1. Make a test payment
2. Check the console logs
3. You should see:
   ```
   Updating order: {orderId} with payment details
   ✅ Order updated successfully
   ```

4. The order status should change to "COMPLETED"
5. Invoice button should appear!

## Security Warning ⚠️

**IMPORTANT:** The service role key is a SECRET KEY!

- ✅ **DO** keep it in `.env.local`
- ✅ **DO** add `.env.local` to `.gitignore`
- ❌ **DON'T** commit it to Git
- ❌ **DON'T** share it publicly
- ❌ **DON'T** use it in client-side code

This key bypasses all RLS policies and can access/modify any data in your database. Keep it secure!

## Example .env.local File

Your `.env.local` should look like this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cqghbwmzxpuwxqnjvzhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Z2hi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Z2hi...

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

## What This Fixes

With the service role key configured:

1. **Payment verification** will work correctly
2. **Order status** will update from "pending" to "completed"
3. **Invoice button** will appear for completed orders
4. **No more RLS blocking** the database update

## Alternative Solutions

If you don't want to use the service role key, you can:

### Option 1: Fix RLS Policies (Less Recommended)

Run the SQL in `COMPLETE_FIX_PAYMENT_STATUS.sql`:

```sql
CREATE POLICY "Allow authenticated order updates"
  ON orders
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
```

But this is less secure and might still have issues.

### Option 2: Disable RLS (NOT RECOMMENDED)

```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

This is **very insecure** and should only be used for testing!

## Recommended Approach

✅ **Use the service role key** (Option from this guide)
- Most secure
- Most reliable
- Standard practice for server-side operations
- No RLS conflicts

## Summary

1. **Get key** from Supabase Dashboard → Settings → API
2. **Copy** the `service_role secret` key
3. **Add** to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY=...`
4. **Restart** your dev server
5. **Test** a new payment
6. ✅ **Success** - Order status updates correctly!

After this, both new and existing payments will work perfectly! 🎉
