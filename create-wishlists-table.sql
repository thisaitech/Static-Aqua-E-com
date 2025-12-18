-- Create wishlists table for user wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  product_ids text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Only user can read/write their wishlist
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view own wishlist" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can update own wishlist" ON wishlists
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can insert own wishlist" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
