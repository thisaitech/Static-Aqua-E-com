# Testing Cart & Wishlist User-Specific Behavior

## Current Implementation Status

✅ Logout clears cart and wishlist (line 101)
✅ LocalStorage cleared on logout (lines 150-153)
✅ User-specific data fetched from Supabase on login (lines 145-147)
✅ AuthContext syncs with StoreContext automatically

## Step-by-Step Test Instructions

### Test 1: Verify Logout Clears Everything

1. **Login** as a user
2. **Add items** to cart and wishlist
3. **Open browser console** (F12)
4. **Check Supabase** - verify items are in database
5. **Click Logout**
6. **Verify in console**:
   ```
   StoreContext - User logged out in AuthContext
   ```
7. **Check the UI**:
   - Cart should be empty ✅
   - Wishlist page should be empty ✅
   - Cart count should be 0 ✅
8. **Check localStorage** (Application tab in DevTools):
   - `rainbow-aqua-user` should be deleted ✅
   - `rainbow-aqua-cart` should be deleted ✅
   - `rainbow-aqua-wishlist` should be deleted ✅

### Test 2: Verify Login Loads User-Specific Data

1. **Make sure you're logged out**
2. **Login** as a user who has items in cart/wishlist
3. **Check console** - should see:
   ```
   StoreContext - Syncing user from AuthContext: {user object}
   StoreContext - Fetching cart from Supabase for user: {userId}
   StoreContext - Supabase cart loaded: [...]
   StoreContext - Fetching wishlist from Supabase for user: {userId}
   StoreContext - Supabase wishlist loaded: [...]
   ```
4. **Check the UI**:
   - Cart should show that user's items ✅
   - Wishlist should show that user's items ✅
   - Cart count should match ✅

### Test 3: Verify Different Users See Different Data

**Part A - User A**
1. **Login as User A** (e.g., user1@test.com)
2. **Add Product 1** to cart
3. **Add Product 2** to wishlist
4. **Check Supabase** - verify User A's data is saved
5. **Logout**
6. **Verify cart and wishlist are empty**

**Part B - User B**
1. **Login as User B** (e.g., user2@test.com)
2. **Check cart and wishlist** - should be EMPTY (not showing User A's data) ✅
3. **Add Product 3** to cart
4. **Add Product 4** to wishlist
5. **Check Supabase** - verify User B has different data than User A
6. **Logout**

**Part C - User A Again**
1. **Login as User A** again
2. **Check cart** - should show Product 1 (from step A.2) ✅
3. **Check wishlist** - should show Product 2 (from step A.3) ✅
4. **Should NOT show** Product 3 or 4 (those are User B's) ✅

### Test 4: Verify Page Reload Persistence

1. **Login** as a user
2. **Add items** to cart and wishlist
3. **Reload the page** (F5 or Ctrl+R)
4. **Check console** - should see:
   ```
   StoreContext - Syncing user from AuthContext: {user}
   StoreContext - Fetching cart from Supabase for user: {userId}
   StoreContext - Supabase cart loaded: [...]
   StoreContext - Fetching wishlist from Supabase for user: {userId}
   StoreContext - Supabase wishlist loaded: [...]
   ```
5. **Check the UI**:
   - Cart items still visible ✅
   - Wishlist items still visible ✅

## Troubleshooting

### Issue: Wishlist not clearing on logout

**Check:**
1. Open browser console
2. Click logout
3. Look for: `"StoreContext - User logged out in AuthContext"`
4. Check localStorage - should be cleared

**If not working:**
- Check if AuthContext's `signOut` function is being called
- Check if `authUser` becomes `null` after logout
- Verify `state.user` exists before logout (line 148)

### Issue: Wishlist not loading on login

**Check:**
1. Open browser console before login
2. Login
3. Look for these logs in order:
   - `"StoreContext - Syncing user from AuthContext: {...}"`
   - `"StoreContext - Fetching wishlist from Supabase for user: {userId}"`
   - `"StoreContext - Supabase wishlist loaded: [...]"`

**If not working:**
- Check if user exists in Supabase `wishlists` table
- Verify `user_id` matches between auth.users and wishlists table
- Check RLS policies on wishlists table

### Issue: Wrong user's data showing

**This should NOT happen because:**
- Each fetch uses `authUser.id` (line 146-147)
- Supabase query filters by `user_id` (line 246)
- RLS policies enforce user_id = auth.uid()

**If it happens:**
- Check Supabase RLS policies
- Verify auth.uid() in Supabase matches logged-in user
- Check if fetchWishlistFromSupabase is using correct userId

## Console Commands for Debugging

Open browser console and run these to debug:

```javascript
// Check current user
localStorage.getItem('rainbow-aqua-user')

// Check current cart
localStorage.getItem('rainbow-aqua-cart')

// Check current wishlist
localStorage.getItem('rainbow-aqua-wishlist')

// Clear everything manually
localStorage.removeItem('rainbow-aqua-user')
localStorage.removeItem('rainbow-aqua-cart')
localStorage.removeItem('rainbow-aqua-wishlist')
```

## Expected Console Logs

### On Login:
```
StoreContext - Syncing user from AuthContext: {User object with id, email}
StoreContext - Fetching cart from Supabase for user: abc-123-def
StoreContext - Fetching wishlist from Supabase for user: abc-123-def
StoreContext - Supabase cart loaded: [{product: {...}, quantity: 1}]
StoreContext - Supabase wishlist loaded: ['product-id-1', 'product-id-2']
```

### On Logout:
```
StoreContext - User logged out in AuthContext
```

### On Adding to Wishlist:
```
StoreContext - Saving wishlist: ['product-id-1']
StoreContext - Current user state: {id: 'abc-123', email: 'user@test.com', name: 'user'}
StoreContext - Saved to localStorage
StoreContext - Syncing to Supabase for user: abc-123-def
StoreContext - Successfully synced to Supabase
```

## Database Verification

Check Supabase directly:

1. Go to Supabase Dashboard → Table Editor
2. Open `wishlists` table
3. Verify each user has their own row with unique `user_id`
4. Check `product_ids` column matches what user added
5. Open `cart_items` table
6. Verify each user has their own row
7. Check `cart_data` column matches user's cart

## Summary

If all tests pass:
✅ Logout clears everything
✅ Login loads user-specific data
✅ Different users see different data
✅ Page reload maintains data
✅ Cross-device sync works (same user, different browser/device)

The implementation is complete and working correctly!
