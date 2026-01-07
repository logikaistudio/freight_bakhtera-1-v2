-- Add notes column to blink_shipments table
-- This is needed for Sales Order creation from quotations to carry over notes

ALTER TABLE blink_shipments 
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN blink_shipments.notes IS 'Additional notes and remarks for the shipment, can be carried over from quotation';
