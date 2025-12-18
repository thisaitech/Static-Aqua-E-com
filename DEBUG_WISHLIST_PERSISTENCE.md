# Debug Wishlist Persistence Issue

## Issue Description
User logs in, adds items to wishlist, logs out, and then logs back in - but the wishlist data is not showing.

## What I Fixed

### 1. Function Hoisting Issue
**Problem**: The functions `fetchCartFromSupabase` and `fetchWishlistFromSupabase` were being called in the useEffect (line 148-149) BEFORE they were defined (lines 162-205). This caused them to be `undefined` when called.

**Fix**: Moved both functions BEFORE the useEffect and wrapped them in `React.useCallback` to ensure they're defined when needed.

### 2. Improved Logout Flow
**Problem**: The `isLoggingOutRef` flag might not have been properly preventing syncs during logout/login transitions.

**Fix**: Added clearer comments and ensured the logout flag is set BEFORE dispatching the LOGOUT action.

## How to Test

### Step 1: Clear Everything
1. Open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage**
3. Delete all `rainbow-aqua-*` keys
4. Go to **Supabase Dashboard** → **Table Editor**
5. Delete all rows from `wishlists` and `cart_items` tables
6. Refresh the application page

### Step 2: Fresh Login and Add to Wishlist
1. **Login** with your test account (e.g., sabi@gmail.com)
2. **Check console** - you should see:
   ```
   StoreContext - Syncing user from AuthContext: {id: '...', email: '...'}
   StoreContext - Fetching wishlist from Supabase for user: ...
   StoreContext - No wishlist found in Supabase, starting with empty wishlist
   ```
3. **Click the heart icon** on any product to add to wishlist
4. **Check console** - you should see:
   ```
   ProductCard - Toggling wishlist for product: <product-id>
   StoreContext - Syncing wishlist to Supabase for user: ...
   StoreContext - Wishlist synced to Supabase
   ```

### Step 3: Verify in Supabase
1. Go to **Supabase Dashboard** → **Table Editor** → **wishlists**
2. You should see a row with:
   - `user_id`: Your user's UUID
   - `product_ids`: Array with the product ID (e.g., `["4e15b61b-bbd8-4ad8-99ce-fc3ba7e18a77"]`)
   - `updated_at`: Current timestamp

### Step 4: Test Page Reload
1. **Reload the page** (F5)
2. **Check console** - you should see:
   ```
   StoreContext - Syncing user from AuthContext: {id: '...', email: '...'}
   StoreContext - Fetching wishlist from Supabase for user: ...
   StoreContext - Wishlist loaded from Supabase: ['product-id']
   ```
3. **Check UI** - The heart icon should be filled (red) on the product you added ✅

### Step 5: Test Logout
1. **Click Logout**
2. **Check console** - you should see:
   ```
   StoreContext - User logged out in AuthContext
   StoreContext - Skipping wishlist sync during logout
   StoreContext - Logout complete, resetting flag
   ```
3. **Check UI** - Wishlist should be empty (heart icons not filled)
4. **Check Supabase** - The wishlist row should STILL exist with your product ID (not cleared!)

### Step 6: Test Login Again (Same User)
1. **Login** again with the SAME account (e.g., sabi@gmail.com)
2. **Check console** - you should see:
   ```
   StoreContext - Syncing user from AuthContext: {id: '...', email: '...'}
   StoreContext - Fetching wishlist from Supabase for user: ...
   StoreContext - Wishlist loaded from Supabase: ['product-id']
   ```
3. **Check UI** - The heart icon should be filled (red) again ✅
4. **This is the CRITICAL step** - if the wishlist doesn't show here, we have a problem!

## What to Check If It Still Doesn't Work

### Check 1: User ID Consistency
Open browser console and check:
```javascript
// After login, check the user ID
// You should see it in the console logs: "Syncing user from AuthContext: {id: 'xxx'}"

// Or manually check:
const user = JSON.parse(localStorage.getItem('rainbow-aqua-user') || '{}');
console.log('User ID from localStorage:', user.id);
```

Compare this ID with the `user_id` in the Supabase `wishlists` table. **They must match exactly!**

