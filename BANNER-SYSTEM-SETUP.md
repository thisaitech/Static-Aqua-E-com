# Hero Banner Management System

## Overview

This system provides a complete admin interface for managing dynamic hero banners and bottom icons. All content is stored in Supabase and automatically reflects on the user-facing website.

## Features

### Hero Banner Management
- ✅ Add/Edit/Delete banners
- ✅ Image upload (desktop/mobile)
- ✅ Text management (title, subtitle, badge, button)
- ✅ Background color selection
- ✅ Display order management
- ✅ Active/Inactive toggle
- ✅ Auto-refresh on website

### Banner Icons Management
- ✅ Add/Edit/Delete bottom icons
- ✅ Icon selection (Fish, Bird, Leaf, Zap, etc.)
- ✅ Link management (category/page/URL)
- ✅ Display order management
- ✅ Active/Inactive toggle

## Integration with Products.ts

The hero banner system is now fully integrated with your existing category data in `src/data/products.ts`:

- **Automatic Category Detection**: Banners automatically use category names, descriptions, and slugs from products.ts
- **Live Plants Integration**: The 'live-plants' category (id: 'live-plants') is automatically connected
- **Admin Validation**: Admin panel validates category links against your products.ts categories
- **Fallback System**: If Supabase is unavailable, banners fall back to products.ts category data

### Connected Categories

The following categories from products.ts are connected to the hero banners:

- **live-plants**: "Live Plants & ADA Products" 
- **fish-tanks**: "Fish Tanks & Aquariums"
- **co2-lighting**: "CO2, Lighting, Filtration, Air Pumps"
- **live-fish**: "Live Fish & Aquatic Life"
- And all other categories in your products.ts file

## Database Setup

### 1. Create Tables in Supabase

Run the following SQL in your Supabase SQL Editor:

