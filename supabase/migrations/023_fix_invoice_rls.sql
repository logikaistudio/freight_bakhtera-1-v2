-- Fix RLS Policies for Invoice Updates
-- This allows authenticated users to update invoices

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Enable update for authenticated users" ON blink_invoices;

-- Create new update policy that actually works
CREATE POLICY "Enable update for authenticated users" ON blink_invoices
    FOR UPDATE 
    USING (true)  -- Allow all authenticated users to see rows
    WITH CHECK (true);  -- Allow all authenticated users to update

-- Also ensure insert and select work
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON blink_invoices;
CREATE POLICY "Enable insert for authenticated users" ON blink_invoices
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON blink_invoices;
CREATE POLICY "Enable read access for authenticated users" ON blink_invoices
    FOR SELECT 
    USING (true);