### Check 2: RLS Policies
Run this in Supabase SQL Editor:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'wishlists';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'wishlists';
```

You should see:
- `rowsecurity = true` (RLS enabled)
- Policies for SELECT, UPDATE, INSERT with `auth.uid() = user_id`

### Check 3: Verify Data in Supabase
```sql
-- See all wishlist data (as superuser)
SELECT user_id, product_ids, updated_at FROM wishlists;

-- This shows you what's actually stored
```

### Check 4: Test with SQL Query
```sql
-- Replace 'YOUR-USER-ID' with the actual user_id from console logs
SELECT * FROM wishlists WHERE user_id = 'YOUR-USER-ID';
```

If this returns a row with `product_ids`, then the data IS in Supabase. The issue is with fetching it in the app.

### Check 5: Network Tab
1. Open DevTools → **Network** tab
2. Filter by "wishlists"
3. Login and watch for the Supabase API call
4. Click on the request to see:
   - **Request URL**: Should include `?user_id=eq.YOUR-USER-ID&select=product_ids`
   - **Response**: Should show your wishlist data or an error

### Check 6: Authentication Token
The issue might be with the auth token. Run in console:
```javascript
// Get current session
const supabase = createSupabaseClient();
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Current session:', session);
  console.log('User ID from session:', session?.user?.id);
});
```

The `session?.user?.id` must match the `user_id` in the wishlists table.

## Common Issues and Solutions

### Issue 1: "PGRST116" Error (No rows found)
**Cause**: The user_id in the query doesn't match any row in the table.
**Solution**:
1. Check the user_id in console logs
2. Check the user_id in Supabase table
3. Make sure they match exactly

### Issue 2: "PGRST301" Error (JWT expired)
**Cause**: The authentication token expired.
**Solution**: Logout and login again to get a fresh token.

### Issue 3: Empty Array Returns
**Cause**: The `product_ids` column is literally an empty array `[]`.
**Solution**: Add items to wishlist again and verify they're saved.

### Issue 4: Function Not Defined Error
**Cause**: The fix I applied might not have saved correctly.
**Solution**:
1. Check that `fetchWishlistFromSupabase` is defined BEFORE the useEffect (around line 160)
2. Make sure it uses `React.useCallback`

### Issue 5: Data Saves But Doesn't Load
**Cause**: The fetch is happening before the LOGIN action completes.
**Solution**: The fetch is now called AFTER dispatch (line 195), so this should be fixed.

## Expected Console Log Sequence

### On Fresh Login:
```
1. StoreContext - Syncing user from AuthContext: {id: '...', email: '...'}
2. StoreContext - Fetching wishlist from Supabase for user: ...
3. StoreContext - Wishlist loaded from Supabase: ['product-id'] OR No wishlist found
```

### On Adding to Wishlist:
```
1. ProductCard - Toggling wishlist for product: <id>
2. ProductCard - Current inWishlist state: false
3. StoreContext - Syncing wishlist to Supabase for user: ...
4. StoreContext - Wishlist synced to Supabase
```

### On Logout:
```
1. StoreContext - User logged out in AuthContext
2. StoreContext - Skipping wishlist sync during logout
3. StoreContext - Logout complete, resetting flag
```

### On Login Again (Same User):
```
1. StoreContext - Syncing user from AuthContext: {id: '...', email: '...'}
2. StoreContext - Fetching wishlist from Supabase for user: ...
3. StoreContext - Wishlist loaded from Supabase: ['product-id']  <- MUST SEE THIS!
```

## If Nothing Works

If you've tried everything above and it still doesn't work:

1. **Share the exact console logs** with me (copy/paste the entire sequence)
2. **Share a screenshot** of the Supabase `wishlists` table showing the data
3. **Share the Network tab** response from the wishlist fetch request
4. **Check if the fix was applied** - open `src/context/StoreContext.tsx` and verify line 160 has `const fetchWishlistFromSupabase = React.useCallback`

This will help me identify the exact issue and provide a targeted fix.

## Summary of Changes Made

✅ Moved `fetchCartFromSupabase` and `fetchWishlistFromSupabase` functions before the useEffect
✅ Wrapped both functions in `React.useCallback` for proper memoization
✅ Added clearer console logs for debugging
✅ Improved logout flag handling with comments

The wishlist should now persist correctly across logout/login cycles! 🎉
