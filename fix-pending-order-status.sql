-- Fix orders that are stuck in "pending" status after successful Razorpay payment
-- This happens when payment verification succeeded but DB update failed

-- First, check orders with payment details but still showing as pending
SELECT
  id,
  customer_name,
  total_amount,
  payment_status,
  order_status,
  razorpay_payment_id,
  created_at
FROM orders
WHERE payment_status = 'pending'
  AND razorpay_payment_id IS NOT NULL -- Has Razorpay payment ID = payment was successful
ORDER BY created_at DESC
LIMIT 10;

-- Update these orders to completed status
-- Run this AFTER reviewing the above query results
UPDATE orders
SET
  payment_status = 'completed',
  order_status = 'confirmed'
WHERE payment_status = 'pending'
  AND razorpay_payment_id IS NOT NULL
  AND razorpay_payment_id != '';

-- Verify the update
SELECT
  id,
  customer_name,
  total_amount,
  payment_status,
  order_status,
  razorpay_payment_id,
  created_at
FROM orders
WHERE payment_status = 'completed'
  AND razorpay_payment_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
