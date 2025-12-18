# How to Run SQL in Supabase - Step by Step

## Visual Guide

```
Step 1: Go to Supabase Dashboard
┌─────────────────────────────────────────────────────────────┐
│  https://supabase.com/dashboard                              │
│                                                              │
│  Your Projects:                                              │
│  ┌──────────────────────┐                                   │
│  │  Your Project Name   │ ← Click this                      │
│  │  Active              │                                   │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘

Step 2: Find SQL Editor in Sidebar
┌─────────────────────────────────────────────────────────────┐
│  Left Sidebar:                                               │
│                                                              │
│  🏠 Home                                                     │
│  📊 Table Editor                                             │
│  🔍 Database                                                 │
│  </> SQL Editor        ← Click this!                         │
│  🔐 Authentication                                           │
│  📦 Storage                                                  │
└─────────────────────────────────────────────────────────────┘

Step 3: Create New Query
┌─────────────────────────────────────────────────────────────┐
│  SQL Editor Page:                                            │
│                                                              │
│  [+ New query]  ← Click this button                          │
│                                                              │
│  Or:                                                         │
│  Click "New query" in the top right corner                   │
└─────────────────────────────────────────────────────────────┘

Step 4: Paste SQL
┌─────────────────────────────────────────────────────────────┐
│  Query Editor:                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ DROP TABLE IF EXISTS cart_items CASCADE;              │  │
│  │                                                       │  │
│  │ CREATE TABLE cart_items (                            │  │
│  │   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,     │  │
│  │   user_id UUID NOT NULL REFERENCES auth.users...    │  │
│  │   cart_data JSONB NOT NULL DEFAULT '[]'::jsonb,     │  │
│  │   ...                                                │  │
│  │                                                       │  │
│  │ [Paste the entire SQL here]                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  [Run] button (green play icon) ← Click this!                │
└─────────────────────────────────────────────────────────────┘

Step 5: Check Results
┌─────────────────────────────────────────────────────────────┐
│  Results:                                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Success                                               │  │
│  │                                                       │  │
│  │ column_name  | data_type | is_nullable               │  │
│  │ -------------|-----------|------------               │  │
│  │ id           | uuid      | NO                        │  │
│  │ user_id      | uuid      | NO                        │  │
│  │ cart_data    | jsonb     | NO         ← LOOK FOR THIS!│  │
│  │ created_at   | timestamp | YES                       │  │
│  │ updated_at   | timestamp | YES                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ✅ If you see "cart_data" in the results, it worked!        │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Steps

### Step 1: Access Supabase Dashboard
1. Open your browser
2. Go to: https://supabase.com/dashboard
3. If not logged in, log in with your Supabase account
4. You'll see a list of your projects

### Step 2: Select Your Project
1. Find your project in the list (the one you're using for this app)
2. Click on the project name to open it
3. You'll be taken to the project dashboard

### Step 3: Open SQL Editor
1. Look at the left sidebar
2. Find the item labeled **"SQL Editor"** (usually has a `</>` or code icon)
3. Click on it
4. The SQL Editor interface will open

### Step 4: Create a New Query
1. You'll see a button labeled **"New query"** or **"+ New query"**
2. Click it
3. A blank text area will appear where you can write/paste SQL

### Step 5: Get the SQL
1. Open the file: **`FIX_CART_TABLE_NOW.sql`** (in your project folder)
2. Select all the text (Ctrl+A)
3. Copy it (Ctrl+C)

### Step 6: Paste and Run
1. Click in the SQL Editor text area
2. Paste the SQL (Ctrl+V)
3. You should see the entire SQL script
4. Find the **"Run"** button (usually a green play icon or button)
5. Click **"Run"**

### Step 7: Wait for Completion
1. The query will execute
2. You'll see a loading indicator
3. After a few seconds, you'll see results

### Step 8: Verify Success
Look for the results table showing:
```
column_name  | data_type
-------------|----------
id           | uuid
user_id      | uuid
cart_data    | jsonb      ← THIS IS CRITICAL!
created_at   | timestamp with time zone
updated_at   | timestamp with time zone
```

**If you see `cart_data` with type `jsonb`, SUCCESS!** ✅

### Step 9: Verify in Table Editor (Optional)
1. Click **"Table Editor"** in the left sidebar
2. Find **"cart_items"** in the table list
3. Click on it
4. You should see the table structure with the `cart_data` column

### Step 10: Test Your Application
1. Go back to your application in the browser
2. Press **Ctrl+Shift+R** (hard refresh to clear cache)
3. Log in to your account
4. Add an item to the cart
5. Check the browser console:
   - Should see: ✅ "Cart synced to Supabase"
   - Should NOT see: ❌ "Could not find the 'cart_data' column"

## Troubleshooting

### Problem: Can't Find SQL Editor
**Solution**: Look for these possible names in the sidebar:
- "SQL Editor"
- "SQL"
- "Query Editor"
- Icon that looks like `</>`

### Problem: "Permission denied"
**Solution**: Make sure you're logged in as the project owner or have the correct permissions.

### Problem: "Policies already exist"
**Solution**: The script handles this automatically. Ignore the warning and check if the table was created correctly.

### Problem: Still Getting Errors After Running
**Solution**:
1. Hard refresh your browser (Ctrl+Shift+R)
2. Clear browser cache
3. Verify in Supabase Table Editor that the `cart_items` table has the `cart_data` column
4. Check the browser console for any new errors

### Problem: "Table 'cart_items' already exists"
**Solution**: The SQL script starts with `DROP TABLE IF EXISTS cart_items CASCADE`, so this shouldn't happen. If it does, run this first:
```sql
DROP TABLE IF EXISTS cart_items CASCADE;
```
Then run the full script again.

## What Happens After You Run This:

### Before (Current State):
- ❌ Error: "Could not find the 'cart_data' column"
- ❌ Cart doesn't save to Supabase
- ❌ Cart disappears on reload

### After (Fixed State):
- ✅ No errors
- ✅ Cart saves to Supabase automatically
- ✅ Cart persists after page reload
- ✅ Cart restores after logout/login
- ✅ Wishlist also works perfectly

## Files Reference

- **[FIX_CART_TABLE_NOW.sql](FIX_CART_TABLE_NOW.sql)** - The SQL to copy and paste
- **[COPY_PASTE_THIS_SQL.md](COPY_PASTE_THIS_SQL.md)** - Quick instructions
- **[CART_FIX_VISUAL_GUIDE.md](CART_FIX_VISUAL_GUIDE.md)** - Visual diagrams

## Summary

1. **Open**: Supabase Dashboard → SQL Editor
2. **Copy**: Contents of `FIX_CART_TABLE_NOW.sql`
3. **Paste**: Into SQL Editor
4. **Click**: Run button
5. **Verify**: See `cart_data` column in results
6. **Refresh**: Your application
7. **Test**: Add to cart
8. **Success**: No more errors! ✅

This is the ONLY way to fix the database structure issue. Once done, everything will work perfectly! 🎉
