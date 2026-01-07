-- Migration: Enable public access for blink_ap_transactions table
-- Fixes: Error code 42501 when inserting AP entries from PO approval

-- Enable RLS
ALTER TABLE blink_ap_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
DROP POLICY IF EXISTS "Allow public read blink_ap_transactions" ON blink_ap_transactions;
CREATE POLICY "Allow public read blink_ap_transactions" ON blink_ap_transactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert blink_ap_transactions" ON blink_ap_transactions;
CREATE POLICY "Allow public insert blink_ap_transactions" ON blink_ap_transactions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update blink_ap_transactions" ON blink_ap_transactions;
CREATE POLICY "Allow public update blink_ap_transactions" ON blink_ap_transactions
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete blink_ap_transactions" ON blink_ap_transactions;
CREATE POLICY "Allow public delete blink_ap_transactions" ON blink_ap_transactions
    FOR DELETE USING (true);
