
-- =====================================================
-- FIX: General Journal Schema and Data Backfill
-- Run this script to update the database structure and populate data
-- =====================================================

-- 1. Add missing columns to blink_journal_entries
ALTER TABLE blink_journal_entries
ADD COLUMN IF NOT EXISTS coa_id UUID REFERENCES finance_coa(id),
ADD COLUMN IF NOT EXISTS batch_id UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'auto' CHECK (source IN ('auto', 'manual')),
ADD COLUMN IF NOT EXISTS party_name TEXT,
ADD COLUMN IF NOT EXISTS party_id TEXT;

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS idx_journal_coa ON blink_journal_entries(coa_id);
CREATE INDEX IF NOT EXISTS idx_journal_batch ON blink_journal_entries(batch_id);
CREATE INDEX IF NOT EXISTS idx_journal_source ON blink_journal_entries(source);

-- 3. Create/Replace Journal Entry Number Function
CREATE OR REPLACE FUNCTION generate_journal_entry_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
BEGIN
    -- Get the next number for current month using split_part (simpler than regex)
    -- Format: JE-YYMM-XXXX (split by '-' gives 1:JE, 2:YYMM, 3:XXXX)
    SELECT COALESCE(MAX(CAST(split_part(entry_number, '-', 3) AS INTEGER)), 0) + 1
    INTO next_num
    FROM blink_journal_entries
    WHERE entry_number LIKE 'JE-' || to_char(current_date, 'YYMM') || '-%';
    
    RETURN 'JE-' || to_char(current_date, 'YYMM') || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Backfill Data from AR Transactions
DO $$
DECLARE
    ar_rec RECORD;
    batch_uuid UUID;
    entry_num TEXT;
    ar_coa_id UUID;
    revenue_coa_id UUID;
    counter INTEGER := 0;
BEGIN
    -- Get COA IDs
    SELECT id INTO ar_coa_id FROM finance_coa WHERE code LIKE '120%' LIMIT 1;
    SELECT id INTO revenue_coa_id FROM finance_coa WHERE code LIKE '400%' LIMIT 1;
    
    FOR ar_rec IN 
        SELECT * FROM blink_ar_transactions 
        WHERE NOT EXISTS (
            SELECT 1 FROM blink_journal_entries 
            WHERE reference_id = blink_ar_transactions.id 
            AND reference_type = 'ar'
        )
    LOOP
        batch_uuid := uuid_generate_v4();
        counter := counter + 1;
        entry_num := 'JE-AR-BF-' || LPAD(counter::TEXT, 4, '0');
        
        -- DEBIT: AR
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, reference_type, reference_id, reference_number,
            account_code, account_name, debit, credit, currency, description, 
            batch_id, source, coa_id, party_name
        ) VALUES (
            entry_num || '-D', ar_rec.transaction_date, 'invoice', 'ar', ar_rec.id, ar_rec.ar_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = ar_coa_id), '120-001'),
            'Piutang Usaha - ' || ar_rec.customer_name,
            ar_rec.original_amount, 0, ar_rec.currency, 
            'Invoice ' || COALESCE(ar_rec.invoice_number, ar_rec.ar_number) || ' - ' || ar_rec.customer_name,
            batch_uuid, 'auto', ar_coa_id, ar_rec.customer_name
        );
        
        -- CREDIT: Revenue
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, reference_type, reference_id, reference_number,
            account_code, account_name, debit, credit, currency, description, 
            batch_id, source, coa_id, party_name
        ) VALUES (
            entry_num || '-C', ar_rec.transaction_date, 'invoice', 'ar', ar_rec.id, ar_rec.ar_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = revenue_coa_id), '400-001'),
            'Pendapatan Jasa',
            0, ar_rec.original_amount, ar_rec.currency, 
            'Invoice ' || COALESCE(ar_rec.invoice_number, ar_rec.ar_number) || ' - ' || ar_rec.customer_name,
            batch_uuid, 'auto', revenue_coa_id, ar_rec.customer_name
        );
    END LOOP;
END $$;

-- 5. Backfill Data from AP Transactions
DO $$
DECLARE
    ap_rec RECORD;
    batch_uuid UUID;
    entry_num TEXT;
    ap_coa_id UUID;
    expense_coa_id UUID;
    counter INTEGER := 0;
BEGIN
    SELECT id INTO ap_coa_id FROM finance_coa WHERE code LIKE '210%' LIMIT 1;
    SELECT id INTO expense_coa_id FROM finance_coa WHERE code LIKE '500%' LIMIT 1;
    
    FOR ap_rec IN 
        SELECT * FROM blink_ap_transactions 
        WHERE NOT EXISTS (
            SELECT 1 FROM blink_journal_entries 
            WHERE reference_id = blink_ap_transactions.id 
            AND reference_type = 'ap'
        )
    LOOP
        batch_uuid := uuid_generate_v4();
        counter := counter + 1;
        entry_num := 'JE-AP-BF-' || LPAD(counter::TEXT, 4, '0');
        
        -- DEBIT: Expense
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, reference_type, reference_id, reference_number,
            account_code, account_name, debit, credit, currency, description, 
            batch_id, source, coa_id, party_name
        ) VALUES (
            entry_num || '-D', ap_rec.bill_date, 'po', 'ap', ap_rec.id, ap_rec.ap_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = expense_coa_id), '500-001'),
            'Beban Operasional',
            ap_rec.original_amount, 0, ap_rec.currency, 
            'PO ' || COALESCE(ap_rec.po_number, ap_rec.ap_number) || ' - ' || ap_rec.vendor_name,
            batch_uuid, 'auto', expense_coa_id, ap_rec.vendor_name
        );
        
        -- CREDIT: AP
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, reference_type, reference_id, reference_number,
            account_code, account_name, debit, credit, currency, description, 
            batch_id, source, coa_id, party_name
        ) VALUES (
            entry_num || '-C', ap_rec.bill_date, 'po', 'ap', ap_rec.id, ap_rec.ap_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = ap_coa_id), '210-001'),
            'Hutang Usaha - ' || ap_rec.vendor_name,
            0, ap_rec.original_amount, ap_rec.currency, 
            'PO ' || COALESCE(ap_rec.po_number, ap_rec.ap_number) || ' - ' || ap_rec.vendor_name,
            batch_uuid, 'auto', ap_coa_id, ap_rec.vendor_name
        );
    END LOOP;
END $$;
