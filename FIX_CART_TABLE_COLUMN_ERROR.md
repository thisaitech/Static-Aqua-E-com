# Fix Cart Table Column Error

## Problem

The console shows this error:
```
Failed to fetch cart from Supabase
{code: '42703', message: 'column cart_items.cart_data does not exist'}
```

This means the `cart_items` table exists in your Supabase database, but it doesn't have the `cart_data` column that the code is trying to access.

## Root Cause

The table was likely created with a different structure, or the column name is different from what the code expects.

## Solution

You need to recreate the `cart_items` table with the correct structure in Supabase.

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run the Fix SQL Script

Copy and paste the entire contents of `check-and-fix-cart-table.sql` into the SQL Editor and run it.

This script will:
1. Drop the existing `cart_items` table (if any)
2. Create a new `cart_items` table with the correct structure:
   - `id` (UUID) - Primary key
   - `user_id` (UUID) - Foreign key to auth.users
   - `cart_data` (JSONB) - **This is the column that's missing!**
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
3. Set up RLS policies for security
4. Create an index for performance
5. Verify the structure

### Step 3: Verify the Table

After running the script, you should see output showing the table structure:

```
column_name  | data_type                   | is_nullable | column_default
-------------|-----------------------------|-------------|-------------------------
id           | uuid                        | NO          | gen_random_uuid()
user_id      | uuid                        | NO          |
cart_data    | jsonb                       | NO          | '[]'::jsonb
created_at   | timestamp with time zone    | YES         | now()
updated_at   | timestamp with time zone    | YES         | now()
```

Look for the `cart_data` column with type `jsonb` - this is what was missing!

### Step 4: Test the Fix

1. Refresh your application page
2. Login with your user account
3. Try adding a product to the cart
4. Check the console logs - you should now see:
   ```
   StoreContext - Syncing cart to Supabase for user: <your-user-id>
   StoreContext - Successfully synced cart to Supabase
   ```

5. Reload the page - the cart should persist ✅

### Step 5: Verify in Supabase

1. Go to **Table Editor** in Supabase
2. Select the `cart_items` table
3. You should see a row with:
   - Your `user_id`
   - `cart_data` as a JSON array with your cart items
   - Timestamps

## Why This Happened

When you initially created the `cart_items` table, you might have:
1. Used a different column name (like `items` instead of `cart_data`)
2. Created the table without the `cart_data` column
3. Created it with a different data type

The code expects:
- Column name: `cart_data`
- Data type: `JSONB`
- Structure: Array of cart items

## Expected Result After Fix

✅ Cart items save to Supabase when added
✅ Cart loads from Supabase on page reload
✅ Cart persists after logout/login
✅ Each user has their own cart (user_id isolation)
✅ No more "column does not exist" errors

## Troubleshooting

If you still see errors after running the script:

### Error: "permission denied for table cart_items"
**Solution**: Make sure you're running the SQL as a user with CREATE TABLE permissions (usually the project owner).

### Error: "duplicate key value violates unique constraint"
**Solution**: The script already includes `DROP TABLE IF EXISTS`, but if you still see this, manually delete the table first:
```sql
DROP TABLE IF EXISTS cart_items CASCADE;
```

### Error: "relation auth.users does not exist"
**Solution**: This means your Supabase project doesn't have auth enabled. Enable authentication in Supabase settings first.

## Verification Checklist

- [ ] Run `check-and-fix-cart-table.sql` in Supabase SQL Editor
- [ ] Verify table structure shows `cart_data` column (JSONB type)
- [ ] Check RLS policies are enabled on the table
- [ ] Login to your app and add items to cart
- [ ] Check console - should see "Successfully synced cart to Supabase"
- [ ] Check Supabase Table Editor - should see cart data
- [ ] Reload page - cart should persist
- [ ] Logout and login - cart should restore

## Summary

The issue is simply that the `cart_items` table doesn't have the `cart_data` column. Running the fix script will recreate the table with the correct structure, and everything will work as expected.

After fixing this, both cart and wishlist will be fully functional with Supabase persistence! 🎉
