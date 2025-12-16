-- Add category field to categories table (similar to types)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS category TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment to explain the column
COMMENT ON COLUMN categories.category IS 'Additional category classifications for filtering products';
