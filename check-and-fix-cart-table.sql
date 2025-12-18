-- First, check if the cart_items table exists and its structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cart_items';

-- If the table exists but has wrong structure, drop it and recreate
DROP TABLE IF EXISTS cart_items CASCADE;

-- Create cart_items table with correct structure
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only read their own cart
CREATE POLICY "Users can view their own cart"
  ON cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own cart
CREATE POLICY "Users can insert their own cart"
  ON cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
CREATE POLICY "Users can update their own cart"
  ON cart_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own cart
CREATE POLICY "Users can delete their own cart"
  ON cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Add comment
COMMENT ON TABLE cart_items IS 'Stores user cart items as JSONB array';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cart_items'
ORDER BY ordinal_position;
