# Cart Supabase Synchronization

## Overview
Cart items are now synchronized with Supabase, ensuring persistence across sessions and devices for logged-in users.

## Implementation Details

### Database Table
- **Table Name**: `cart_items`
- **Schema**: See `create-cart-items-table.sql`
- **Columns**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key to auth.users)
  - `cart_data`: JSONB array containing cart items
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

### How It Works

#### 1. **Adding Product to Cart**
When a logged-in user adds a product to cart:
- ✅ Cart state updates in React context
- ✅ Saved to localStorage (backup)
- ✅ Automatically synced to Supabase `cart_items` table

Console logs:
```
StoreContext - Saving cart: [...]
StoreContext - Saved cart to localStorage
StoreContext - Syncing cart to Supabase for user: {userId}
StoreContext - Successfully synced cart to Supabase
```

#### 2. **Reloading the Page**
When a logged-in user reloads the page:
- ✅ Fetches cart from Supabase immediately (not localStorage)
- ✅ If no cart in Supabase, checks localStorage and syncs it
- ✅ Cart is restored with all items

Console logs:
```
StoreContext - Fetching cart from Supabase for user: {userId}
StoreContext - Supabase cart loaded: [...]
```

#### 3. **Guest Users (Not Logged In)**
When a user is not logged in:
- Cart is stored in localStorage only
- Upon login, localStorage cart is synced to Supabase
- After login, Supabase becomes the source of truth

### Key Files Modified

1. **src/context/StoreContext.tsx**
   - Added `fetchCartFromSupabase()` function (lines 173-213)
   - Modified mount useEffect to fetch cart from Supabase for logged-in users (lines 134-171)
   - Modified cart save useEffect to sync to Supabase (lines 266-291)
   - Added cart fetch on user login (lines 257-264)

2. **create-cart-items-table.sql** (New)
   - SQL migration to create the `cart_items` table
   - RLS policies for user-specific cart access
   - Indexes for performance

### Data Flow

```
User Action (Add/Remove/Update Cart Item)
    ↓
StoreContext Reducer Updates State
    ↓
useEffect Triggered (lines 266-291)
    ↓
├─→ Save to localStorage (backup)
└─→ If user logged in: Upsert to Supabase cart_items table
```

```
Page Reload
    ↓
StoreContext Mount useEffect (lines 134-171)
    ↓
Check if user is logged in
    ↓
├─→ YES: Fetch cart from Supabase → Load into state
└─→ NO: Load cart from localStorage → Load into state
```

### Migration Steps

Run the following SQL in your Supabase SQL Editor:

```sql
-- Execute the create-cart-items-table.sql file
```

This will:
1. Create the `cart_items` table
2. Set up Row Level Security policies
3. Create necessary indexes

### Testing

1. **Test Cart Sync**:
   - Login as a user
   - Add products to cart
   - Check console: "Successfully synced cart to Supabase"
   - Verify in Supabase dashboard: cart_items table has a row

2. **Test Cart Load on Reload**:
   - With items in cart, reload the page
   - Check console: "Supabase cart loaded: [...]"
   - Verify cart items appear in the cart

3. **Test Guest to Logged-In Migration**:
   - Logout (or use incognito)
   - Add items to cart (stored in localStorage)
   - Login
   - Cart should sync to Supabase
   - Check console: "Synced localStorage cart to Supabase"

### Benefits

✅ **Persistence**: Cart survives browser clears and device changes
✅ **Sync**: Same cart across multiple devices (when logged in)
✅ **Backup**: localStorage serves as backup for offline/guest users
✅ **Seamless Migration**: Guest carts automatically sync on login
✅ **Real-time**: Cart updates immediately sync to database

### Console Logs for Debugging

All cart operations log to console with prefix "StoreContext -":
- "Saving cart: [...]" - When cart changes
- "Syncing cart to Supabase for user: {userId}" - When syncing starts
- "Successfully synced cart to Supabase" - When sync succeeds
- "Fetching cart from Supabase for user: {userId}" - When loading cart
- "Supabase cart loaded: [...]" - When cart loaded from Supabase
- "No Supabase cart, using localStorage: [...]" - Fallback to localStorage
- "Synced localStorage cart to Supabase" - Migration from local to cloud

### Security

- Row Level Security (RLS) ensures users can only access their own cart
- All cart operations require authentication
- Guest users use localStorage until login
