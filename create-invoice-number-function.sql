-- Create function to generate invoice numbers
-- Run this in Supabase SQL Editor

-- First, check if the function already exists and drop it
DROP FUNCTION IF EXISTS generate_invoice_number();

-- Create the function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_invoice_number TEXT;
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  -- Get current year and month (e.g., "2025-01")
  year_month := TO_CHAR(NOW(), 'YYYY-MM');

  -- Get the count of invoices for this month and increment
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';

  -- Format: INV-YYYY-MM-XXXX (e.g., INV-2025-01-0001)
  new_invoice_number := 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN new_invoice_number;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_invoice_number() TO authenticated;

-- Test the function
SELECT generate_invoice_number();
