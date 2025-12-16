-- Insert default categories with subcategories
INSERT INTO categories (name, types, display_order, is_active, show_in_hero) VALUES
('Fish Tanks & Aquascaping', ARRAY['2 Feet Tanks', '3 Feet Tanks', '4 Feet Tanks', '5+ Feet Tanks', 'Planted Open Tanks'], 1, true, true),
('Live Plants & ADA Products', ARRAY['TC Live Plants', 'Cup Live Plants', 'ADA Fertilizers', 'Substrates & Sands'], 2, true, true),
('CO2, Lighting, Filtration, Air Pumps', ARRAY['CO2 Systems', 'Aquarium Lights', 'Filters', 'Air Pumps'], 3, true, true),
('Live Fish & Shrimp', ARRAY['Fancy Koi', 'Fancy Guppies', 'Shrimps', 'Betta Fish'], 4, true, true),
('Fancy Birds', ARRAY['Lovebirds', 'Cockatiels', 'Budgerigars', 'Finches', 'Conures', 'Cockatoos', 'Ringneck & Alexandrine', 'Canaries', 'Parrotlets & Lineolated'], 5, true, true),
('Bird Cages, Nests & Toys', ARRAY['Bird Cages', 'Nests & Breeding Boxes', 'Toys & Perches', 'Bird Feeds', 'Supplements'], 6, true, false),
('Foods & Medicines', ARRAY['Fish Foods', 'Bird Foods', 'Medicines', 'Supplements'], 7, true, false),
('Professional Equipment', ARRAY['CO2 Systems', 'Aquarium Lights', 'Filters', 'Air Pumps'], 8, true, false);