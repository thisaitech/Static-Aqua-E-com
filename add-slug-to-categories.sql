-- Add slug column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug) WHERE slug IS NOT NULL;

-- Update existing categories with slugs based on their names
-- Fish Tanks -> fish-tanks
-- Fish -> fish
-- Plants -> aquatic-plants
-- Equipment -> equipment
-- etc.

UPDATE categories SET slug = 'fish-tanks' WHERE LOWER(name) LIKE '%fish tank%' OR LOWER(name) LIKE '%tank%' AND slug IS NULL;
UPDATE categories SET slug = 'fish' WHERE LOWER(name) = 'fish' AND slug IS NULL;
UPDATE categories SET slug = 'aquatic-plants' WHERE LOWER(name) LIKE '%plant%' AND slug IS NULL;
UPDATE categories SET slug = 'equipment' WHERE LOWER(name) LIKE '%equipment%' AND slug IS NULL;
UPDATE categories SET slug = 'accessories' WHERE LOWER(name) LIKE '%accessor%' AND slug IS NULL;
UPDATE categories SET slug = 'maintenance' WHERE LOWER(name) LIKE '%maintenance%' AND slug IS NULL;

-- For any remaining categories, create slug from name (lowercase, replace spaces with hyphens)
UPDATE categories
SET slug = LOWER(REGEXP_REPLACE(TRIM(name), '\s+', '-', 'g'))
WHERE slug IS NULL;
