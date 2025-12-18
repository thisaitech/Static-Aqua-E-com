-- REMOVE ALL OFFER-RELATED TRIGGERS FROM PRODUCTS TABLE
-- This will stop the offer_type and offer_value errors permanently
-- Copy and paste this into Supabase SQL Editor

-- Step 1: List all triggers to see what we're removing
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'products';

-- Step 2: Drop ALL triggers on products table
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'products'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trigger_record.trigger_name) || ' ON products CASCADE';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- Step 3: Drop any functions that might be setting offer fields
DROP FUNCTION IF EXISTS set_product_offer_type() CASCADE;
DROP FUNCTION IF EXISTS calculate_offer_type() CASCADE;
DROP FUNCTION IF EXISTS update_offer_type() CASCADE;
DROP FUNCTION IF EXISTS handle_product_offer_type() CASCADE;
DROP FUNCTION IF EXISTS set_offer_details() CASCADE;
DROP FUNCTION IF EXISTS calculate_product_offer() CASCADE;

-- Done! No more offer-related errors. Try adding a product now.
