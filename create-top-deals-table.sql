-- Create top_deals table
CREATE TABLE IF NOT EXISTS top_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Deal Content
  title TEXT NOT NULL,
  discount TEXT NOT NULL,
  image_url TEXT NOT NULL,
  
  -- Link/Category
  category_slug TEXT,
  custom_link TEXT,
  
  -- Visual
  icon_name TEXT DEFAULT 'package',
  bg_color TEXT DEFAULT 'from-blue-600 to-blue-700',
  
  -- Status & Order
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_top_deals_active_order ON top_deals(is_active, display_order);

-- Enable Row Level Security
ALTER TABLE top_deals ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active top deals (no authentication required)
CREATE POLICY "public_view_active_deals" ON top_deals
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins have full access (simplified single policy)
CREATE POLICY "admins_all_access" ON top_deals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Insert existing static data as initial content
INSERT INTO top_deals (title, discount, image_url, category_slug, icon_name, bg_color, display_order, is_active) VALUES
  ('Ultra Clear Tanks', 'Up to 30% Off', 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop', 'fish-tanks', 'fish', 'from-blue-600 to-blue-700', 1, true),
  ('ADA Live Plants', 'Starting ₹250', 'https://images.unsplash.com/photo-1518882605630-8eb256b6cd5b?w=400&h=300&fit=crop', 'live-plants', 'leaf', 'from-green-600 to-green-700', 2, true),
  ('Air Pumps & Filters', 'Min 40% Off', 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=400&h=300&fit=crop', 'co2-lighting', 'zap', 'from-purple-600 to-purple-700', 3, true),
  ('Fancy Birds', 'Hand-raised', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop', 'fancy-birds', 'bird', 'from-orange-500 to-orange-600', 4, true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE top_deals IS 'Stores Top Deals section cards - admin-managed';
COMMENT ON COLUMN top_deals.category_slug IS 'Link to /category/{slug} - takes priority over custom_link';
COMMENT ON COLUMN top_deals.custom_link IS 'Custom URL if not linking to category';
COMMENT ON COLUMN top_deals.icon_name IS 'Icon identifier: fish, bird, leaf, zap, package, etc';
COMMENT ON COLUMN top_deals.bg_color IS 'Tailwind gradient classes for card overlay';
