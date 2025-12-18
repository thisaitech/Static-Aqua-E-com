-- Add district column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS district TEXT;
