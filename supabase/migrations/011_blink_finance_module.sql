-- =====================================================
-- Blink Finance Module - Complete Schema
-- Migration 011: PO, AR, AP, and Accounting Tables
-- =====================================================

-- =====================================================
-- 1. PURCHASE ORDERS (PO)
-- =====================================================
CREATE TABLE IF NOT EXISTS blink_purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT UNIQUE NOT NULL,
    vendor_id TEXT REFERENCES freight_vendors(id) ON DELETE SET NULL,
    vendor_name TEXT NOT NULL,
    vendor_email TEXT,
    vendor_phone TEXT,
    vendor_address TEXT,
    
    -- PO Details
    po_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    payment_terms TEXT DEFAULT 'NET 30',
    
    -- Line Items
    po_items JSONB NOT NULL DEFAULT '[]', -- [{description, qty, unit, unit_price, amount}]
    
    -- Amounts
    currency TEXT DEFAULT 'IDR' CHECK (currency IN ('IDR', 'USD')),
    exchange_rate NUMERIC(15,4) DEFAULT 1,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) DEFAULT 11.00,
    tax_amount NUMERIC(15,2) DEFAULT 0,
    discount_amount NUMERIC(15,2) DEFAULT 0,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    
    -- Status Tracking
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'received', 'cancelled')),
    
    -- Approval
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Receiving
    received_qty NUMERIC(15,2) DEFAULT 0,
    received_date DATE,
    received_by TEXT,
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ACCOUNTS RECEIVABLE (AR)
-- =====================================================
CREATE TABLE IF NOT EXISTS blink_ar_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ar_number TEXT UNIQUE NOT NULL,
    
    -- References
    invoice_id UUID REFERENCES blink_invoices(id) ON DELETE CASCADE,
    invoice_number TEXT,
    customer_id UUID,
    customer_name TEXT NOT NULL,
    
    -- Transaction Details
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    
    -- Amounts
    currency TEXT DEFAULT 'IDR' CHECK (currency IN ('IDR', 'USD')),
    original_amount NUMERIC(15,2) NOT NULL,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    outstanding_amount NUMERIC(15,2) NOT NULL,
    
    -- Aging
    days_outstanding INTEGER GENERATED ALWAYS AS (
        CURRENT_DATE - transaction_date
    ) STORED,
    aging_bucket TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN CURRENT_DATE - transaction_date <= 30 THEN '0-30'
            WHEN CURRENT_DATE - transaction_date <= 60 THEN '31-60'
            WHEN CURRENT_DATE - transaction_date <= 90 THEN '61-90'
            ELSE '90+'
        END
    ) STORED,
    
    -- Status
    status TEXT DEFAULT 'outstanding' CHECK (status IN ('outstanding', 'partial', 'paid', 'overdue', 'written_off')),
    
    -- Payment Tracking
    last_payment_date DATE,
    last_payment_amount NUMERIC(15,2),
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ACCOUNTS PAYABLE (AP)
-- =====================================================
CREATE TABLE IF NOT EXISTS blink_ap_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ap_number TEXT UNIQUE NOT NULL,
    
    -- References
    po_id UUID REFERENCES blink_purchase_orders(id) ON DELETE CASCADE,
    po_number TEXT,
    vendor_id TEXT REFERENCES freight_vendors(id) ON DELETE SET NULL,
    vendor_name TEXT NOT NULL,
    
    -- Bill Details
    bill_number TEXT,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    
    -- Amounts
    currency TEXT DEFAULT 'IDR' CHECK (currency IN ('IDR', 'USD')),
    original_amount NUMERIC(15,2) NOT NULL,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    outstanding_amount NUMERIC(15,2) NOT NULL,
    
    -- Aging
    days_outstanding INTEGER GENERATED ALWAYS AS (
        CURRENT_DATE - bill_date
    ) STORED,
    aging_bucket TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN CURRENT_DATE - bill_date <= 30 THEN '0-30'
            WHEN CURRENT_DATE - bill_date <= 60 THEN '31-60'
            WHEN CURRENT_DATE - bill_date <= 90 THEN '61-90'
            ELSE '90+'
        END
    ) STORED,
    
    -- Status
    status TEXT DEFAULT 'outstanding' CHECK (status IN ('outstanding', 'partial', 'paid', 'overdue')),
    
    -- Payment Tracking
    last_payment_date DATE,
    last_payment_amount NUMERIC(15,2),
    payment_method TEXT,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. JOURNAL ENTRIES (General Ledger)
-- =====================================================
CREATE TABLE IF NOT EXISTS blink_journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number TEXT UNIQUE NOT NULL,
    
    -- Entry Details
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    entry_type TEXT CHECK (entry_type IN ('invoice', 'payment', 'po', 'bill_payment', 'adjustment')),
    
    -- References
    reference_type TEXT, -- 'invoice', 'payment', 'po', etc.
    reference_id UUID,
    reference_number TEXT,
    
    -- Accounting
    account_code TEXT NOT NULL, -- e.g., '1100' (AR), '2100' (AP), '4000' (Revenue)
    account_name TEXT NOT NULL,
    debit NUMERIC(15,2) DEFAULT 0,
    credit NUMERIC(15,2) DEFAULT 0,
    
    -- Amount
    currency TEXT DEFAULT 'IDR' CHECK (currency IN ('IDR', 'USD')),
    
    -- Description
    description TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_po_vendor ON blink_purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON blink_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_date ON blink_purchase_orders(po_date);
