-- Migration: Create company_settings and company_bank_accounts tables
-- Required for CompanySettings feature

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    company_address TEXT,
    company_phone TEXT,
    company_fax TEXT,
    company_email TEXT,
    company_npwp TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create company_bank_accounts table
CREATE TABLE IF NOT EXISTS company_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_settings_id UUID REFERENCES company_settings(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder TEXT NOT NULL,
    branch TEXT,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (same as other tables)
DROP POLICY IF EXISTS "Allow public read company_settings" ON company_settings;
CREATE POLICY "Allow public read company_settings" ON company_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert company_settings" ON company_settings;
CREATE POLICY "Allow public insert company_settings" ON company_settings
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update company_settings" ON company_settings;
CREATE POLICY "Allow public update company_settings" ON company_settings
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete company_settings" ON company_settings;
CREATE POLICY "Allow public delete company_settings" ON company_settings
    FOR DELETE USING (true);

-- Bank accounts policies
DROP POLICY IF EXISTS "Allow public read company_bank_accounts" ON company_bank_accounts;
CREATE POLICY "Allow public read company_bank_accounts" ON company_bank_accounts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert company_bank_accounts" ON company_bank_accounts;
CREATE POLICY "Allow public insert company_bank_accounts" ON company_bank_accounts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update company_bank_accounts" ON company_bank_accounts;
CREATE POLICY "Allow public update company_bank_accounts" ON company_bank_accounts
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete company_bank_accounts" ON company_bank_accounts;
CREATE POLICY "Allow public delete company_bank_accounts" ON company_bank_accounts
    FOR DELETE USING (true);

-- Insert default row for company settings if not exists
INSERT INTO company_settings (company_name, company_address)
SELECT 'PT Bakhtera Satu Indonesia', 'Jakarta, Indonesia'
WHERE NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1);
