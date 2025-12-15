# 🗄️ Products Table Setup - Run in Supabase SQL Editor

## Run this SQL script in Supabase:

```sql
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price DECIMAL(10, 2) NOT NULL,
  final_price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_new_arrival BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  offer_type TEXT, -- 'percentage' or 'flat'
  offer_value DECIMAL(10, 2), -- discount % or flat amount
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for user website)
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Allow admins full access
DROP POLICY IF EXISTS "Admins can do everything" ON products;
CREATE POLICY "Admins can do everything" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- Create function to auto-calculate final price
CREATE OR REPLACE FUNCTION calculate_final_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.offer_type = 'percentage' AND NEW.offer_value IS NOT NULL THEN
    NEW.final_price := NEW.original_price - (NEW.original_price * NEW.offer_value / 100);
  ELSIF NEW.offer_type = 'flat' AND NEW.offer_value IS NOT NULL THEN
    NEW.final_price := NEW.original_price - NEW.offer_value;
  ELSE
    NEW.final_price := NEW.original_price;
  END IF;
  
  -- Ensure final price is not negative
  IF NEW.final_price < 0 THEN
    NEW.final_price := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-calculation
DROP TRIGGER IF EXISTS trigger_calculate_final_price ON products;
CREATE TRIGGER trigger_calculate_final_price
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION calculate_final_price();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_updated_at ON products;
CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## ✅ After running this SQL, you'll have:

- ✅ **products** table with all fields
- ✅ Row Level Security (RLS) policies
- ✅ Auto-calculation of final price based on offers
- ✅ Indexes for fast queries
- ✅ Admin full access, public read-only access

## 📝 Table Structure:

| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Unique product ID |
| name | TEXT | Product name |
| category | TEXT | Category (fish-tanks, filters, etc.) |
| description | TEXT | Product details |
| image_url | TEXT | Product image from Supabase Storage |
| original_price | DECIMAL | Original price |
| final_price | DECIMAL | Auto-calculated after discount |
| stock_quantity | INTEGER | Available stock |
| is_active | BOOLEAN | Show/hide on user site |
| is_new_arrival | BOOLEAN | Show in New Arrivals section |
| is_featured | BOOLEAN | Show in Featured Products |
| offer_type | TEXT | 'percentage' or 'flat' |
| offer_value | DECIMAL | Discount amount |
| slug | TEXT | URL-friendly name |

## 🚀 Next Step:

Run this SQL in Supabase → Then I'll build the admin pages!
