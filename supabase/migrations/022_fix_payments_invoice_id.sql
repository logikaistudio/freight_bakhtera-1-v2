-- Fix missing invoice_id column in blink_payments table
-- This migration adds the invoice_id column if it doesn't exist

DO $$ 
BEGIN
    -- Check if invoice_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'blink_payments' 
        AND column_name = 'invoice_id'
    ) THEN
        -- Add invoice_id column
        ALTER TABLE blink_payments 
        ADD COLUMN invoice_id UUID REFERENCES blink_invoices(id) ON DELETE CASCADE;
        
        -- Create index for the column
        CREATE INDEX IF NOT EXISTS idx_blink_payments_invoice_id 
        ON blink_payments(invoice_id);
        
        RAISE NOTICE 'Added invoice_id column to blink_payments table';
    ELSE
        RAISE NOTICE 'invoice_id column already exists in blink_payments table';
    END IF;
END $$;
