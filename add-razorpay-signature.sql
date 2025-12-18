-- Add razorpay_signature column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

COMMENT ON COLUMN orders.razorpay_signature IS 'Razorpay payment signature for verification';
