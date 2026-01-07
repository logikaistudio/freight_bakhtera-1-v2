-- Add service_items column to blink_shipments table
-- This stores the service items breakdown from quotations

ALTER TABLE blink_shipments 
ADD COLUMN IF NOT EXISTS service_items JSONB;

COMMENT ON COLUMN blink_shipments.service_items IS 'Service items breakdown carried over from quotation (JSONB array)';
