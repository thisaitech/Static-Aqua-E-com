# Wishlist Reload Fix - Explanation

## The Problem

When you reloaded the page, the wishlist data would disappear even though it was saved in Supabase. This happened because of a **race condition**:

1. Page loads → User state is empty initially
2. StoreContext initializes with empty cart/wishlist
3. `useEffect` for syncing sees empty wishlist → **syncs empty array to Supabase** ❌
4. Then, the fetch from Supabase completes and loads the wishlist
5. But it's too late - Supabase already has an empty array

### The Race Condition Sequence:
```
Time 0ms:   App loads, state = { cart: [], wishlist: [] }
Time 10ms:  Sync effect runs → Saves empty [] to Supabase ❌
Time 50ms:  Fetch completes → Loads wishlist ["prod-1", "prod-2"] from Supabase
Time 60ms:  Sync effect runs again → Overwrites with the loaded data ✓
```

**Result:** On page load, empty wishlist briefly overwrites Supabase data, then gets reloaded.

---

## The Solution

Added a `hasLoadedDataRef` flag to track whether we've loaded initial data from Supabase:

### How it works:

```typescript
// 1. Create a ref to track if we've loaded data
const hasLoadedDataRef = React.useRef(false);

// 2. Set it to true AFTER fetching from Supabase
const fetchWishlistFromSupabase = async (userId: string) => {
  // ... fetch from Supabase ...
  hasLoadedDataRef.current = true; // ← Mark as loaded
};

// 3. Don't sync to Supabase until we've loaded
const syncWishlistToSupabase = async () => {
  if (!hasLoadedDataRef.current) {
    console.log('Skipping sync - waiting for initial data load');
    return; // ← Don't sync yet!
  }
  // ... sync to Supabase ...
};
```

### New Sequence:
```
Time 0ms:   App loads, state = { cart: [], wishlist: [] }, hasLoaded = false
Time 10ms:  Sync effect runs → SKIPPED (hasLoaded = false) ✓
Time 50ms:  Fetch completes → Loads wishlist ["prod-1", "prod-2"], hasLoaded = true ✓
Time 60ms:  Sync effect runs → Now syncs the loaded data ✓
```

**Result:** No more overwriting Supabase data on page load!

---

## Changes Made

### 1. Added tracking flag
```typescript
const hasLoadedDataRef = React.useRef(false);
```

### 2. Set flag after loading from Supabase
```typescript
// In fetchCartFromSupabase
hasLoadedDataRef.current = true;

// In fetchWishlistFromSupabase
hasLoadedDataRef.current = true;
```

### 3. Skip sync until data is loaded
```typescript
// In cart sync useEffect
if (!hasLoadedDataRef.current) {
  console.log('Skipping cart sync - waiting for initial data load');
  return;
}

// In wishlist sync useEffect
if (!hasLoadedDataRef.current) {
  console.log('Skipping wishlist sync - waiting for initial data load');
  return;
}
```

### 4. Reset flag on logout
```typescript
hasLoadedDataRef.current = false;
```

---

## Testing

Now when you:
1. ✅ Add items to wishlist → They save to Supabase
2. ✅ Reload the page → Wishlist persists (no longer disappears!)
3. ✅ Remove items → They remove from both state and Supabase
4. ✅ Logout → Everything clears properly
5. ✅ Login again → Your wishlist loads from Supabase

The wishlist data will now **persist across page reloads**! 🎉
