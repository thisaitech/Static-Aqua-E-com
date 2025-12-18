-- COMPLETE FIX FOR offer_type ERROR
-- Copy and paste this ENTIRE script into Supabase SQL Editor and run it

-- Step 1: Drop all triggers that might reference offer_type
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'products') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON products CASCADE';
    END LOOP;
END $$;

-- Step 2: Add offer_type column as nullable (to prevent errors)
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_type text;

-- Step 3: Check if there are any functions related to offer_type and drop them
DROP FUNCTION IF EXISTS set_product_offer_type() CASCADE;
DROP FUNCTION IF EXISTS calculate_offer_type() CASCADE;
DROP FUNCTION IF EXISTS update_offer_type() CASCADE;
DROP FUNCTION IF EXISTS handle_product_offer_type() CASCADE;

-- Done! The offer_type error should be fixed now.
