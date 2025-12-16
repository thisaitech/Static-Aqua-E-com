-- Fix existing slugs in categories table
-- This script cleans up slugs with URL-encoded characters and trailing symbols

-- Example: "live-fish-%26-shrimp?" becomes "live-fish-and-shrimp"

UPDATE categories
SET slug = 
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(slug, '%26', 'and', 'g'),  -- Replace %26 with 'and'
          '[?#].*$', '', 'g'),  -- Remove trailing ? or # and everything after
        '[^a-z0-9\s-]', '', 'g'),  -- Remove special chars except spaces and hyphens
      '\s+', '-', 'g'),  -- Replace spaces with hyphens
    '-+', '-', 'g')  -- Replace multiple hyphens with single hyphen
  )
WHERE slug ~ '%26|[?#]|[^a-z0-9-]';

-- Show the updated slugs
SELECT name, slug FROM categories ORDER BY name;
