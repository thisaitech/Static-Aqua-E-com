-- Create hero_banners table
CREATE TABLE hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  badge_text TEXT,
  button_text TEXT NOT NULL DEFAULT 'Shop Now',
  button_link TEXT NOT NULL DEFAULT '/',
  desktop_image TEXT,
  mobile_image TEXT,
  bg_color TEXT NOT NULL DEFAULT 'from-blue-900/95 via-blue-800/90 to-blue-900/80',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create banner_icons table
CREATE TABLE banner_icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_name TEXT NOT NULL,
  icon_type TEXT NOT NULL CHECK (icon_type IN ('category', 'page', 'url')),
  link_value TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_icons ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (for public website)
CREATE POLICY "Anyone can view active banners" ON hero_banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active icons" ON banner_icons
  FOR SELECT USING (is_active = true);

-- Allow full access to authenticated users (for admin)
CREATE POLICY "Authenticated users can manage banners" ON hero_banners
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage icons" ON banner_icons
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_hero_banners_active_order ON hero_banners (is_active, display_order);
CREATE INDEX idx_banner_icons_active_order ON banner_icons (is_active, display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hero_banners_updated_at BEFORE UPDATE ON hero_banners
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_banner_icons_updated_at BEFORE UPDATE ON banner_icons
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default hero banners
INSERT INTO hero_banners (title, subtitle, badge_text, button_text, button_link, bg_color, display_order) VALUES
('Premium Aquarium Collections', 'Discover our curated selection of high-quality fish tanks and aquatic accessories', 'NEW ARRIVALS', 'Explore Tanks', '/category/fish-tanks', 'from-blue-900/95 via-blue-800/90 to-blue-900/80', 1),
('Exotic Birds Paradise', 'Beautiful birds and complete care supplies for your feathered friends', 'BEST SELLERS', 'Shop Birds', '/category/fancy-birds', 'from-emerald-900/95 via-emerald-800/90 to-emerald-900/80', 2),
('Professional Equipment', 'Top-grade aquatic and avian equipment from trusted brands', 'PREMIUM QUALITY', 'View Equipment', '/category/equipment', 'from-purple-900/95 via-purple-800/90 to-purple-900/80', 3);

-- Insert default banner icons
INSERT INTO banner_icons (icon_name, icon_type, link_value, display_name, display_order) VALUES
('Leaf', 'category', 'live-plants', 'ADA Plants', 1),
('Fish', 'category', 'live-fish', 'Live Fish', 2),
('Zap', 'category', 'co2-lighting', 'Equipment', 3);