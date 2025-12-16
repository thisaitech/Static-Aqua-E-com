-- Create categories table for admin management
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  show_in_hero BOOLEAN DEFAULT false,
  types TEXT[] DEFAULT ARRAY[]::TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access to categories" ON categories
  FOR SELECT USING (true);

-- Allow full access to authenticated users (for admin)
CREATE POLICY "Allow full access to authenticated users on categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Insert default categories with subcategories
INSERT INTO categories (name, types, display_order, is_active, show_in_hero) VALUES
('Fish Tanks & Aquascaping', ARRAY['2 Feet Tanks', '3 Feet Tanks', '4 Feet Tanks', '5+ Feet Tanks', 'Planted Open Tanks'], 1, true, true),
('Live Plants & ADA Products', ARRAY['TC Live Plants', 'Cup Live Plants', 'ADA Fertilizers', 'Substrates & Sands'], 2, true, true),
('CO2, Lighting, Filtration, Air Pumps', ARRAY['CO2 Systems', 'Aquarium Lights', 'Filters', 'Air Pumps'], 3, true, true),
('Live Fish & Shrimp', ARRAY['Fancy Koi', 'Fancy Guppies', 'Shrimps', 'Betta Fish'], 4, true, true),
('Fancy Birds', ARRAY['Lovebirds', 'Cockatiels', 'Budgerigars', 'Finches', 'Conures', 'Cockatoos', 'Ringneck & Alexandrine', 'Canaries', 'Parrotlets & Lineolated'], 5, true, true),
('Bird Cages, Nests & Toys', ARRAY['Bird Cages', 'Nests & Breeding Boxes', 'Toys & Perches', 'Bird Feeds', 'Supplements'], 6, true, false),
('Foods & Medicines', ARRAY['Fish Foods', 'Bird Foods', 'Medicines', 'Supplements'], 7, true, false),
('Professional Equipment', ARRAY['CO2 Systems', 'Aquarium Lights', 'Filters', 'Air Pumps'], 8, true, false)
ON CONFLICT (name) DO UPDATE SET
  types = EXCLUDED.types,
  updated_at = NOW();