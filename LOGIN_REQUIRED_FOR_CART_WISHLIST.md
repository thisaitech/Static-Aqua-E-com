# Login Required for Cart & Wishlist

## Overview
Users must be logged in to add items to cart or wishlist. Guest users are prompted to login when they try to add items.

## Implementation

### Files Modified

1. **src/components/products/ProductCard.tsx**
   - Added login checks for wishlist and cart actions
   - Shows alert and opens login modal if user is not logged in

2. **src/app/product/[id]/page.tsx**
   - Added login checks for product detail page actions
   - Prevents adding to cart/wishlist without authentication

### How It Works

#### ProductCard Component

**Before:**
```typescript
const { addToCart, toggleWishlist, isInWishlist } = useStore();
```

**After:**
```typescript
const { addToCart, toggleWishlist, isInWishlist, user, toggleAuthModal } = useStore();

const handleAddToCart = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (!user) {
    alert('Please login to add items to cart');
    toggleAuthModal();
    return;
  }
  if (!product.contactForPrice) {
    addToCart(product);
  }
};

const handleToggleWishlist = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (!user) {
    alert('Please login to add items to wishlist');
    toggleAuthModal();
    return;
  }
  toggleWishlist(product.id);
};
```

#### Product Detail Page

**Before:**
```typescript
const handleAddToCart = () => {
  for (let i = 0; i < quantity; i++) {
    addToCart(product);
  }
};
```

**After:**
```typescript
const handleAddToCart = () => {
  if (!user) {
    alert('Please login to add items to cart');
    toggleAuthModal();
    return;
  }
  for (let i = 0; i < quantity; i++) {
    addToCart(product);
  }
};

const handleToggleWishlist = () => {
  if (!user) {
    alert('Please login to add items to wishlist');
    toggleAuthModal();
    return;
  }
  if (product) {
    toggleWishlist(product.id);
  }
};
```

## User Experience Flow

### Scenario 1: Guest User Tries to Add to Wishlist

```
Guest user clicks wishlist button
  ↓
Check: user === null
  ↓
Alert: "Please login to add items to wishlist"
  ↓
Login modal opens automatically (toggleAuthModal())
  ↓
User can login or register
  ↓
After login, user can add items ✅
```

### Scenario 2: Guest User Tries to Add to Cart

```
Guest user clicks "Add to Cart" button
  ↓
Check: user === null
  ↓
Alert: "Please login to add items to cart"
  ↓
Login modal opens automatically (toggleAuthModal())
  ↓
User can login or register
  ↓
After login, user can add items ✅
```

### Scenario 3: Logged-in User Adds Items

```
Logged-in user clicks wishlist/cart button
  ↓
Check: user !== null
  ↓
Add item to wishlist/cart
  ↓
Sync to Supabase
  ↓
Item appears immediately ✅
```

## Benefits

✅ **No Anonymous Data**: Cart and wishlist are always associated with a user
✅ **Better Data Quality**: Every cart/wishlist item has a user_id
✅ **User Authentication**: Encourages users to create accounts
✅ **Consistent Experience**: Cart/wishlist persists across devices after login
✅ **Data Integrity**: No orphaned cart/wishlist data in localStorage
✅ **Security**: Only authenticated users can modify their data

## Testing

### Test 1: Guest User Cannot Add to Wishlist
1. **Logout** (if logged in)
2. **Go to homepage**
3. **Click wishlist icon** on any product
4. **Expected**: Alert shows "Please login to add items to wishlist"
5. **Expected**: Login modal opens automatically ✅

### Test 2: Guest User Cannot Add to Cart
1. **Logout** (if logged in)
2. **Go to homepage**
3. **Hover over product** and click "Add to Cart"
4. **Expected**: Alert shows "Please login to add items to cart"
5. **Expected**: Login modal opens automatically ✅

### Test 3: Logged-in User Can Add Items
1. **Login** as a user
2. **Click wishlist icon** on a product
3. **Expected**: Item added to wishlist immediately
4. **Expected**: Console shows "Successfully synced to Supabase" ✅

### Test 4: Product Detail Page Protection
1. **Logout** (if logged in)
2. **Go to any product detail page**
3. **Click "Add to Cart" button**
4. **Expected**: Alert and login modal ✅
5. **Click wishlist heart icon**
6. **Expected**: Alert and login modal ✅

## Important Notes

1. **No localStorage Fallback for Guests**:
   - Unlike before, guests cannot use cart/wishlist at all
   - All cart/wishlist operations require authentication
   - This ensures data integrity and encourages user registration

2. **Automatic Login Prompt**:
   - `toggleAuthModal()` is called automatically
   - User sees the login form immediately
   - Smooth UX - no need to find the login button

3. **State Management**:
   - Cart and wishlist state only updates when `user` exists
   - StoreContext won't sync to Supabase if user is null
   - Prevents any orphaned or anonymous data

4. **Consistent Across Pages**:
   - Product listing page (ProductCard)
   - Product detail page
   - Any other page using cart/wishlist

## Alternative: Allow Guest Cart/Wishlist

If you want to allow guests to use cart/wishlist temporarily (and sync on login), you can modify the code to:

1. Remove the `if (!user)` checks
2. Allow localStorage storage for guests
3. On login, sync localStorage data to Supabase

This is the previous behavior. Current implementation is more strict and requires login first.

## Summary

✅ Guests cannot add to cart or wishlist
✅ Login modal opens automatically when guest tries
✅ Logged-in users have full access
✅ All cart/wishlist data is user-specific
✅ Data always syncs to Supabase (no anonymous data)
✅ Consistent behavior across all pages
