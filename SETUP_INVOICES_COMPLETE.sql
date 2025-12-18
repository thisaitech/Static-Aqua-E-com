-- ════════════════════════════════════════════════════════════════
-- 🧾 COMPLETE INVOICE SYSTEM SETUP FOR SUPABASE
-- ════════════════════════════════════════════════════════════════
-- Run this entire script in Supabase SQL Editor
-- This will set up the invoices table, function, and policies
-- ════════════════════════════════════════════════════════════════

-- Step 1: Drop existing table if you want a fresh start (CAREFUL!)
-- DROP TABLE IF EXISTS invoices CASCADE;

-- Step 2: Create invoices table
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

-- Step 3: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Step 4: Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can update all invoices" ON invoices;
DROP POLICY IF EXISTS "Service role can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can insert invoices" ON invoices;

-- Step 6: Create RLS policies

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

-- Policy: Admins can insert invoices
CREATE POLICY "Admins can insert invoices" ON invoices
  FOR INSERT
  WITH CHECK (
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

-- Step 7: Drop and recreate the invoice number generation function
DROP FUNCTION IF EXISTS generate_invoice_number();

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with elevated privileges
AS $$
DECLARE
  new_invoice_number TEXT;
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  -- Get current year and month (e.g., "2025-12")
  year_month := TO_CHAR(NOW(), 'YYYY-MM');

  -- Get the count of invoices for this month and increment
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';

  -- Format: INV-YYYY-MM-XXXX (e.g., INV-2025-12-0001)
  new_invoice_number := 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN new_invoice_number;
END;
$$;

-- Step 8: Grant execute permission
GRANT EXECUTE ON FUNCTION generate_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number() TO service_role;

-- Step 9: Add helpful comments
COMMENT ON TABLE invoices IS 'Stores invoice records for completed orders';
COMMENT ON COLUMN invoices.items IS 'JSON array of {id, name, price, quantity, image, mrp}';
COMMENT ON COLUMN invoices.invoice_number IS 'Auto-generated unique invoice number (format: INV-YYYY-MM-XXXX)';
COMMENT ON COLUMN invoices.pdf_url IS 'URL to the generated PDF invoice stored in Supabase Storage';

-- ════════════════════════════════════════════════════════════════
-- ✅ VERIFICATION QUERIES
-- ════════════════════════════════════════════════════════════════

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'invoices'
) AS invoices_table_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'invoices';

-- Test the function (should return something like 'INV-2025-12-0001')
SELECT generate_invoice_number();

-- Check existing invoices (if any)
SELECT COUNT(*) as total_invoices FROM invoices;

-- ════════════════════════════════════════════════════════════════
-- 🧪 TEST INVOICE GENERATION (Optional - for testing only)
-- ════════════════════════════════════════════════════════════════
-- Uncomment below to test invoice creation with a sample order
-- You need to replace 'your-order-id-here' with an actual order ID

/*
DO $$
DECLARE
  test_order_id UUID;
  new_invoice_number TEXT;
BEGIN
  -- Get the first order from your orders table
  SELECT id INTO test_order_id FROM orders LIMIT 1;

  IF test_order_id IS NULL THEN
    RAISE NOTICE 'No orders found to test with';
  ELSE
    -- Generate invoice number
    SELECT generate_invoice_number() INTO new_invoice_number;

    -- Try to create a test invoice
    INSERT INTO invoices (
      order_id,
      invoice_number,
      customer_name,
      customer_email,
      customer_phone,
      billing_address,
      billing_city,
      billing_state,
      billing_pincode,
      items,
      subtotal,
      shipping_charge,
      total_amount,
      payment_method,
      payment_status
    )
    SELECT
      o.id,
      new_invoice_number,
      o.customer_name,
      o.customer_email,
      o.customer_phone,
      o.shipping_address,
      o.shipping_city,
      o.shipping_state,
      o.shipping_pincode,
      o.products,
      o.subtotal,
      o.shipping_charge,
      o.total_amount,
      o.payment_method,
      o.payment_status
    FROM orders o
    WHERE o.id = test_order_id;

    RAISE NOTICE 'Test invoice created: %', new_invoice_number;
  END IF;
END $$;
*/

-- ════════════════════════════════════════════════════════════════
-- 📋 SETUP COMPLETE!
-- ════════════════════════════════════════════════════════════════
-- Your invoice system is now ready to use.
-- Try generating an invoice from the admin panel.
-- ════════════════════════════════════════════════════════════════
