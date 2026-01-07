-- Add bl_date column to blink_shipments table
-- This stores the Bill of Lading date for shipments

ALTER TABLE blink_shipments 
ADD COLUMN IF NOT EXISTS bl_date DATE;

COMMENT ON COLUMN blink_shipments.bl_date IS 'Bill of Lading date for the shipment';
