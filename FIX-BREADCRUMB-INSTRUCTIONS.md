# Fix Breadcrumb Category Name Issue

## Problem
When clicking a category from the admin panel (e.g., "Fish Tanks"), the breadcrumb on the category page shows the static data name (e.g., "Fish Tanks & Aquascaping") instead of the database category name.

## Solution
Add a `slug` column to the categories table and use it to match categories between the static data and database.

## Steps to Fix

### 1. Run the SQL Migration
Run the file `add-slug-to-categories.sql` in your Supabase SQL Editor:

```sql
-- This will:
-- 1. Add slug column to categories table
-- 2. Create unique index on slug
-- 3. Auto-populate slugs for existing categories
```

**Important:** After running the migration, check your categories in Supabase to verify the slugs are correct:
- "Fish Tanks" → slug: `fish-tanks`
- "Fish" → slug: `fish`
- "Plants" → slug: `aquatic-plants`
- etc.

### 2. Update Existing Categories (if needed)
If you already have categories in the database without slugs, the migration will auto-generate them. But you should verify and update them manually if needed:

1. Go to Admin → Categories
2. Edit each category
3. You'll now see a "Slug (URL)" field
4. Make sure the slug matches the static data slug from `src/data/products.ts`
   - Example: For "Fish Tanks", the slug should be `fish-tanks` (same as in static data)

### 3. How It Works Now

**Before:**
- Database query: `WHERE name = 'Fish Tanks & Aquascaping'` ❌ (no match)
- Falls back to static data name

**After:**
- Database query: `WHERE slug = 'fish-tanks'` ✓ (matches!)
- Shows database category name: "Fish Tanks"

### 4. Creating New Categories
When creating new categories in the admin panel:
1. Enter the category name (e.g., "Fish Tanks")
2. The slug will auto-generate (e.g., "fish-tanks")
3. You can customize the slug if needed
4. Make sure the slug matches the corresponding category in static data

## Files Modified
1. `add-slug-to-categories.sql` - SQL migration to add slug column
2. `src/app/category/[slug]/CategoryPageClient.tsx` - Query by slug instead of name
3. `src/app/admin/categories/page.tsx` - Added slug field to category form

## Testing
1. Run the SQL migration
2. Edit your "Fish Tanks" category and set slug to `fish-tanks`
3. Go to the category page (home → click Fish Tanks)
4. The breadcrumb should now show "Fish Tanks" (database name) instead of "Fish Tanks & Aquascaping" (static data name)
