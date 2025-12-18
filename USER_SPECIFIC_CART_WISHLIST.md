# User-Specific Cart & Wishlist Flow

## Overview
Cart and wishlist are now user-specific, synced with Supabase, and properly cleared on logout.

## Complete User Flow

### 1. User Sign In
```
User logs in via AuthContext
  ↓
authUser is set in AuthContext
  ↓
StoreContext detects authUser change (line 136)
  ↓
Creates storeUser object with {id, email, name}
  ↓
Dispatches LOGIN action (line 144)
  ↓
Immediately fetches cart from Supabase (line 146)
Immediately fetches wishlist from Supabase (line 147)
  ↓
User sees their specific cart and wishlist items ✅
```

**Console logs:**
```
StoreContext - Syncing user from AuthContext: {User object}
StoreContext - Fetching cart from Supabase for user: {userId}
StoreContext - Supabase cart loaded: [...]
StoreContext - Fetching wishlist from Supabase for user: {userId}
StoreContext - Supabase wishlist loaded: [...]
```

### 2. User Adds Item to Wishlist/Cart
```
User clicks wishlist/add to cart
  ↓
State updates in StoreContext
  ↓
useEffect triggers (lines 286 & 317)
  ↓
Saves to localStorage (backup)
  ↓
Checks if user is logged in
  ↓
If logged in: Syncs to Supabase
  ↓
Data saved to user's specific row in Supabase ✅
```

**Console logs:**
```
StoreContext - Saving wishlist: [...]
StoreContext - Current user state: {id, email, name}
StoreContext - Saved to localStorage
StoreContext - Syncing to Supabase for user: {userId}
StoreContext - Successfully synced to Supabase
```

### 3. User Reloads Page
```
Page reloads
  ↓
AuthContext loads Supabase session
  ↓
authUser is set
  ↓
StoreContext syncs user (line 144)
  ↓
Fetches cart from Supabase (line 146)
Fetches wishlist from Supabase (line 147)
  ↓
User's cart and wishlist restored ✅
```

**Console logs:**
```
StoreContext - Syncing user from AuthContext: {User object}
StoreContext - Fetching cart from Supabase for user: {userId}
StoreContext - Supabase cart loaded: [...]
StoreContext - Fetching wishlist from Supabase for user: {userId}
StoreContext - Supabase wishlist loaded: [...]
```

### 4. User Logs Out
```
User clicks logout
  ↓
AuthContext signs out via Supabase
  ↓
authUser becomes null
  ↓
StoreContext detects authUser is null (line 148)
  ↓
Clears localStorage (lines 151-153)
  - Removes rainbow-aqua-user
  - Removes rainbow-aqua-cart
  - Removes rainbow-aqua-wishlist
  ↓
Dispatches LOGOUT action (line 154)
  ↓
Reducer clears user, cart, and wishlist (line 102)
  ↓
Cart and wishlist are empty ✅
```

**Console logs:**
```
StoreContext - User logged out in AuthContext
```

### 5. Different User Signs In
```
New user logs in
  ↓
authUser is set with new user's data
  ↓
StoreContext syncs new user (line 144)
  ↓
Fetches THAT user's cart from Supabase (line 146)
Fetches THAT user's wishlist from Supabase (line 147)
  ↓
Shows new user's specific cart and wishlist ✅
```

**Console logs:**
```
StoreContext - Syncing user from AuthContext: {New User object}
StoreContext - Fetching cart from Supabase for user: {newUserId}
StoreContext - Supabase cart loaded: [new user's items]
StoreContext - Fetching wishlist from Supabase for user: {newUserId}
StoreContext - Supabase wishlist loaded: [new user's items]
```

## Key Implementation Details

### Logout Action (Line 102)
```typescript
case 'LOGOUT':
  return { ...state, user: null, cart: [], wishlist: [] };
```
- Clears user
- **Clears cart array**
- **Clears wishlist array**

### AuthContext Sync (Lines 136-156)
```typescript
useEffect(() => {
  if (authUser) {
    // User logged in - sync and fetch data
    const storeUser = { id: authUser.id, email: ..., name: ... };
    dispatch({ type: 'LOGIN', payload: storeUser });
    fetchCartFromSupabase(authUser.id);
    fetchWishlistFromSupabase(authUser.id);
  } else if (state.user) {
    // User logged out - clear everything
    localStorage.removeItem('rainbow-aqua-user');
    localStorage.removeItem('rainbow-aqua-cart');
    localStorage.removeItem('rainbow-aqua-wishlist');
    dispatch({ type: 'LOGOUT' });
  }
}, [authUser]);
```

### Data Persistence (Lines 286-314 & 317-342)
```typescript
// Cart save
useEffect(() => {
  localStorage.setItem('rainbow-aqua-cart', JSON.stringify(state.cart));

  if (state.user && state.user.id) {
    // Sync to Supabase with user_id
    await supabase.from('cart_items').upsert({
      user_id: state.user.id,
      cart_data: state.cart,
      updated_at: new Date().toISOString(),
    });
  }
}, [state.cart, state.user]);

// Wishlist save (same pattern)
useEffect(() => {
  localStorage.setItem('rainbow-aqua-wishlist', JSON.stringify(state.wishlist));

  if (state.user && state.user.id) {
    // Sync to Supabase with user_id
    await supabase.from('wishlists').upsert({
      user_id: state.user.id,
      product_ids: state.wishlist,
      updated_at: new Date().toISOString(),
    });
  }
}, [state.wishlist, state.user]);
```

## Database Schema

### cart_items table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- cart_data: JSONB (Array of cart items)
- created_at: Timestamp
- updated_at: Timestamp
```

### wishlists table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- product_ids: Text[] (Array of product IDs)
- created_at: Timestamp
- updated_at: Timestamp
```

## Security

- **Row Level Security (RLS)** enabled on both tables
- Users can only read/write their own data
- `user_id` is matched against `auth.uid()`
- Server-side authentication via Supabase Auth

## Testing Scenarios

### Test 1: Logout Clears Data
1. Login as User A
2. Add items to cart and wishlist
3. Logout
4. **Expected**: Cart and wishlist are empty ✅

### Test 2: User-Specific Data
1. Login as User A
2. Add items to cart and wishlist
3. Logout
4. Login as User B
5. **Expected**: Cart and wishlist are empty (User A's data not shown) ✅
6. Add different items as User B
7. Logout
8. Login as User A again
9. **Expected**: User A's original items appear ✅

### Test 3: Page Reload
1. Login as User A
2. Add items to cart and wishlist
3. Reload page
4. **Expected**: User A's items still visible ✅

### Test 4: Cross-Device Sync
1. Login as User A on Device 1
2. Add items to cart/wishlist
3. Login as User A on Device 2
4. **Expected**: Same cart and wishlist items appear ✅

## Summary

✅ Cart and wishlist are user-specific
✅ Data syncs to Supabase immediately
✅ Page reload restores user's data
✅ Logout clears cart, wishlist, and localStorage
✅ Different users have different cart/wishlist
✅ Cross-device synchronization works
✅ Fallback to localStorage for guest users
