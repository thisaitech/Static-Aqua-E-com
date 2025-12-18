# Fix Cart Table Error & Test Wishlist

## Issue 1: Cart Table Error

**Error:**
```
column cart_items.cart_data does not exist
```

**Cause:** The `cart_items` table hasn't been created in Supabase yet.

**Fix:** Run the SQL migration in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Open and run: `create-cart-items-table.sql`
3. Verify table exists:
   ```sql
   SELECT * FROM cart_items;
   ```

## Issue 2: Wishlist Showing After Logout/Login

### Understanding Expected Behavior

**CORRECT Behavior (Same User):**
```
1. User A (sabi@gmail.com) logs in
2. Adds Product X to wishlist
3. Wishlist saved to Supabase with user_id = sabi's ID
4. Logs out → Wishlist cleared from UI
5. User A (sabi@gmail.com) logs in again
6. Fetches from Supabase → Finds wishlist for sabi's ID
7. Loads Product X ✅ THIS IS CORRECT!
```

**Why?** Because it's the SAME user, their wishlist should persist!

**INCORRECT Behavior (Different Users):**
```
1. User A logs in → Adds Product X
2. User A logs out
3. User B logs in
4. User B sees Product X ❌ THIS IS WRONG!
```

### How to Test Properly

#### Test 1: Same User (Should Remember Wishlist)

1. **Login as User A** (e.g., sabi@gmail.com)
2. **Add Product X** to wishlist
3. **Check Supabase** - verify product_ids in wishlists table has Product X for User A
4. **Logout**
5. **Login as User A again** (same email)
6. **Expected Result**: Product X should appear ✅ (This is CORRECT!)

#### Test 2: Different Users (Should NOT Share Wishlist)

1. **Login as User A** (e.g., sabi@gmail.com)
2. **Add Product X** to wishlist
3. **Logout**
4. **Login as User B** (e.g., john@gmail.com) - DIFFERENT user
5. **Expected Result**: Wishlist should be empty ✅
6. **Check Supabase**: User A's row should have Product X, User B's row should be empty

#### Test 3: Verify User-Specific Data

**Check in Supabase:**
```sql
SELECT user_id, product_ids FROM wishlists;
```

You should see:
```
| user_id (UUID)          | product_ids       |
|-------------------------|-------------------|
| sabi's-user-id-123...   | ['product-x-id']  |
| john's-user-id-456...   | []                |
```

Each user should have their OWN row with their OWN wishlist!

## Debugging: Check Current User ID

Add this to console when you login:

```javascript
// In browser console after login
console.log('Current User ID:', localStorage.getItem('rainbow-aqua-user'));
```

Compare the user IDs before and after logout/login. If they're the SAME, then the wishlist SHOULD persist.

## If Wishlist Is Showing for Different Users

If you login as User A, logout, login as User B, and see User A's wishlist, then there's a bug in the RLS policy or user_id matching.

**Debug Steps:**

1. **Check User IDs in Console:**
   - Login as User A → Check console: `"Syncing user from AuthContext: {id: 'xxx...'}"`
   - Note the ID
   - Logout
   - Login as User B → Check console again
   - Compare IDs - are they different?

2. **Check Supabase Wishlists Table:**
   ```sql
   SELECT * FROM wishlists;
   ```
   - Each user should have their own row
   - User A's row should have User A's ID
   - User B's row should have User B's ID or no row at all

3. **Check RLS Policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'wishlists';
   ```
   - Verify policies exist
   - Verify they check `auth.uid() = user_id`

## Expected Console Logs

### User A Login:
```
StoreContext - Syncing user from AuthContext: {id: 'abc-123', email: 'sabi@gmail.com'}
StoreContext - Fetching wishlist from Supabase for user: abc-123
StoreContext - Supabase wishlist loaded: ['product-x-id']
```

### User A Logout:
```
StoreContext - User logged out in AuthContext
StoreContext - Skipping wishlist sync during logout
```

### User A Login Again:
```
StoreContext - Syncing user from AuthContext: {id: 'abc-123', email: 'sabi@gmail.com'}
StoreContext - Fetching wishlist from Supabase for user: abc-123
StoreContext - Supabase wishlist loaded: ['product-x-id']
```
^ SAME USER ID → SAME WISHLIST ✅

### User B Login:
```
StoreContext - Syncing user from AuthContext: {id: 'def-456', email: 'john@gmail.com'}
StoreContext - Fetching wishlist from Supabase for user: def-456
StoreContext - No wishlist found in Supabase or localStorage
StoreContext - SET_WISHLIST: []
```
^ DIFFERENT USER ID → EMPTY WISHLIST ✅

## Summary

1. **Fix Cart Table**: Run `create-cart-items-table.sql` in Supabase
2. **Understand Expected Behavior**: Same user = Same wishlist (CORRECT!)
3. **Test with Different Users**: Create 2 accounts, test separately
4. **Check User IDs**: Verify different users have different IDs
5. **Check Supabase Data**: Each user has their own row

The current implementation is likely working CORRECTLY - you just need to test with actually different users, not the same user logging in again!
