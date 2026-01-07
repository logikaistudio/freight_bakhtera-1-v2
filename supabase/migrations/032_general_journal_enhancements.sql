-- =====================================================
-- General Journal Enhancements
-- Migration 032: Enhance blink_journal_entries for double-entry bookkeeping
-- =====================================================

-- Add COA reference for proper account linking
ALTER TABLE blink_journal_entries
ADD COLUMN IF NOT EXISTS coa_id UUID REFERENCES finance_coa(id);

-- Add batch_id to group related entries (e.g., debit & credit of same transaction)
ALTER TABLE blink_journal_entries
ADD COLUMN IF NOT EXISTS batch_id UUID DEFAULT uuid_generate_v4();

-- Add source to distinguish auto vs manual entries
ALTER TABLE blink_journal_entries
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'auto' CHECK (source IN ('auto', 'manual'));

-- Add party info for better tracking
ALTER TABLE blink_journal_entries
ADD COLUMN IF NOT EXISTS party_name TEXT; -- Customer/Vendor name
ALTER TABLE blink_journal_entries
ADD COLUMN IF NOT EXISTS party_id TEXT; -- Customer/Vendor ID

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_coa ON blink_journal_entries(coa_id);
CREATE INDEX IF NOT EXISTS idx_journal_batch ON blink_journal_entries(batch_id);
CREATE INDEX IF NOT EXISTS idx_journal_source ON blink_journal_entries(source);

-- =====================================================
-- Function to generate journal entry number
-- =====================================================
CREATE OR REPLACE FUNCTION generate_journal_entry_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_month TEXT;
BEGIN
    year_month := TO_CHAR(CURRENT_DATE, 'YYMM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 'JE-\d{4}-(\d+)') AS INTEGER)), 0) + 1
    INTO next_num
    FROM blink_journal_entries
    WHERE entry_number LIKE 'JE-' || year_month || '-%';
    
    RETURN 'JE-' || year_month || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- END OF MIGRATION 032
-- =====================================================
