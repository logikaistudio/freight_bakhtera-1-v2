-- =====================================================
-- Auto Journal Entries Generation
-- Migration 033: Create journal entries from AR and AP
-- =====================================================

-- =====================================================
-- Function: Create Journal Entry for AR Transactions
-- Double-entry: Debit AR (120-xxx), Credit Revenue (400-xxx)
-- =====================================================
CREATE OR REPLACE FUNCTION create_journal_from_ar()
RETURNS TRIGGER AS $$
DECLARE
    batch_uuid UUID := uuid_generate_v4();
    entry_num TEXT;
    ar_coa_id UUID;
    revenue_coa_id UUID;
BEGIN
    -- Generate entry number
    entry_num := 'JE-AR-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT, 6, '0')::TEXT;
    
    -- Get COA IDs (defaults if not found)
    SELECT id INTO ar_coa_id FROM finance_coa WHERE code LIKE '120%' LIMIT 1;
    SELECT id INTO revenue_coa_id FROM finance_coa WHERE code LIKE '400%' LIMIT 1;
    
    -- Only create journal for new AR records or status changes
    IF TG_OP = 'INSERT' THEN
        -- DEBIT: Accounts Receivable
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name, party_id
        ) VALUES (
            entry_num || '-D',
            NEW.transaction_date,
            'invoice',
            'ar',
            NEW.id,
            NEW.ar_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = ar_coa_id), '120-001'),
            'Piutang Usaha - ' || NEW.customer_name,
            NEW.original_amount,
            0,
            NEW.currency,
            'Invoice ' || COALESCE(NEW.invoice_number, NEW.ar_number) || ' - ' || NEW.customer_name,
            batch_uuid,
            'auto',
            ar_coa_id,
            NEW.customer_name,
            NEW.customer_id::TEXT
        );
        
        -- CREDIT: Revenue/Pendapatan
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name, party_id
        ) VALUES (
            entry_num || '-C',
            NEW.transaction_date,
            'invoice',
            'ar',
            NEW.id,
            NEW.ar_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = revenue_coa_id), '400-001'),
            'Pendapatan Jasa',
            0,
            NEW.original_amount,
            NEW.currency,
            'Invoice ' || COALESCE(NEW.invoice_number, NEW.ar_number) || ' - ' || NEW.customer_name,
            batch_uuid,
            'auto',
            revenue_coa_id,
            NEW.customer_name,
            NEW.customer_id::TEXT
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Create Journal Entry for AR Payment
-- Double-entry: Debit Cash/Bank (110-xxx), Credit AR (120-xxx)
-- =====================================================
CREATE OR REPLACE FUNCTION create_journal_from_ar_payment()
RETURNS TRIGGER AS $$
DECLARE
    batch_uuid UUID := uuid_generate_v4();
    entry_num TEXT;
    cash_coa_id UUID;
    ar_coa_id UUID;
    payment_amount NUMERIC;
BEGIN
    -- Only create journal if payment was made
    IF NEW.paid_amount > COALESCE(OLD.paid_amount, 0) THEN
        payment_amount := NEW.paid_amount - COALESCE(OLD.paid_amount, 0);
        entry_num := 'JE-PAY-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT, 6, '0')::TEXT;
        
        -- Get COA IDs
        SELECT id INTO cash_coa_id FROM finance_coa WHERE code LIKE '110%' LIMIT 1;
        SELECT id INTO ar_coa_id FROM finance_coa WHERE code LIKE '120%' LIMIT 1;
        
        -- DEBIT: Cash/Bank
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name, party_id
        ) VALUES (
            entry_num || '-D',
            CURRENT_DATE,
            'payment',
            'ar_payment',
            NEW.id,
            NEW.ar_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = cash_coa_id), '110-001'),
            'Kas/Bank',
            payment_amount,
            0,
            NEW.currency,
            'Pembayaran ' || NEW.ar_number || ' - ' || NEW.customer_name,
            batch_uuid,
            'auto',
            cash_coa_id,
            NEW.customer_name,
            NEW.customer_id::TEXT
        );
        
        -- CREDIT: Accounts Receivable
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name, party_id
        ) VALUES (
            entry_num || '-C',
            CURRENT_DATE,
            'payment',
            'ar_payment',
            NEW.id,
            NEW.ar_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = ar_coa_id), '120-001'),
            'Piutang Usaha',
            0,
            payment_amount,
            NEW.currency,
            'Pembayaran ' || NEW.ar_number || ' - ' || NEW.customer_name,
            batch_uuid,
            'auto',
            ar_coa_id,
            NEW.customer_name,
            NEW.customer_id::TEXT
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Create Journal Entry for AP Transactions
-- Double-entry: Debit Expense (500-xxx), Credit AP (210-xxx)
-- =====================================================
CREATE OR REPLACE FUNCTION create_journal_from_ap()
RETURNS TRIGGER AS $$
DECLARE
    batch_uuid UUID := uuid_generate_v4();
    entry_num TEXT;
    ap_coa_id UUID;
    expense_coa_id UUID;
