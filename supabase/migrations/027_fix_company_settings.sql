-- Fix company_settings table - Add missing columns
-- Run this in Supabase SQL Editor

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add company_phone if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'company_phone') THEN
        ALTER TABLE company_settings ADD COLUMN company_phone TEXT;
    END IF;

    -- Add company_fax if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'company_fax') THEN
        ALTER TABLE company_settings ADD COLUMN company_fax TEXT;
    END IF;

    -- Add company_email if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'company_email') THEN
        ALTER TABLE company_settings ADD COLUMN company_email TEXT;
    END IF;

    -- Add company_npwp if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'company_npwp') THEN
        ALTER TABLE company_settings ADD COLUMN company_npwp TEXT;
    END IF;

    -- Add logo_url if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'logo_url') THEN
        ALTER TABLE company_settings ADD COLUMN logo_url TEXT;
    END IF;

    -- Add updated_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'updated_at') THEN
        ALTER TABLE company_settings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'company_settings'
ORDER BY ordinal_position;
