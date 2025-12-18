-- Fix cart_items table to ensure one cart per user
-- Run this in Supabase SQL Editor

-- First, delete any duplicate rows (keep only the most recent)
DELETE FROM cart_items
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM cart_items
  ORDER BY user_id, updated_at DESC
);

-- Add unique constraint on user_id
ALTER TABLE cart_items
ADD CONSTRAINT cart_items_user_id_unique UNIQUE (user_id);

-- Verify the constraint was added
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'cart_items'::regclass
AND conname = 'cart_items_user_id_unique';
