-- Fix RLS policies for top_deals table
-- Run this if you already created the table and are getting 403 errors

-- Drop the old combined policy
DROP POLICY IF EXISTS "Admins can manage top deals" ON top_deals;

-- Create separate policies for each operation

-- Policy: Admins can view all top deals
CREATE POLICY "Admins can view all top deals" ON top_deals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Policy: Admins can insert top deals
CREATE POLICY "Admins can insert top deals" ON top_deals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Policy: Admins can update top deals
CREATE POLICY "Admins can update top deals" ON top_deals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Policy: Admins can delete top deals
CREATE POLICY "Admins can delete top deals" ON top_deals
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'top_deals';