BEGIN
    entry_num := 'JE-AP-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT, 6, '0')::TEXT;
    
    -- Get COA IDs
    SELECT id INTO ap_coa_id FROM finance_coa WHERE code LIKE '210%' LIMIT 1;
    SELECT id INTO expense_coa_id FROM finance_coa WHERE code LIKE '500%' LIMIT 1;
    
    IF TG_OP = 'INSERT' THEN
        -- DEBIT: Expense/Beban
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name, party_id
        ) VALUES (
            entry_num || '-D',
            NEW.bill_date,
            'po',
            'ap',
            NEW.id,
            NEW.ap_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = expense_coa_id), '500-001'),
            'Beban Operasional',
            NEW.original_amount,
            0,
            NEW.currency,
            'PO ' || COALESCE(NEW.po_number, NEW.ap_number) || ' - ' || NEW.vendor_name,
            batch_uuid,
            'auto',
            expense_coa_id,
            NEW.vendor_name,
            NEW.vendor_id
        );
        
        -- CREDIT: Accounts Payable
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name, party_id
        ) VALUES (
            entry_num || '-C',
            NEW.bill_date,
            'po',
            'ap',
            NEW.id,
            NEW.ap_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = ap_coa_id), '210-001'),
            'Hutang Usaha - ' || NEW.vendor_name,
            0,
            NEW.original_amount,
            NEW.currency,
            'PO ' || COALESCE(NEW.po_number, NEW.ap_number) || ' - ' || NEW.vendor_name,
            batch_uuid,
            'auto',
            ap_coa_id,
            NEW.vendor_name,
            NEW.vendor_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Drop existing triggers if any
DROP TRIGGER IF EXISTS trigger_journal_from_ar ON blink_ar_transactions;
DROP TRIGGER IF EXISTS trigger_journal_from_ar_payment ON blink_ar_transactions;
DROP TRIGGER IF EXISTS trigger_journal_from_ap ON blink_ap_transactions;

-- Create triggers
CREATE TRIGGER trigger_journal_from_ar
    AFTER INSERT ON blink_ar_transactions
    FOR EACH ROW EXECUTE FUNCTION create_journal_from_ar();

CREATE TRIGGER trigger_journal_from_ar_payment
    AFTER UPDATE OF paid_amount ON blink_ar_transactions
    FOR EACH ROW EXECUTE FUNCTION create_journal_from_ar_payment();

CREATE TRIGGER trigger_journal_from_ap
    AFTER INSERT ON blink_ap_transactions
    FOR EACH ROW EXECUTE FUNCTION create_journal_from_ap();

