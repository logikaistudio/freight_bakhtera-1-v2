-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create finance_coa table
CREATE TABLE IF NOT EXISTS finance_coa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    parent_code VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE finance_coa ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Enable all for authenticated users" ON finance_coa
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert Data
INSERT INTO finance_coa 
    (code, name, type, description) 
VALUES
    ('1000', 'ASET', 'ASSET', 'Total Aset'),
    ('1100', 'Aset Lancar', 'ASSET', 'Current Assets'),
    ('1101', 'Kas Besar', 'ASSET', 'Cash on Hand'),
    ('1102', 'Bank BCA', 'ASSET', 'Bank Account'),
    ('1200', 'Piutang Usaha', 'ASSET', 'Accounts Receivable'),
    ('2000', 'KEWAJIBAN', 'LIABILITY', 'Liabilities'),
    ('2100', 'Utang Usaha', 'LIABILITY', 'Accounts Payable'),
    ('3000', 'MODAL', 'EQUITY', 'Equity'),
    ('4000', 'PENDAPATAN', 'REVENUE', 'Revenue'),
    ('4100', 'Pendapatan Jasa', 'REVENUE', 'Service Revenue'),
    ('5000', 'BEBAN', 'EXPENSE', 'Expenses'),
    ('5100', 'Beban Operasional', 'EXPENSE', 'Operational Expenses')
ON CONFLICT (code) DO NOTHING;
