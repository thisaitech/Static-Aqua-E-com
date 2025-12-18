-- Fix offer_type error by removing triggers and adding column as nullable
-- Run this in Supabase SQL Editor

-- Step 1: Check for any triggers on products table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'products';

-- Step 2: Add offer_type column as nullable (so it doesn't cause errors)
-- This won't break anything since it's nullable
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_type text;

-- Step 3: If you find any triggers from Step 1 that reference offer_type,
-- drop them using this pattern:
-- DROP TRIGGER IF EXISTS trigger_name_here ON products;

-- Example:
-- DROP TRIGGER IF EXISTS set_offer_type ON products;
-- DROP TRIGGER IF EXISTS calculate_offer_type ON products;
