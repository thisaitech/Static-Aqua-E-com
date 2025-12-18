-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,

  -- Invoice Details
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Customer Information (snapshot from order)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  -- Billing Address (same as shipping)
  billing_address TEXT NOT NULL,
  billing_city TEXT NOT NULL,
  billing_state TEXT NOT NULL,
  billing_pincode TEXT NOT NULL,

  -- Invoice Items (snapshot from order)
  items JSONB NOT NULL,

  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Payment Information
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  razorpay_payment_id TEXT,

  -- PDF Storage
  pdf_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invoices for their own orders
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = invoices.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Policy: Admins can view all invoices
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Policy: Admins can update all invoices
CREATE POLICY "Admins can update all invoices" ON invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Policy: System can insert invoices (via service role)
CREATE POLICY "Service role can insert invoices" ON invoices
  FOR INSERT
  WITH CHECK (true);

-- Create a function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_num TEXT;
BEGIN
  -- Get the count of existing invoices + 1
  SELECT COUNT(*) + 1 INTO next_number FROM invoices;

  -- Format: INV-YYYYMMDD-XXXX
  invoice_num := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(next_number::TEXT, 4, '0');

  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE invoices IS 'Stores invoice records for completed orders';
COMMENT ON COLUMN invoices.items IS 'JSON array of {id, name, price, quantity, image, mrp}';
COMMENT ON COLUMN invoices.invoice_number IS 'Auto-generated unique invoice number (format: INV-YYYYMMDD-XXXX)';
COMMENT ON COLUMN invoices.pdf_url IS 'URL to the generated PDF invoice stored in Supabase Storage';
