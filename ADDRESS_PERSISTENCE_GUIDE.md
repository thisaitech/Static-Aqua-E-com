# Address Persistence - Implementation Guide

## ✅ What Has Been Implemented

The address persistence system is now fully functional with the following features:

### 1. **Automatic Address Storage**
- When a user enters an address for the first time during checkout, it's automatically saved to the `user_addresses` table
- The first address is automatically marked as default
- Subsequent addresses are stored but not set as default

### 2. **Address Selection UI**
- Returning users see a dropdown at the top of the checkout form
- The dropdown shows all saved addresses with their details
- Format: `Name - Address, City, District - PIN Code (Default)`
- Users can select any saved address from the dropdown

### 3. **Add New Address Option**
- The dropdown includes "+ Add New Address" option at the bottom
- Selecting this clears the form for entering a new address
- New addresses are saved when the order is placed

### 4. **Smart Save Logic**
- **Existing Address Selected**: No duplicate save - uses the selected address ID
- **New Address Entered**: Saves to database and returns the new address ID
- Both scenarios link the address to the order via `address_id` column

### 5. **Default Address Behavior**
- First address is auto-set as default
- Default address is pre-selected on checkout page load
- Only one address can be default (enforced by database trigger)

## 🗄️ Database Structure

### Table: `user_addresses`
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- full_name (TEXT)
- phone (TEXT)
- email (TEXT)
- address (TEXT)
- city (TEXT)
- district (TEXT)
- pin_code (TEXT)
- is_default (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table: `orders`
```sql
- address_id (UUID, Foreign Key to user_addresses)
  [Links each order to the address used]
```

## 🔄 User Flow

### First-Time User Flow:
1. User goes to checkout
2. Sees empty shipping form (no dropdown shown)
3. Enters address details
4. Places order
5. **Address is automatically saved** to `user_addresses`
6. Order is created with `address_id` linking to saved address

### Returning User Flow:
1. User goes to checkout
2. Sees dropdown with all saved addresses
3. Default address is pre-selected and form is pre-filled
4. User can either:
   - **Keep selected address**: Uses existing address (no duplicate save)
   - **Select different saved address**: Switches to that address
   - **Select "+ Add New Address"**: Clears form to enter new address
5. Places order with selected/new address

## 🎯 Key Features

### ✅ No UI Changes
- Existing form design remains identical
- Address dropdown appears seamlessly above the form fields
- Form fields are still editable (useful for one-time changes without saving)

### ✅ Backend-Driven
- All logic handled by Supabase and API routes
- Row Level Security (RLS) ensures users only see their own addresses
- Database triggers manage default address uniqueness

### ✅ Multiple Addresses Support
- Users can save unlimited addresses
- Each address is a separate record
- Easy to select between home, office, etc.

### ✅ No Duplicates
- `isNewAddress` flag tracks if user is adding new vs using existing
- Only saves to database when:
  - User explicitly selects "+ Add New Address"
  - User has no saved addresses
- Prevents duplicate saves of existing addresses

## 📁 Files Modified

### 1. [src/app/checkout/page.tsx](src/app/checkout/page.tsx)
- Added `savedAddresses` state to store all user addresses
- Added `isNewAddress` flag to track new vs existing address selection
- Added `handleAddressSelect()` function for dropdown change handling
- Added address selection dropdown UI (only shown if savedAddresses.length > 0)
- Updated `loadUserAddresses()` to fetch all addresses, not just default
- Updated `handlePlaceOrder()` to only save new addresses

### 2. [src/app/api/addresses/route.ts](src/app/api/addresses/route.ts)
- GET: Fetches all user addresses (ordered by default, then creation date)
- POST: Creates new address with validation

### 3. [src/app/api/addresses/[id]/route.ts](src/app/api/addresses/[id]/route.ts)
- PATCH: Updates existing address
- DELETE: Deletes address
- GET: Fetches single address by ID

### 4. Database (SQL files available)
- [create-user-addresses-table-final.sql](create-user-addresses-table-final.sql)
  - Creates `user_addresses` table with RLS policies
  - Adds triggers for default address management
  - Adds `address_id` to orders table

## 🧪 Testing Instructions

### Test 1: First-Time User
1. Login as a new user (no saved addresses)
2. Add items to cart
3. Go to checkout
4. **Expected**: No address dropdown shown
5. Fill in shipping details
6. Complete order
7. **Expected**: Address is saved to database
8. Return to checkout
9. **Expected**: Address dropdown appears with the saved address pre-selected

### Test 2: Existing Address Selection
1. Login as user with saved addresses
2. Go to checkout
3. **Expected**: Dropdown shows all saved addresses
4. **Expected**: Default address is pre-selected and form is pre-filled
5. Select different address from dropdown
6. **Expected**: Form updates with selected address details
7. Complete order
8. **Expected**: No new address saved (uses existing)

### Test 3: Add New Address (Returning User)
1. Login as user with saved addresses
2. Go to checkout
3. Select "+ Add New Address" from dropdown
4. **Expected**: Form clears
5. Enter new address details
6. Complete order
7. **Expected**: New address is saved
8. Return to checkout
9. **Expected**: Both old and new addresses appear in dropdown

### Test 4: Multiple Addresses
1. Create 3-4 different addresses using the flow above
2. **Expected**: All addresses appear in dropdown
3. **Expected**: Default address (marked with "(Default)") is pre-selected
4. Switch between addresses
5. **Expected**: Form updates correctly for each selection

## 🔍 Console Logs for Debugging

When testing, check the browser console for these logs:

```javascript
// On page load
"User addresses loaded from user_addresses table: 3"

// When selecting existing address
"Using existing address: abc-123-def-456"

// When saving new address
"New address saved to user_addresses table: xyz-789-ghi-012"
```

## 🛠️ API Endpoints

### GET `/api/addresses`
Fetches all addresses for authenticated user
```json
Response: {
  "addresses": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com",
      "address": "123 Main St",
      "city": "Chennai",
      "district": "Chennai",
      "pin_code": "600001",
      "is_default": true
    }
  ]
}
```

### POST `/api/addresses`
Creates new address
```json
Request: {
  "full_name": "Jane Doe",
  "phone": "9876543210",
  "email": "jane@example.com",
  "address": "456 Park Ave",
  "city": "Coimbatore",
  "district": "Coimbatore",
  "pin_code": "641001",
  "is_default": false
}

Response: {
  "address": { ...created address }
}
```

### PATCH `/api/addresses/[id]`
Updates existing address

### DELETE `/api/addresses/[id]`
Deletes address

## ✨ Benefits

1. **User Convenience**: No need to re-enter address every time
2. **Faster Checkout**: One-click address selection
3. **Multiple Addresses**: Support for home, office, etc.
4. **Data Integrity**: Address linked to order for future reference
5. **No Duplicates**: Smart logic prevents redundant saves
6. **Seamless UX**: UI unchanged, dropdown appears naturally

## 🚀 Future Enhancements (Optional)

If you want to add more features in the future:

1. **Address Management Page**
   - Create `/profile/addresses` page
   - Allow users to add/edit/delete addresses outside checkout
   - Set default address

2. **Address Validation**
   - PIN code validation against city/district
   - Google Maps API integration for address autocomplete

3. **Address Labels**
   - Add `label` field (Home, Office, Other)
   - Show icon in dropdown

4. **Quick Edit**
   - Edit button next to selected address in dropdown
   - Update address without creating new one

## ⚠️ Important Notes

- The UI design has NOT changed - dropdown blends naturally with existing design
- Form fields remain editable even when address is selected (for one-time modifications)
- Database triggers ensure only one default address per user
- RLS policies ensure users can only access their own addresses
- Address save is non-blocking - order still proceeds if address save fails

---

**Status**: ✅ Fully Implemented and Ready for Testing
**Last Updated**: 2025-12-18