-- =====================================================
-- BACKFILL: Create journal entries from existing AR data
-- =====================================================
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
        
        -- DEBIT: Accounts Receivable
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name
        ) VALUES (
            entry_num || '-D',
            ar_rec.transaction_date,
            'invoice',
            'ar',
            ar_rec.id,
            ar_rec.ar_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = ar_coa_id), '120-001'),
            'Piutang Usaha - ' || ar_rec.customer_name,
            ar_rec.original_amount,
            0,
            ar_rec.currency,
            'Invoice ' || COALESCE(ar_rec.invoice_number, ar_rec.ar_number) || ' - ' || ar_rec.customer_name,
            batch_uuid,
            'auto',
            ar_coa_id,
            ar_rec.customer_name
        );
        
        -- CREDIT: Revenue
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name
        ) VALUES (
            entry_num || '-C',
            ar_rec.transaction_date,
            'invoice',
            'ar',
            ar_rec.id,
            ar_rec.ar_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = revenue_coa_id), '400-001'),
            'Pendapatan Jasa',
            0,
            ar_rec.original_amount,
            ar_rec.currency,
            'Invoice ' || COALESCE(ar_rec.invoice_number, ar_rec.ar_number) || ' - ' || ar_rec.customer_name,
            batch_uuid,
            'auto',
            revenue_coa_id,
            ar_rec.customer_name
        );
        
        -- If there's payment, create payment journal too
        IF ar_rec.paid_amount > 0 THEN
            batch_uuid := uuid_generate_v4();
            entry_num := 'JE-PAY-BF-' || LPAD(counter::TEXT, 4, '0');
            
            -- DEBIT: Cash
            INSERT INTO blink_journal_entries (
                entry_number, entry_date, entry_type, 
                reference_type, reference_id, reference_number,
                account_code, account_name, 
                debit, credit, 
                currency, description, 
                batch_id, source, coa_id,
                party_name
            ) VALUES (
                entry_num || '-D',
                COALESCE(ar_rec.last_payment_date, ar_rec.transaction_date),
                'payment',
                'ar_payment',
                ar_rec.id,
                ar_rec.ar_number,
                '110-001',
                'Kas/Bank',
                ar_rec.paid_amount,
                0,
                ar_rec.currency,
                'Pembayaran ' || ar_rec.ar_number || ' - ' || ar_rec.customer_name,
                batch_uuid,
                'auto',
                NULL,
                ar_rec.customer_name
            );
            
            -- CREDIT: AR
            INSERT INTO blink_journal_entries (
                entry_number, entry_date, entry_type, 
                reference_type, reference_id, reference_number,
                account_code, account_name, 
                debit, credit, 
                currency, description, 
                batch_id, source, coa_id,
                party_name
            ) VALUES (
                entry_num || '-C',
                COALESCE(ar_rec.last_payment_date, ar_rec.transaction_date),
                'payment',
                'ar_payment',
                ar_rec.id,
                ar_rec.ar_number,
                COALESCE((SELECT code FROM finance_coa WHERE id = ar_coa_id), '120-001'),
                'Piutang Usaha',
                0,
                ar_rec.paid_amount,
                ar_rec.currency,
                'Pembayaran ' || ar_rec.ar_number || ' - ' || ar_rec.customer_name,
                batch_uuid,
                'auto',
                ar_coa_id,
                ar_rec.customer_name
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Backfilled % AR transactions to journal entries', counter;
END $$;

-- =====================================================
-- BACKFILL: Create journal entries from existing AP data
-- =====================================================
DO $$
DECLARE
    ap_rec RECORD;
    batch_uuid UUID;
    entry_num TEXT;
    ap_coa_id UUID;
    expense_coa_id UUID;
    counter INTEGER := 0;
BEGIN
    -- Get COA IDs
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
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name
        ) VALUES (
            entry_num || '-D',
            ap_rec.bill_date,
            'po',
            'ap',
            ap_rec.id,
            ap_rec.ap_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = expense_coa_id), '500-001'),
            'Beban Operasional',
            ap_rec.original_amount,
            0,
            ap_rec.currency,
            'PO ' || COALESCE(ap_rec.po_number, ap_rec.ap_number) || ' - ' || ap_rec.vendor_name,
            batch_uuid,
            'auto',
            expense_coa_id,
            ap_rec.vendor_name
        );
        
        -- CREDIT: Accounts Payable
        INSERT INTO blink_journal_entries (
            entry_number, entry_date, entry_type, 
            reference_type, reference_id, reference_number,
            account_code, account_name, 
            debit, credit, 
            currency, description, 
            batch_id, source, coa_id,
            party_name
        ) VALUES (
            entry_num || '-C',
            ap_rec.bill_date,
            'po',
            'ap',
            ap_rec.id,
            ap_rec.ap_number,
            COALESCE((SELECT code FROM finance_coa WHERE id = ap_coa_id), '210-001'),
            'Hutang Usaha - ' || ap_rec.vendor_name,
            0,
            ap_rec.original_amount,
            ap_rec.currency,
            'PO ' || COALESCE(ap_rec.po_number, ap_rec.ap_number) || ' - ' || ap_rec.vendor_name,
            batch_uuid,
            'auto',
            ap_coa_id,
            ap_rec.vendor_name
        );
    END LOOP;
    
    RAISE NOTICE 'Backfilled % AP transactions to journal entries', counter;
END $$;

-- =====================================================
-- END OF MIGRATION 033
-- =====================================================
