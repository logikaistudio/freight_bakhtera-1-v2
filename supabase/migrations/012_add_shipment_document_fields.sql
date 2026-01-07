-- Add Document Fields to Shipments Table
-- Date: 2025-12-31
-- Purpose: Add comprehensive document tracking fields for shipments

-- ============================================================================
-- Add Document Fields
-- ============================================================================

-- Air Freight Documents
ALTER TABLE blink_shipments 
ADD COLUMN IF NOT EXISTS mawb TEXT,  -- Master Air Waybill
ADD COLUMN IF NOT EXISTS hawb TEXT;  -- House Air Waybill

-- Sea Freight Documents
ALTER TABLE blink_shipments 
ADD COLUMN IF NOT EXISTS hbl TEXT,   -- House Bill of Lading
ADD COLUMN IF NOT EXISTS mbl TEXT;   -- Master Bill of Lading

-- Additional Shipping Details
ALTER TABLE blink_shipments 
ADD COLUMN IF NOT EXISTS consignee_name TEXT;  -- Consignee/Receiver

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON COLUMN blink_shipments.mawb IS 'Master Air Waybill number for air freight';
COMMENT ON COLUMN blink_shipments.hawb IS 'House Air Waybill number for air freight consolidation';
COMMENT ON COLUMN blink_shipments.hbl IS 'House Bill of Lading for sea freight LCL';
COMMENT ON COLUMN blink_shipments.mbl IS 'Master Bill of Lading for sea freight';
COMMENT ON COLUMN blink_shipments.consignee_name IS 'Name of the consignee/receiver of the shipment';

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blink_shipments'
  AND column_name IN ('mawb', 'hawb', 'hbl', 'mbl', 'consignee_name')
ORDER BY column_name;
