# Cart and Wishlist Data Structure

## Overview

Your e-commerce app has **TWO separate features** with **TWO separate tables**:

### 1. **Cart** → Stored in `cart_items` table
- **Purpose**: Store products user wants to purchase
- **Data Type**: JSONB array of cart items
- **Structure**: Each item contains product details + quantity

### 2. **Wishlist** → Stored in `wishlists` table
- **Purpose**: Store product IDs user has "favorited"
- **Data Type**: PostgreSQL text[] array
- **Structure**: Simple array of product IDs (strings)

---

## Table Structures

### `cart_items` Table
```sql
CREATE TABLE cart_items (
  user_id UUID PRIMARY KEY,           -- One cart per user
  cart_data JSONB NOT NULL,            -- Array of cart items
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Example Data:**
```json
{
  "user_id": "abc-123",
  "cart_data": [
    {
      "product": {
        "id": "prod-1",
        "name": "Water Purifier",
        "price": 15000,
        "image": "/images/purifier.jpg"
      },
      "quantity": 2
    },
    {
      "product": {
        "id": "prod-2",
        "name": "RO Filter",
        "price": 3000,
        "image": "/images/filter.jpg"
      },
      "quantity": 1
    }
  ]
}
```

---

### `wishlists` Table
```sql
CREATE TABLE wishlists (
  user_id UUID PRIMARY KEY,           -- One wishlist per user
  product_ids TEXT[] NOT NULL,        -- Array of product IDs
  updated_at TIMESTAMPTZ
);
```

**Example Data:**
```json
{
  "user_id": "abc-123",
  "product_ids": ["prod-5", "prod-12", "prod-23"]
}
```

---

## How It Works in the App

### Cart Flow:
1. User clicks "Add to Cart" button
2. `addToCart(product)` is called
3. Reducer adds product with quantity to `state.cart`
4. useEffect detects change, syncs to Supabase `cart_items` table
5. Full product object + quantity stored in `cart_data` JSONB column

### Wishlist Flow:
1. User clicks heart icon (♥)
2. `toggleWishlist(productId)` is called
3. Reducer toggles product ID in `state.wishlist` array
4. useEffect detects change, syncs to Supabase `wishlists` table
5. Just the product ID stored in `product_ids` text[] column

---

## Current Issue

The error shows:
```
Could not find the 'cart_data' column of 'cart_items' in the schema cache
```

**This means:**
- Either the `cart_items` table doesn't exist in Supabase
- OR it was created with a different structure (missing `cart_data` column)
- OR Supabase schema cache needs refresh

**Solution:**
Run [verify-and-recreate-cart-table.sql](verify-and-recreate-cart-table.sql) in Supabase SQL Editor to:
1. Check current table structure
2. Drop and recreate with correct structure
3. Add proper RLS policies
4. Verify it was created correctly

---

## Key Differences

| Feature | Table | Column | Data Type | Stores |
|---------|-------|--------|-----------|--------|
| **Cart** | `cart_items` | `cart_data` | JSONB | Full product objects + quantities |
| **Wishlist** | `wishlists` | `product_ids` | TEXT[] | Just product IDs |

Cart = "I want to buy these"
Wishlist = "I'm interested in these"
