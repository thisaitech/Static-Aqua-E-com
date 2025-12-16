# Top Deals System - Setup Guide

## Overview
Admin-managed Top Deals section for the homepage. Admin controls WHAT is shown, user UI controls HOW it's shown.

## ✅ What Was Created

### 1. Database Table
**File**: `create-top-deals-table.sql`

**Table**: `top_deals`
- Stores deal cards for homepage
- RLS policies: Public can view active deals, Admins can manage all
- Pre-populated with existing static deals

**Fields**:
- `title` - Deal headline (e.g., "Ultra Clear Tanks")
- `discount` - Offer text (e.g., "Up to 30% Off")
- `image_url` - Card background image
- `category_slug` - Links to `/category/{slug}` (preferred)
- `custom_link` - Alternative custom URL
- `icon_name` - Icon identifier (fish, bird, leaf, zap, etc.)
- `bg_color` - Tailwind gradient classes
- `is_active` - Show/hide toggle
- `display_order` - Sorting order

### 2. Admin Management Page
**Path**: `/admin/top-deals`
**File**: `src/app/admin/top-deals/page.tsx`

**Features**:
✅ Add/Edit/Delete deals
✅ Toggle active/inactive (show/hide)
✅ Visual preview of each deal card
✅ Category dropdown (links to category pages)
✅ Custom link option (alternative to category)
✅ Icon selector (8 options with emoji preview)
✅ Gradient color selector (8 color schemes)
✅ Image URL with live preview
✅ Mobile-responsive design

**Admin Can**:
- Create new deals
- Edit existing deals
- Hide/show deals instantly
- Delete deals with confirmation
- See live preview of how card looks
- Link to any category or custom URL

### 3. User-Facing Component
**File**: `src/components/home/CategoryCards.tsx`

**Changes**:
✅ Fetches deals from `top_deals` table
✅ Fallback to static deals (if database empty/fails)
✅ **NO UI CHANGES** - layout, animations, styles unchanged
✅ Dynamic icon rendering based on `icon_name`
✅ Dynamic link generation (category_slug or custom_link)
✅ Respects `display_order` for sorting

**User Experience**:
- Sees deals from database automatically
- If admin makes changes → instantly reflected on refresh
- If database fails → shows original static deals
- Click behavior unchanged (navigates to category/link)

### 4. Admin Navigation
**File**: `src/app/admin/layout.tsx`

Added "Top Deals" 🔥 menu item between Hero Banners and Orders

## 🚀 Setup Steps

### Step 1: Create Database Table
Run in Supabase SQL Editor:
```bash
create-top-deals-table.sql
```

This will:
- Create `top_deals` table
- Set up RLS policies
- Insert your existing 4 static deals
- Enable immediate use

### Step 2: Verify Data
Check Supabase dashboard:
- Table `top_deals` should exist
- Should have 4 rows (your existing deals)
- All should have `is_active = true`

### Step 3: Access Admin Page
1. Login to admin panel
2. Click "Top Deals" 🔥 in sidebar
3. You should see your 4 existing deals
4. Try editing one to test

### Step 4: Test User Side
1. Visit homepage
2. Scroll to "Top Deals" section
3. Should look exactly the same
4. Click a card → should navigate correctly

## 📝 How To Use

### Add New Deal:
1. Go to `/admin/top-deals`
2. Click "Add Deal"
3. Fill in:
   - **Title**: Deal headline
   - **Offer Text**: Discount/promotion text
   - **Image URL**: Background image
   - **Category**: Select from dropdown (recommended)
   - **Icon**: Choose from 8 options
   - **Gradient**: Choose color scheme
4. Click "Create Deal"

### Edit Existing Deal:
1. Find deal card in grid
2. Click "Edit" button
3. Modify any fields
4. Click "Update Deal"

### Hide/Show Deal:
- Click "Hide" to remove from homepage (stays in database)
- Click "Show" to display again
- Instant effect on user side

### Delete Deal:
- Click trash icon 🗑️
- Confirm deletion
- Permanently removed

## 🎨 Design Options

### Icons Available:
- 🐟 Fish
- 🦜 Bird
- 🌿 Plant
- ⚡ Lightning
- 📦 Package
- 🎁 Gift
- ⭐ Star
- ❤️ Heart

### Gradient Colors:
- Blue (aqua theme)
- Green (plant theme)
- Purple (accessories)
- Orange (birds)
- Red
- Pink
- Teal
- Indigo

## 🔗 Link Options

**Option 1: Category Link** (Recommended)
- Select category from dropdown
- Auto-generates `/category/{slug}`
- User clicks → goes to category page

**Option 2: Custom Link**
- Enter any URL: `/custom-page` or external URL
- Use for special promotions, landing pages

**Priority**: Category slug takes priority over custom link

## ⚠️ Important Rules

### What Stays The Same (User UI):
✅ Card layout and size
✅ Animations (fade-in, hover effects)
✅ Grid layout (2 cols mobile, 4 cols desktop)
✅ Icon badge styling
✅ Text positioning
✅ Hover effects
✅ Responsive behavior

### What Changes (Content Only):
- Card title text
- Offer/discount text
- Background image
- Icon in badge
- Gradient color overlay
- Link destination
- Number of cards shown

## 🔄 Fallback System

**Database-First Approach**:
1. Tries to fetch from `top_deals` table
2. If successful → shows database deals
3. If fails or empty → shows static deals
4. User never sees broken UI

**Static Fallback** (preserved in code):
- Original 4 deals always available
- Exact same data as before
- Activates only if database unavailable

## 📊 Data Flow

```
Admin adds deal → Supabase top_deals table → User homepage
                     ↓ (if fails)
                  Static fallback (original 4 deals)
```

## 🎯 Benefits

✅ **Admin Control**: Change deals anytime without code
✅ **No Code Changes**: Update content via admin panel
✅ **Safe Fallback**: Original deals preserved
✅ **Zero Downtime**: Database failure → shows static
✅ **Instant Updates**: Admin saves → users see on refresh
✅ **SEO Friendly**: Links to category pages
✅ **Mobile Ready**: Responsive on all devices

## 🧪 Testing Checklist

### Admin Side:
- [ ] Can add new deal
- [ ] Can edit existing deal
- [ ] Can delete deal with confirmation
- [ ] Can hide/show deals instantly
- [ ] Preview card looks correct
- [ ] Image preview works
- [ ] Category dropdown populated
- [ ] Icon selector works
- [ ] Gradient selector shows preview

### User Side:
- [ ] Top Deals section appears on homepage
- [ ] Cards display correctly (2 mobile, 4 desktop)
- [ ] Images load properly
- [ ] Gradients applied correctly
- [ ] Icons show in badges
- [ ] Click navigates to correct page
- [ ] Hover effects work
- [ ] Animations smooth

### Data Flow:
- [ ] Admin changes reflect on refresh
- [ ] Hidden deals don't appear on homepage
- [ ] Fallback works if database empty
- [ ] Ordering respects display_order

## 📚 Files Modified/Created

### New Files:
1. `create-top-deals-table.sql` - Database schema
2. `src/app/admin/top-deals/page.tsx` - Admin management UI

### Modified Files:
1. `src/components/home/CategoryCards.tsx` - Made DealsBanner dynamic
2. `src/app/admin/layout.tsx` - Added menu item

### Total Changes:
- 1 new table
- 1 new admin page
- 2 files modified
- 0 user UI changes

## 🎉 Result

Admin can now:
- Manage all Top Deals from admin panel
- Add unlimited deals (not just 4)
- Change content anytime
- Control visibility
- Reorder deals
- Update images and colors
- Link to any category

Users see:
- Same beautiful UI
- Updated content from admin
- No loading delays
- Reliable fallback

## 🔜 Future Enhancements

### Phase 2 (Optional):
- [ ] Drag-and-drop reordering
- [ ] Schedule deals (start/end dates)
- [ ] A/B testing different deals
- [ ] Analytics (click tracking)
- [ ] Bulk upload via CSV
- [ ] Image upload to Supabase Storage
- [ ] Deal templates
- [ ] Duplicate deal feature

## 📞 Support

If deals don't appear:
1. Check Supabase table has data
2. Check RLS policies active
3. Check browser console for errors
4. Verify fallback static deals show

The system is production-ready and maintains all existing functionality while adding powerful admin control! 🚀
