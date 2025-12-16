-- Update products table to add missing columns
ALTER TABLE products 
ADD COLUMN contact_for_price BOOLEAN DEFAULT false;

-- Create category_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS category_types (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  category_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on category_types table
ALTER TABLE category_types ENABLE ROW LEVEL SECURITY;

-- Create policies for category_types table
CREATE POLICY "Enable read access for all users" ON category_types FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON category_types FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON category_types FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON category_types FOR DELETE USING (auth.role() = 'authenticated');

-- Insert category types based on existing categories
INSERT INTO category_types (name, category_name, display_order, is_active) VALUES
-- Fish Tanks & Aquascaping
('2 Feet Tanks', 'Fish Tanks & Aquascaping', 1, true),
('3 Feet Tanks', 'Fish Tanks & Aquascaping', 2, true),
('4 Feet Tanks', 'Fish Tanks & Aquascaping', 3, true),
('5+ Feet Tanks', 'Fish Tanks & Aquascaping', 4, true),
('Planted Open Tanks', 'Fish Tanks & Aquascaping', 5, true),

-- Live Plants & ADA Products
('TC Live Plants', 'Live Plants & ADA Products', 6, true),
('Cup Live Plants', 'Live Plants & ADA Products', 7, true),
('ADA Fertilizers', 'Live Plants & ADA Products', 8, true),
('Substrates & Sands', 'Live Plants & ADA Products', 9, true),

-- CO2, Lighting, Filtration, Air Pumps
('CO2 Systems', 'CO2, Lighting, Filtration, Air Pumps', 10, true),
('Aquarium Lights', 'CO2, Lighting, Filtration, Air Pumps', 11, true),
('Filters', 'CO2, Lighting, Filtration, Air Pumps', 12, true),
('Air Pumps', 'CO2, Lighting, Filtration, Air Pumps', 13, true),

-- Live Fish & Shrimp
('Fancy Koi', 'Live Fish & Shrimp', 14, true),
('Fancy Guppies', 'Live Fish & Shrimp', 15, true),
('Shrimps', 'Live Fish & Shrimp', 16, true),
('Betta Fish', 'Live Fish & Shrimp', 17, true),

-- Fancy Birds
('Lovebirds', 'Fancy Birds', 18, true),
('Cockatiels', 'Fancy Birds', 19, true),
('Budgerigars', 'Fancy Birds', 20, true),
('Finches', 'Fancy Birds', 21, true),
('Conures', 'Fancy Birds', 22, true),
('Cockatoos', 'Fancy Birds', 23, true),
('Ringneck & Alexandrine', 'Fancy Birds', 24, true),
('Canaries', 'Fancy Birds', 25, true),
('Parrotlets & Lineolated', 'Fancy Birds', 26, true),

-- Bird Cages, Nests & Toys
('Bird Cages', 'Bird Cages, Nests & Toys', 27, true),
('Nests & Breeding Boxes', 'Bird Cages, Nests & Toys', 28, true),
('Toys & Perches', 'Bird Cages, Nests & Toys', 29, true),
('Bird Feeds', 'Bird Cages, Nests & Toys', 30, true),
('Supplements', 'Bird Cages, Nests & Toys', 31, true),

-- Foods & Medicines
('Fish Foods', 'Foods & Medicines', 32, true),
('Bird Foods', 'Foods & Medicines', 33, true),
('Medicines', 'Foods & Medicines', 34, true),
('Supplements', 'Foods & Medicines', 35, true),

-- Professional Equipment
('CO2 Systems', 'Professional Equipment', 36, true),
('Aquarium Lights', 'Professional Equipment', 37, true),
('Filters', 'Professional Equipment', 38, true),
('Air Pumps', 'Professional Equipment', 39, true);