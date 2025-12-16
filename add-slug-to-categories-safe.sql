-- Add slug column to categories table (safe version)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_categories_slug;

-- For any categories without slugs, create slug from name (lowercase, replace spaces with hyphens)
UPDATE categories
SET slug = LOWER(REGEXP_REPLACE(TRIM(name), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Handle duplicates by appending ID
UPDATE categories c1
SET slug = c1.slug || '-' || c1.id::text
WHERE EXISTS (
  SELECT 1
  FROM categories c2
  WHERE c2.slug = c1.slug
  AND c2.id != c1.id
  AND c2.id < c1.id
);

-- Now create unique index on slug
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug) WHERE slug IS NOT NULL;
