-- Add all missing offer-related columns to stop errors
-- Run this in Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_type text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_value numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_text text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_description text;

-- These columns are now nullable and won't cause any errors
