-- Create filter_types table for dynamic category filters
CREATE TABLE IF NOT EXISTS filter_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug VARCHAR(255) NOT NULL,
  filter_name VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE filter_types ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access to filter_types" ON filter_types
  FOR SELECT USING (true);

-- Allow full access to authenticated users (for admin)
CREATE POLICY "Allow full access to authenticated users" ON filter_types
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_filter_types_category ON filter_types(category_slug);
CREATE INDEX IF NOT EXISTS idx_filter_types_active ON filter_types(is_active);
CREATE INDEX IF NOT EXISTS idx_filter_types_order ON filter_types(display_order);

-- Insert some default filter types for equipment category
INSERT INTO filter_types (category_slug, filter_name, display_order, is_active) VALUES
('equipment', 'All CO2, Lighting, Filtration, Air Pumps', 1, true),
('equipment', 'CO2 Systems', 2, true),
('equipment', 'Aquarium Lights', 3, true),
('equipment', 'Filters', 4, true),
('equipment', 'Air Pumps', 5, true);

-- Insert filter types for other categories
INSERT INTO filter_types (category_slug, filter_name, display_order, is_active) VALUES
('live-plants', 'All Live Plants', 1, true),
('live-plants', 'Foreground Plants', 2, true),
('live-plants', 'Midground Plants', 3, true),
('live-plants', 'Background Plants', 4, true),
('live-plants', 'Floating Plants', 5, true);

INSERT INTO filter_types (category_slug, filter_name, display_order, is_active) VALUES
('fancy-birds', 'All Birds', 1, true),
('fancy-birds', 'Canaries', 2, true),
('fancy-birds', 'Budgerigars', 3, true),
('fancy-birds', 'Cockatiels', 4, true),
('fancy-birds', 'Love Birds', 5, true);

INSERT INTO filter_types (category_slug, filter_name, display_order, is_active) VALUES
('live-fish', 'All Fish', 1, true),
('live-fish', 'Betta Fish', 2, true),
('live-fish', 'Goldfish', 3, true),
('live-fish', 'Tropical Fish', 4, true),
('live-fish', 'Marine Fish', 5, true);