-- Update users table to store multiple addresses as JSON array
-- Run this in Supabase SQL Editor

-- Modify users table to use JSONB for addresses
ALTER TABLE users DROP COLUMN IF EXISTS address;
ALTER TABLE users DROP COLUMN IF EXISTS city;
ALTER TABLE users DROP COLUMN IF EXISTS state;
ALTER TABLE users DROP COLUMN IF EXISTS district;
ALTER TABLE users DROP COLUMN IF EXISTS pincode;

-- Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;

-- If the users table doesn't exist at all, create it:
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create RLS policies
-- Allow authenticated users to read all users (for admin)
CREATE POLICY "Users can read all users" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to insert their own data during registration
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- Create an updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Example of how addresses will be stored:
/*
addresses column will contain JSON array like this:
[
  {
    "id": "addr-1",
    "label": "Home",
    "full_name": "John Doe",
    "phone": "9876543210",
    "address": "123 Main Street",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "district": "Chennai",
    "pincode": "600001",
    "is_default": true
  },
  {
    "id": "addr-2",
    "label": "Office",
    "full_name": "John Doe",
    "phone": "9876543210",
    "address": "456 Business Park",
    "city": "Coimbatore",
    "state": "Tamil Nadu",
    "district": "Coimbatore",
    "pincode": "641001",
    "is_default": false
  }
]
*/
