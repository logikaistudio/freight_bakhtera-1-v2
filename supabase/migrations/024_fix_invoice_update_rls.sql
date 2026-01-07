-- Migration: Fix RLS Policy for Invoice Status Updates
-- This migration fixes the RLS policy to allow invoice status updates

BEGIN;

-- Drop all existing policies on blink_invoices to start fresh
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON blink_invoices;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON blink_invoices;

-- Create new policies that properly allow all operations for authenticated users

-- SELECT policy (read access)
CREATE POLICY "Allow SELECT for authenticated users"  
ON blink_invoices
FOR SELECT
TO authenticated
USING (true);

-- INSERT policy  
CREATE POLICY "Allow INSERT for authenticated users"
ON blink_invoices
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE policy - this is the critical one for approval functionality
CREATE POLICY "Allow UPDATE for authenticated users"
ON blink_invoices
FOR UPDATE
TO authenticated
USING (true)  -- Can see any row
WITH CHECK (true);  -- Can update any column

-- DELETE policy
CREATE POLICY "Allow DELETE for authenticated users"
ON blink_invoices
FOR DELETE
TO authenticated
USING (true);

-- Verify RLS is enabled (it should be)
ALTER TABLE blink_invoices ENABLE ROW LEVEL SECURITY;

COMMIT;
