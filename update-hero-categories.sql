-- Update existing categories to show in hero section
-- Fish Tanks, Live Plants, Fancy Birds shown in hero
UPDATE categories 
SET show_in_hero = true 
WHERE name IN ('Fish Tanks', 'Live Plants', 'Fancy Birds', 'CO2 & Lighting', 'Live Fish', 'Bird Supplies');
