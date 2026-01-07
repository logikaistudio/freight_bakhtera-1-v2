-- Add Currency Column to blink_shipments
-- Run this in Supabase SQL Editor

-- Add currency column
ALTER TABLE blink_shipments 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add comment
COMMENT ON COLUMN blink_shipments.currency IS 'Currency for quoted_amount (USD/IDR)';

-- Update existing records to have currency
UPDATE blink_shipments 
SET currency = 'USD' 
WHERE currency IS NULL;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_blink_shipments_currency 
ON blink_shipments(currency);

SELECT 'Currency column added successfully!' as status;
