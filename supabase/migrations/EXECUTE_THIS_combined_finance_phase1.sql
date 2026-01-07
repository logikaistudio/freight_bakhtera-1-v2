-- =====================================================
-- COMBINED MIGRATION - Finance Module Phase 1
-- Run this in Supabase SQL Editor
-- =====================================================
-- This combines:
-- - 009_blink_invoice_module.sql (Invoice & Payments)
-- - 020_finance_payments.sql (Enhanced Payment Tracking)
-- =====================================================

-- ============================================================================
-- CHECK: Drop existing blink_payments if exists (to avoid conflict)
-- ============================================================================
DROP TABLE IF EXISTS blink_payments CASCADE;

-- ============================================================================
-- 1. INVOICES Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS blink_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    quotation_id UUID REFERENCES blink_quotations(id) ON DELETE SET NULL,
    shipment_id UUID REFERENCES blink_shipments(id) ON DELETE SET NULL,
    job_number VARCHAR(50) NOT NULL,
    so_number VARCHAR(50),
    
    -- Customer Information
    customer_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_company VARCHAR(255),
    customer_address TEXT,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Invoice Details
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    payment_terms VARCHAR(100) DEFAULT 'NET 30',
    
    -- Route & Service Reference
    origin VARCHAR(255),
    destination VARCHAR(255),
    service_type VARCHAR(20),
    cargo_details JSONB,
    booking_details JSONB,
    
    -- Invoice Items
    invoice_items JSONB NOT NULL,
    
    -- Financial Calculations
    currency VARCHAR(10) DEFAULT 'IDR',
    subtotal DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 11.00,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    discount_reason TEXT,
    total_amount DECIMAL(15,2) NOT NULL,
    
    -- Payment Tracking
    paid_amount DECIMAL(15,2) DEFAULT 0,
    outstanding_amount DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Payment Banking Info
    bank_account_id UUID,
    bank_details JSONB,
    
    -- Additional Info
    notes TEXT,
    customer_notes TEXT,
    
    -- Document Management
    pdf_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    sent_by UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Indexes for blink_invoices
CREATE INDEX IF NOT EXISTS idx_blink_invoices_invoice_number ON blink_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_blink_invoices_job_number ON blink_invoices(job_number);
CREATE INDEX IF NOT EXISTS idx_blink_invoices_customer_id ON blink_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_blink_invoices_status ON blink_invoices(status);
CREATE INDEX IF NOT EXISTS idx_blink_invoices_due_date ON blink_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_blink_invoices_invoice_date ON blink_invoices(invoice_date);

-- RLS for blink_invoices
ALTER TABLE blink_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON blink_invoices;
CREATE POLICY "Enable read access for authenticated users" ON blink_invoices
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON blink_invoices;
CREATE POLICY "Enable insert for authenticated users" ON blink_invoices
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON blink_invoices;
CREATE POLICY "Enable update for authenticated users" ON blink_invoices
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 2. ENHANCED PAYMENTS Table (Phase 1 - Unified AR/AP)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blink_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('incoming', 'outgoing')),
    payment_date DATE NOT NULL,
    
    -- Link to source document (invoice or PO)
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('invoice', 'po')),
    reference_id UUID NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    
    -- Payment details
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'IDR',
    payment_method VARCHAR(50),
    bank_account VARCHAR(100),
    transaction_ref VARCHAR(100),
    
    -- Additional info
    description TEXT,
    payment_proof_url TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(100)
);

