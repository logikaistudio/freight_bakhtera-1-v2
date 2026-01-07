-- Migration: Enable public access for blink_payments table
-- Fixes: "new row violates row-level security policy for table 'blink_payments'"

-- Enable RLS
ALTER TABLE blink_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
DROP POLICY IF EXISTS "Allow public read blink_payments" ON blink_payments;
CREATE POLICY "Allow public read blink_payments" ON blink_payments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert blink_payments" ON blink_payments;
CREATE POLICY "Allow public insert blink_payments" ON blink_payments
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update blink_payments" ON blink_payments;
CREATE POLICY "Allow public update blink_payments" ON blink_payments
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete blink_payments" ON blink_payments;
CREATE POLICY "Allow public delete blink_payments" ON blink_payments
    FOR DELETE USING (true);
