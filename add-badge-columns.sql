-- Add all missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS contact_for_price BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS mrp DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock',
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS show_in_category BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add comments for clarity
COMMENT ON COLUMN products.contact_for_price IS 'If true, show "Contact for Price" instead of price';
COMMENT ON COLUMN products.price IS 'Selling price';
COMMENT ON COLUMN products.mrp IS 'Maximum Retail Price (MRP)';
COMMENT ON COLUMN products.discount_percent IS 'Discount percentage for display (0-100)';
COMMENT ON COLUMN products.is_new IS 'Shows NEW badge on product card';
COMMENT ON COLUMN products.is_best_seller IS 'Shows product in best sellers section';
COMMENT ON COLUMN products.stock_status IS 'Stock status: in_stock, out_of_stock, low_stock';
COMMENT ON COLUMN products.quantity IS 'Available quantity';
COMMENT ON COLUMN products.rating IS 'Product rating (0-5)';
COMMENT ON COLUMN products.rating_count IS 'Number of ratings';
COMMENT ON COLUMN products.show_in_category IS 'Show product in category page';
COMMENT ON COLUMN products.is_featured IS 'Featured product shown in home sections';
COMMENT ON COLUMN products.is_active IS 'Product is active and visible on website';
