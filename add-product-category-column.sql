-- Add product_category column to products table
-- This column stores the category filter value from the categories table's category array

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_category TEXT;

-- Add comment for documentation
COMMENT ON COLUMN products.product_category IS 'Category filter value from the parent category''s category array';
