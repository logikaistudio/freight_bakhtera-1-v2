-- =====================================================
-- 003_enable_public_access.sql
-- Enable public access for all tables to allow CRUD without auth
-- IMPORTANT: Review security before production if Auth is implemented later
-- =====================================================

-- 1. Enable RLS on all tables (Best Practice, then allow public)
ALTER TABLE freight_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_inbound ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_outbound ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_reject ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_bc_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_customs ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_mutation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_events ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy to Allow Public Access (SELECT, INSERT, UPDATE, DELETE)

-- Helper macro to create policy if not exists (Postgres doesn't have CREATE POLICY IF NOT EXISTS in all versions)
-- We will just drop and recreate to be safe and simple

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_customers;
CREATE POLICY "Enable all access for all users" ON freight_customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_vendors;
CREATE POLICY "Enable all access for all users" ON freight_vendors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_quotations;
CREATE POLICY "Enable all access for all users" ON freight_quotations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_warehouse;
CREATE POLICY "Enable all access for all users" ON freight_warehouse FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_inbound;
CREATE POLICY "Enable all access for all users" ON freight_inbound FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_outbound;
CREATE POLICY "Enable all access for all users" ON freight_outbound FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_reject;
CREATE POLICY "Enable all access for all users" ON freight_reject FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_inventory;
CREATE POLICY "Enable all access for all users" ON freight_inventory FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_bc_codes;
CREATE POLICY "Enable all access for all users" ON freight_bc_codes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_customs;
CREATE POLICY "Enable all access for all users" ON freight_customs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_mutation_logs;
CREATE POLICY "Enable all access for all users" ON freight_mutation_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_invoices;
CREATE POLICY "Enable all access for all users" ON freight_invoices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_purchases;
CREATE POLICY "Enable all access for all users" ON freight_purchases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON freight_events;
CREATE POLICY "Enable all access for all users" ON freight_events FOR ALL USING (true) WITH CHECK (true);
