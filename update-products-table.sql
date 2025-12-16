-- Add type column to products table and remove type_id
ALTER TABLE products 
ADD COLUMN type TEXT;

-- If you have existing data with type_id, you can migrate it:
-- UPDATE products 
-- SET type = (SELECT name FROM category_types WHERE category_types.id = products.type_id)
-- WHERE type_id IS NOT NULL;

-- Then you can drop the old type_id column (optional, after data migration):
-- ALTER TABLE products DROP COLUMN type_id;