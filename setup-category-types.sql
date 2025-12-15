-- Add show_in_hero and icon columns to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS show_in_hero BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Create category_types table
CREATE TABLE IF NOT EXISTS category_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add type_id to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS type_id UUID REFERENCES category_types(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_category_types_category_id ON category_types(category_id);
CREATE INDEX IF NOT EXISTS idx_category_types_active ON category_types(is_active);
CREATE INDEX IF NOT EXISTS idx_products_type_id ON products(type_id);

-- RLS policies for category_types
ALTER TABLE category_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_view_types" ON category_types;
DROP POLICY IF EXISTS "admin_manage_types" ON category_types;

CREATE POLICY "public_view_types" ON category_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_manage_types" ON category_types
  FOR ALL USING (auth.jwt()->>'email' = 'nanthini@thisaitech.com');

-- Insert all category types data
-- First, get category IDs (we'll need to match by name)

-- Fish Tanks Types
INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'All Fish Tanks & Aquascaping', 0 FROM categories WHERE name = 'Fish Tanks'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, '2 Feet Tanks', 1 FROM categories WHERE name = 'Fish Tanks'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, '3 Feet Tanks', 2 FROM categories WHERE name = 'Fish Tanks'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, '4 Feet Tanks', 3 FROM categories WHERE name = 'Fish Tanks'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, '5+ Feet Tanks', 4 FROM categories WHERE name = 'Fish Tanks'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Planted Open Tanks', 5 FROM categories WHERE name = 'Fish Tanks'
ON CONFLICT DO NOTHING;

-- Live Plants Types
INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'All Live Plants & ADA Products', 0 FROM categories WHERE name = 'Live Plants'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'TC Live Plants', 1 FROM categories WHERE name = 'Live Plants'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Cup Live Plants', 2 FROM categories WHERE name = 'Live Plants'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'ADA Fertilizers', 3 FROM categories WHERE name = 'Live Plants'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Substrates & Sands', 4 FROM categories WHERE name = 'Live Plants'
ON CONFLICT DO NOTHING;

-- Fancy Birds Types
INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'All Fancy Birds', 0 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Lovebirds', 1 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Cockatiels', 2 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Budgerigars', 3 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Finches', 4 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Conures', 5 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Cockatoos', 6 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Ringneck & Alexandrine', 7 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Canaries', 8 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Parrotlets & Lineolated', 9 FROM categories WHERE name = 'Fancy Birds'
ON CONFLICT DO NOTHING;

-- CO2 & Lighting (Equipment) Types
INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'All CO2, Lighting, Filtration, Air Pumps', 0 FROM categories WHERE name = 'CO2 & Lighting'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'CO2 Systems', 1 FROM categories WHERE name = 'CO2 & Lighting'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Aquarium Lights', 2 FROM categories WHERE name = 'CO2 & Lighting'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Filters', 3 FROM categories WHERE name = 'CO2 & Lighting'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Air Pumps', 4 FROM categories WHERE name = 'CO2 & Lighting'
ON CONFLICT DO NOTHING;

-- Live Fish Types
INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'All Live Fish & Shrimp', 0 FROM categories WHERE name = 'Live Fish'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Fancy Koi', 1 FROM categories WHERE name = 'Live Fish'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Fancy Guppies', 2 FROM categories WHERE name = 'Live Fish'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Shrimps', 3 FROM categories WHERE name = 'Live Fish'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Betta Fish', 4 FROM categories WHERE name = 'Live Fish'
ON CONFLICT DO NOTHING;

-- Bird Supplies Types
INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'All Bird Cages, Nests & Toys', 0 FROM categories WHERE name = 'Bird Supplies'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Bird Cages', 1 FROM categories WHERE name = 'Bird Supplies'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Nests & Breeding Boxes', 2 FROM categories WHERE name = 'Bird Supplies'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Toys & Perches', 3 FROM categories WHERE name = 'Bird Supplies'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Bird Feeds', 4 FROM categories WHERE name = 'Bird Supplies'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Supplements', 5 FROM categories WHERE name = 'Bird Supplies'
ON CONFLICT DO NOTHING;

-- Foods & Medicines Types
INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'All Foods & Medicines', 0 FROM categories WHERE name = 'Foods & Medicines'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Fish Foods', 1 FROM categories WHERE name = 'Foods & Medicines'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Bird Foods', 2 FROM categories WHERE name = 'Foods & Medicines'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Medicines', 3 FROM categories WHERE name = 'Foods & Medicines'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Supplements', 4 FROM categories WHERE name = 'Foods & Medicines'
ON CONFLICT DO NOTHING;

-- Tank Accessories & Spares Types
INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'All Tank Accessories & Spares', 0 FROM categories WHERE name = 'Tank Accessories'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Hose Holders', 1 FROM categories WHERE name = 'Tank Accessories'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Cover Holders', 2 FROM categories WHERE name = 'Tank Accessories'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Spares', 3 FROM categories WHERE name = 'Tank Accessories'
ON CONFLICT DO NOTHING;

-- Accessories Types
INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'All Accessories', 0 FROM categories WHERE name = 'Accessories'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Training Mirrors', 1 FROM categories WHERE name = 'Accessories'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Decorations', 2 FROM categories WHERE name = 'Accessories'
ON CONFLICT DO NOTHING;

INSERT INTO category_types (category_id, name, display_order) 
SELECT id, 'Tools', 3 FROM categories WHERE name = 'Accessories'
ON CONFLICT DO NOTHING;
