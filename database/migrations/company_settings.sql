-- Migration: Company Settings Tables
-- Description: Creates tables for company settings and bank accounts management
-- Date: 2026-01-03

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT,
    company_phone VARCHAR(50),
    company_fax VARCHAR(50),
    company_email VARCHAR(255),
    company_npwp VARCHAR(50),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_bank_accounts table
CREATE TABLE IF NOT EXISTS company_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_settings_id UUID REFERENCES company_settings(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    branch VARCHAR(255),
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bank_accounts_company_id ON company_bank_accounts(company_settings_id);

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policies for company logos
CREATE POLICY "Public read access for company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-logos');

-- Insert default company settings if none exists
INSERT INTO company_settings (company_name, company_address)
SELECT 'PT Bakhtera Satu', 'Masukkan alamat perusahaan'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- Comments
COMMENT ON TABLE company_settings IS 'Stores company information including name, address, and logo';
COMMENT ON TABLE company_bank_accounts IS 'Stores company bank account information, maximum 4 accounts per company';
