# Fix Admin Dashboard - Orders & Revenue Not Showing

## Problem
The admin dashboard shows:
- Completed Orders: 0 (but Supabase shows 3)
- Total Revenue: ₹0 (but Supabase shows ₹7,232)

## Root Cause
The `orders` table has Row Level Security (RLS) policies that only allow users to see their own orders. The admin user cannot see ALL orders because the RLS policy blocks them.

## Solution

### Step 1: Run the SQL Fix
1. Go to Supabase Dashboard → SQL Editor
2. Open the file: `FIX_ADMIN_ORDERS_ACCESS.sql`
3. Copy all the SQL code
4. Paste it into Supabase SQL Editor
5. Click "Run"

This will:
- Remove the old restrictive SELECT policy
- Create a new policy that allows:
  - Regular users to see only their own orders
  - Admin users to see ALL orders

### Step 2: Verify the Fix
After running the SQL, check the test query results at the bottom. You should see:
```
total_orders: 3
completed_orders: 3
total_revenue: 7232
```

### Step 3: Refresh Admin Dashboard
1. Go to your admin dashboard: `/admin/dashboard`
2. Refresh the page (F5)
3. Check browser console (F12 → Console tab)
4. Look for logs:
   - "Orders query result:" - should show your 3 orders
   - "Dashboard Stats:" - should show correct numbers

## Expected Result
After the fix:
- **Completed Orders**: 3
- **Total Revenue**: ₹7,232
- **New Arrivals**: Count of products where `is_new = TRUE`
- **Out of Stock**: Count of products where `stock_status = 'out_of_stock'`

## Technical Details

### What the Fix Does
The new RLS policy checks:
1. Is the current user viewing their own order? → Allow
2. Is the current user an admin (role = 'admin')? → Allow ALL orders

### SQL Policy Created
```sql
CREATE POLICY "Users and admins can view orders"
  ON orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

## Troubleshooting

### If it still shows 0 after running SQL:
1. Check browser console for errors
2. Verify your user has `role = 'admin'` in the `users` table:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
   ```
3. If role is not 'admin', update it:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### If you see RLS errors in console:
- The policy might not have been created correctly
- Re-run the SQL fix
- Check that RLS is enabled on the orders table

## Next Steps
Once this is working:
1. All dashboard cards will show real data from Supabase
2. The stats will update in real-time as orders are placed
3. Admin can see all orders in the Orders page too
