-- Update categories table to store types as JSON array instead of separate table
-- This simplifies the data structure

-- Add types column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS types TEXT[] DEFAULT '{}';

-- Migrate existing data from category_types to categories.types
-- This will convert the separate type records into a JSON array in the parent category
UPDATE categories c
SET types = (
  SELECT ARRAY_AGG(ct.name ORDER BY ct.display_order)
  FROM category_types ct
  WHERE ct.category_id = c.id
);

-- Optional: Drop the category_types table if you no longer need it
-- CAREFUL: This will permanently delete the separate types table
-- Uncomment the line below only if you're sure:
-- DROP TABLE IF EXISTS category_types CASCADE;

-- Optional: Remove type_id from products table if you're not using type filtering
-- Uncomment if you want to remove type relationships:
-- ALTER TABLE products DROP COLUMN IF EXISTS type_id;

-- Update RLS policies if needed (categories table policies already exist)