-- Indexes for blink_payments
CREATE INDEX IF NOT EXISTS idx_payments_type ON blink_payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_date ON blink_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON blink_payments(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON blink_payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON blink_payments(created_at DESC);

-- RLS for blink_payments
ALTER TABLE blink_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON blink_payments;
CREATE POLICY "Enable read access for authenticated users" ON blink_payments
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON blink_payments;
CREATE POLICY "Enable insert for authenticated users" ON blink_payments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON blink_payments;
CREATE POLICY "Enable update for authenticated users" ON blink_payments
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON blink_payments;
CREATE POLICY "Enable delete for authenticated users" ON blink_payments
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 3. BANK_ACCOUNTS Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    bank_name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    swift_code VARCHAR(20),
    branch VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'IDR',
    
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for default bank per currency
DROP INDEX IF EXISTS idx_bank_accounts_default_currency;
CREATE UNIQUE INDEX idx_bank_accounts_default_currency 
ON bank_accounts(currency, is_default) 
WHERE is_default = true;

-- RLS for bank_accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON bank_accounts;
CREATE POLICY "Enable all access for authenticated users" ON bank_accounts
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- 4. PURCHASE ORDERS Table (if not exists from migration 011)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blink_pos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT UNIQUE NOT NULL,
    vendor_id TEXT,
    vendor_name TEXT NOT NULL,
    vendor_email TEXT,
    vendor_phone TEXT,
    vendor_address TEXT,
    
    -- PO Details
    po_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    payment_terms TEXT DEFAULT 'NET 30',
    
    -- Line Items
    po_items JSONB NOT NULL DEFAULT '[]',
    
    -- Amounts
    currency TEXT DEFAULT 'IDR' CHECK (currency IN ('IDR', 'USD')),
    exchange_rate NUMERIC(15,4) DEFAULT 1,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) DEFAULT 11.00,
    tax_amount NUMERIC(15,2) DEFAULT 0,
    discount_amount NUMERIC(15,2) DEFAULT 0,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    
    -- Payment Tracking (Phase 1 addition)
    paid_amount NUMERIC(15,2) DEFAULT 0,
    outstanding_amount NUMERIC(15,2),
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'received', 'cancelled')),
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT
);

-- Indexes for blink_pos
CREATE INDEX IF NOT EXISTS idx_blink_pos_po_number ON blink_pos(po_number);
CREATE INDEX IF NOT EXISTS idx_blink_pos_vendor_id ON blink_pos(vendor_id);
CREATE INDEX IF NOT EXISTS idx_blink_pos_status ON blink_pos(status);
CREATE INDEX IF NOT EXISTS idx_blink_pos_po_date ON blink_pos(po_date);

-- RLS for blink_pos
ALTER TABLE blink_pos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON blink_pos;
CREATE POLICY "Enable all access for authenticated users" ON blink_pos
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- 5. Triggers for updated_at
-- ============================================================================

-- Function for updating updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_blink_invoices_updated_at ON blink_invoices;
CREATE TRIGGER update_blink_invoices_updated_at BEFORE UPDATE ON blink_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blink_payments_timestamp ON blink_payments;
CREATE TRIGGER update_blink_payments_timestamp
    BEFORE UPDATE ON blink_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blink_pos_updated_at ON blink_pos;
CREATE TRIGGER update_blink_pos_updated_at BEFORE UPDATE ON blink_pos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Sample Data - Bank Accounts
-- ============================================================================
INSERT INTO bank_accounts (bank_name, account_name, account_number, currency, is_default, is_active)
VALUES 
    ('Bank Mandiri', 'PT Bakhtera-1', '1234567890', 'IDR', true, true),
    ('Bank Central Asia (BCA)', 'PT Bakhtera-1', '0987654321', 'IDR', false, true),
    ('Standard Chartered Bank', 'PT Bakhtera-1', 'USD1234567890', 'USD', true, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. Comments for Documentation
-- ============================================================================
COMMENT ON TABLE blink_invoices IS 'Sales invoices with payment tracking';
COMMENT ON TABLE blink_payments IS 'Unified payment tracking for AR (invoices) and AP (POs)';
COMMENT ON TABLE bank_accounts IS 'Company bank accounts for payments';
COMMENT ON TABLE blink_pos IS 'Purchase orders with payment tracking';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after migration to verify:

-- Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('blink_invoices', 'blink_payments', 'bank_accounts', 'blink_pos')
ORDER BY table_name;

-- Check bank accounts
SELECT * FROM bank_accounts;

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('blink_invoices', 'blink_payments', 'bank_accounts', 'blink_pos');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Expected result:
-- ✅ blink_invoices table created
-- ✅ blink_payments table created (enhanced version)
-- ✅ bank_accounts table created with 3 sample records
-- ✅ blink_pos table created with payment tracking fields
-- ✅ All RLS policies enabled
-- ✅ Triggers for updated_at configured
-- ============================================================================
