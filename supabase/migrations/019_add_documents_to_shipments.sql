-- Add documents column to blink_shipments table
-- This column stores uploaded documents as JSONB array

ALTER TABLE blink_shipments 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN blink_shipments.documents IS 'Array of uploaded documents (BL, Invoice, Packing List, etc) stored as base64';
