-- Only add the missing contact_for_price column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS contact_for_price BOOLEAN DEFAULT false;