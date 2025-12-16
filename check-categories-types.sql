-- Check categories and their types
SELECT 
  id, 
  name, 
  types,
  is_active,
  created_at
FROM categories
ORDER BY display_order;

-- Check the data type of the types column
SELECT 
  column_name, 
  data_type, 
  udt_name
FROM information_schema.columns 
WHERE table_name = 'categories' 
  AND column_name = 'types';
