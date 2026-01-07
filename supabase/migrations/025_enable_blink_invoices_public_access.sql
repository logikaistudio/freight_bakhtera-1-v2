-- =====================================================
-- 025_enable_blink_invoices_public_access.sql
-- Enable public access for blink_invoices table
-- Allows CRUD operations without authentication (for development)
-- =====================================================

BEGIN;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON blink_invoices;

-- Create public access policy (same as other tables in migration 003)
DROP POLICY IF EXISTS "Enable all access for all users" ON blink_invoices;
CREATE POLICY "Enable all access for all users" 
ON blink_invoices 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE blink_invoices ENABLE ROW LEVEL SECURITY;

COMMIT;
