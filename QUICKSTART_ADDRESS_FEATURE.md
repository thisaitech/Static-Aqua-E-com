# 🚀 Quick Start - Address Persistence Feature

## ⚡ 5-Minute Setup Guide

### Step 1: Verify Database Setup (2 minutes)
1. Open Supabase Dashboard → SQL Editor
2. Run [VERIFY_ADDRESS_SETUP.sql](VERIFY_ADDRESS_SETUP.sql)
3. Check that all queries return expected results
4. If `user_addresses` table doesn't exist, run [create-user-addresses-table-final.sql](create-user-addresses-table-final.sql)

### Step 2: Start Development Server (1 minute)
```bash
npm run dev
```
Server should start on http://localhost:3001 (or 3000)

### Step 3: Test the Feature (2 minutes)
1. **Login/Register** as a test user
2. **Add items to cart** (any product)
3. **Go to checkout**
   - First time: No dropdown, fill form manually
   - Place order → Address auto-saved!
4. **Return to checkout**
   - Dropdown appears with saved address ✨
   - Pre-filled automatically
5. **Add another address**
   - Select "+ Add New Address" from dropdown
   - Enter new details
   - Place order → Now you have 2 addresses!

---

## 🎯 What to Look For

### ✅ Success Indicators

**First Order**:
- Form is empty (no dropdown)
- Fill manually
- Console log: `"New address saved to user_addresses table: [uuid]"`
- Order succeeds

**Second Order**:
- Dropdown appears at top of form
- Default address pre-selected
- Form pre-filled
- Can switch between addresses
- Console log: `"Using existing address: [uuid]"` (no duplicate save!)

### ❌ If Something's Wrong

**Dropdown doesn't appear on 2nd visit**:
```bash
# Check console for errors
# Verify API call: Network tab → /api/addresses
# Should return: { addresses: [...] }
```

**Address not saved**:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_addresses WHERE user_id = auth.uid();
-- Should show your address after order
```

**Duplicate addresses being created**:
```javascript
// Check console logs:
// Should see "Using existing address" NOT "New address saved"
```

---

## 📱 Quick Test Scenarios

### Test #1: Brand New User (30 seconds)
```
1. Fresh login → Checkout
   Expected: ❌ No dropdown
2. Fill address → Place order
   Expected: ✅ "New address saved" in console
3. Back to checkout
   Expected: ✅ Dropdown appears!
```

### Test #2: Multiple Addresses (1 minute)
```
1. Checkout → Dropdown exists
   Expected: ✅ See saved address
2. Select "+ Add New Address"
   Expected: ✅ Form clears
3. Enter different address → Order
   Expected: ✅ "New address saved"
4. Return to checkout
   Expected: ✅ Dropdown shows both addresses
5. Switch between them
   Expected: ✅ Form updates instantly
```

### Test #3: No Duplicates (30 seconds)
```
1. Checkout → Select existing address
2. Don't change anything → Order
   Expected: ✅ Console: "Using existing address"
   Expected: ❌ NOT "New address saved"
3. Check Supabase
   Expected: ✅ Same number of addresses (no duplicate)
```

---

## 🔍 Debug Checklist

If something doesn't work:

- [ ] Database table exists: Run `SELECT * FROM user_addresses LIMIT 1;`
- [ ] RLS policies active: Check Supabase → Authentication → Policies
- [ ] User is logged in: Check `useStore().user` in console
- [ ] API route accessible: Visit `/api/addresses` (should return 401 or data)
- [ ] Console logs show: "User addresses loaded from..."
- [ ] Network tab shows: GET /api/addresses returns 200

---

## 📊 Quick Verification in Supabase

```sql
-- 1. Check if table exists
SELECT COUNT(*) FROM user_addresses;

-- 2. See all addresses for logged-in user
SELECT full_name, city, is_default, created_at
FROM user_addresses
WHERE user_id = auth.uid()
ORDER BY is_default DESC;

-- 3. Verify only 1 default per user
SELECT user_id, COUNT(*) as default_count
FROM user_addresses
WHERE is_default = true
GROUP BY user_id
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- 4. Check recent orders with addresses
SELECT o.customer_name, o.total_amount, a.city
FROM orders o
LEFT JOIN user_addresses a ON o.address_id = a.id
ORDER BY o.created_at DESC
LIMIT 5;
```

---

## 🎨 UI States Quick Reference

| Scenario | Dropdown Visible? | Form State |
|----------|------------------|------------|
| New user (0 addresses) | ❌ No | Empty |
| Has 1 address | ✅ Yes | Pre-filled with default |
| Has 3 addresses | ✅ Yes | Pre-filled with default |
| Clicked "+ Add New" | ✅ Yes | Cleared for input |
| Selected different address | ✅ Yes | Updated with selection |

---

## 📝 Console Logs Reference

**Good Logs** (Everything Working):
```
✅ "User addresses loaded from user_addresses table: 2"
✅ "Using existing address: abc-123"
✅ "New address saved to user_addresses table: xyz-789"
✅ "Verifying payment for order: [orderId]"
```

**Error Logs** (Need Attention):
```
❌ "Error loading user addresses: ..."
❌ "Error saving address: ..."
❌ "Unauthorized" or 401 errors
```

---

## 🚀 Ready to Go!

**Current Status**: ✅ **Implementation Complete**

**Files Modified**: 1 main file ([checkout/page.tsx](src/app/checkout/page.tsx))

**Database Setup**: Run [create-user-addresses-table-final.sql](create-user-addresses-table-final.sql) if not already done

**Testing Time**: 5 minutes for full coverage

**Production Ready**: Yes ✅

---

## 📚 Full Documentation

For detailed information, see:
- [ADDRESS_IMPLEMENTATION_SUMMARY.md](ADDRESS_IMPLEMENTATION_SUMMARY.md) - Complete overview
- [ADDRESS_PERSISTENCE_GUIDE.md](ADDRESS_PERSISTENCE_GUIDE.md) - Technical details
- [ADDRESS_FEATURE_VISUAL_GUIDE.md](ADDRESS_FEATURE_VISUAL_GUIDE.md) - Visual flows
- [VERIFY_ADDRESS_SETUP.sql](VERIFY_ADDRESS_SETUP.sql) - Database checks

---

## ❓ Need Help?

**Check these first**:
1. Browser console logs
2. Supabase logs (Dashboard → Logs)
3. Network tab (API calls)
4. Database queries (SQL Editor)

**Common Issues**:
- 401 Unauthorized → User not logged in
- No dropdown → No saved addresses yet (or API error)
- Duplicate saves → `isNewAddress` flag not working (check console)

---

**Happy Testing! 🎉**

Your users can now save and reuse addresses seamlessly!