CREATE INDEX IF NOT EXISTS idx_po_number ON blink_purchase_orders(po_number);

CREATE INDEX IF NOT EXISTS idx_ar_invoice ON blink_ar_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ar_customer ON blink_ar_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_ar_status ON blink_ar_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ar_due_date ON blink_ar_transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_ar_aging ON blink_ar_transactions(aging_bucket);

CREATE INDEX IF NOT EXISTS idx_ap_po ON blink_ap_transactions(po_id);
CREATE INDEX IF NOT EXISTS idx_ap_vendor ON blink_ap_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_ap_status ON blink_ap_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ap_due_date ON blink_ap_transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_ap_aging ON blink_ap_transactions(aging_bucket);

CREATE INDEX IF NOT EXISTS idx_journal_date ON blink_journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_type ON blink_journal_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_journal_account ON blink_journal_entries(account_code);
CREATE INDEX IF NOT EXISTS idx_journal_reference ON blink_journal_entries(reference_id);

-- =====================================================
-- RLS POLICIES (Row Level Security)
-- =====================================================
-- Allow public access for now (same as other blink tables)
ALTER TABLE blink_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE blink_ar_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blink_ap_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blink_journal_entries ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Allow all for now" ON blink_purchase_orders FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON blink_ar_transactions FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON blink_ap_transactions FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON blink_journal_entries FOR ALL USING (true);

-- =====================================================
-- TRIGGERS for Updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blink_purchase_orders_updated_at BEFORE UPDATE ON blink_purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blink_ar_transactions_updated_at BEFORE UPDATE ON blink_ar_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blink_ap_transactions_updated_at BEFORE UPDATE ON blink_ap_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blink_journal_entries_updated_at BEFORE UPDATE ON blink_journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS for Automatic AR/AP Creation
-- =====================================================

-- Function to create AR from Invoice
CREATE OR REPLACE FUNCTION create_ar_from_invoice()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create AR if invoice is not draft
    IF NEW.status != 'draft' THEN
        INSERT INTO blink_ar_transactions (
            ar_number,
            invoice_id,
            invoice_number,
            customer_id,
            customer_name,
            transaction_date,
            due_date,
            currency,
            original_amount,
            paid_amount,
            outstanding_amount,
            status
        ) VALUES (
            'AR-' || NEW.invoice_number,
            NEW.id,
            NEW.invoice_number,
            NEW.customer_id,
            NEW.customer_name,
            NEW.invoice_date,
            NEW.due_date,
            NEW.currency,
            NEW.total_amount,
            NEW.paid_amount,
            NEW.outstanding_amount,
            CASE 
                WHEN NEW.status = 'paid' THEN 'paid'
                WHEN NEW.paid_amount > 0 THEN 'partial'
                WHEN NEW.status = 'overdue' THEN 'overdue'
                ELSE 'outstanding'
            END
        )
        ON CONFLICT (ar_number) DO UPDATE SET
            paid_amount = EXCLUDED.paid_amount,
            outstanding_amount = EXCLUDED.outstanding_amount,
            status = EXCLUDED.status,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create AP from PO
CREATE OR REPLACE FUNCTION create_ap_from_po()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create AP when PO is approved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        INSERT INTO blink_ap_transactions (
            ap_number,
            po_id,
            po_number,
            vendor_id,
            vendor_name,
            bill_number,
            bill_date,
            due_date,
            currency,
            original_amount,
            paid_amount,
            outstanding_amount,
            status
        ) VALUES (
            'AP-' || NEW.po_number,
            NEW.id,
            NEW.po_number,
            NEW.vendor_id,
            NEW.vendor_name,
            NEW.po_number,
            NEW.po_date,
            NEW.po_date + INTERVAL '30 days',
            NEW.currency,
            NEW.total_amount,
            0,
            NEW.total_amount,
            'outstanding'
        )
        ON CONFLICT (ap_number) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ATTACH TRIGGERS
-- =====================================================
-- Note: We'll attach invoice trigger after verifying blink_invoices structure
-- CREATE TRIGGER trigger_create_ar_from_invoice
--     AFTER INSERT OR UPDATE ON blink_invoices
--     FOR EACH ROW EXECUTE FUNCTION create_ar_from_invoice();

CREATE TRIGGER trigger_create_ap_from_po
    AFTER INSERT OR UPDATE ON blink_purchase_orders
    FOR EACH ROW EXECUTE FUNCTION create_ap_from_po();

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================
COMMENT ON TABLE blink_purchase_orders IS 'Purchase orders for vendor procurement with approval workflow';
COMMENT ON TABLE blink_ar_transactions IS 'Accounts receivable ledger with automatic aging calculation';
COMMENT ON TABLE blink_ap_transactions IS 'Accounts payable ledger with vendor bill tracking';
COMMENT ON TABLE blink_journal_entries IS 'General ledger entries for double-entry bookkeeping';

COMMENT ON COLUMN blink_ar_transactions.aging_bucket IS 'Auto-calculated aging bucket: 0-30, 31-60, 61-90, 90+';
COMMENT ON COLUMN blink_ap_transactions.aging_bucket IS 'Auto-calculated aging bucket: 0-30, 31-60, 61-90, 90+';
COMMENT ON COLUMN blink_journal_entries.account_code IS 'Chart of accounts code (e.g., 1100=AR, 2100=AP, 4000=Revenue)';

-- =====================================================
-- END OF MIGRATION 011
-- =====================================================
