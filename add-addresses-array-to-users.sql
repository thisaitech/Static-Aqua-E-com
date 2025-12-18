-- Add addresses column to users table as JSONB array
-- Run this in Supabase SQL Editor

-- Add addresses column to public.users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;

-- Add index for faster queries on addresses
CREATE INDEX IF NOT EXISTS idx_users_addresses ON public.users USING gin(addresses);

-- Comment on the column
COMMENT ON COLUMN public.users.addresses IS 'Array of user addresses stored as JSONB. Each address has: full_name, phone, email, address, city, district, pin_code, is_default';

-- Example address structure:
/*
[
  {
    "id": "uuid-1",
    "full_name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main Street",
    "city": "Chennai",
    "district": "Chennai",
    "pin_code": "600001",
    "is_default": true,
    "created_at": "2025-12-18T10:30:00Z"
  },
  {
    "id": "uuid-2",
    "full_name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "456 Park Avenue",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "pin_code": "641001",
    "is_default": false,
    "created_at": "2025-12-18T11:00:00Z"
  }
]
*/

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'addresses';

-- Test query to see current addresses (will be empty initially)
SELECT id, email, addresses
FROM public.users
LIMIT 5;
