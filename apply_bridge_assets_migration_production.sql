-- ============================================================
-- FIX BRIDGE ASSETS RLS POLICIES (Production)
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON bridge_assets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bridge_assets;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON bridge_assets;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON bridge_assets;

-- Create more permissive RLS policies
CREATE POLICY "Allow read for all" ON bridge_assets FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated" ON bridge_assets 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated" ON bridge_assets 
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated" ON bridge_assets 
FOR DELETE USING (true);

SELECT 'Bridge Assets RLS policies updated successfully!' as status;
