-- Simple query to add addresses column to existing users table
-- Run this in Supabase SQL Editor

-- Add addresses column if it doesn't exist (keeps existing columns)
ALTER TABLE users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
