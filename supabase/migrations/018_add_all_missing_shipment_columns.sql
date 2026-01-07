-- Comprehensive migration to add all missing columns to blink_shipments table
-- This adds all columns referenced in ShipmentManagement that are not in the original schema

-- Shipping/Document Details
ALTER TABLE blink_shipments 
ADD COLUMN IF NOT EXISTS container_number TEXT,
ADD COLUMN IF NOT EXISTS container_type TEXT,
ADD COLUMN IF NOT EXISTS vessel_name TEXT,
ADD COLUMN IF NOT EXISTS shipper TEXT,
ADD COLUMN IF NOT EXISTS shipper_name TEXT,
ADD COLUMN IF NOT EXISTS consignee_name TEXT,
ADD COLUMN IF NOT EXISTS flight_number TEXT,
ADD COLUMN IF NOT EXISTS bl_number TEXT,
ADD COLUMN IF NOT EXISTS awb_number TEXT,
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS cbm DECIMAL(10,2);

-- Air Freight Document Numbers
ALTER TABLE blink_shipments
ADD COLUMN IF NOT EXISTS mawb TEXT,
ADD COLUMN IF NOT EXISTS hawb TEXT;

-- Sea Freight Document Numbers  
ALTER TABLE blink_shipments
ADD COLUMN IF NOT EXISTS mbl TEXT,
ADD COLUMN IF NOT EXISTS hbl TEXT;

-- Voyage details
ALTER TABLE blink_shipments
ADD COLUMN IF NOT EXISTS voyage TEXT;

-- Comments
COMMENT ON COLUMN blink_shipments.container_number IS 'Container number for FCL shipments';
COMMENT ON COLUMN blink_shipments.container_type IS 'Type of container (20ft, 40ft, 40HC, etc)';
COMMENT ON COLUMN blink_shipments.vessel_name IS 'Name of vessel/aircraft';
COMMENT ON COLUMN blink_shipments.shipper IS 'Shipper name';
COMMENT ON COLUMN blink_shipments.shipper_name IS 'Alternative shipper name field';
COMMENT ON COLUMN blink_shipments.consignee_name IS 'Consignee name';
COMMENT ON COLUMN blink_shipments.flight_number IS 'Flight number for air freight';
COMMENT ON COLUMN blink_shipments.bl_number IS 'Bill of Lading number for sea freight';
COMMENT ON COLUMN blink_shipments.awb_number IS 'Air Waybill number for air freight';
COMMENT ON COLUMN blink_shipments.dimensions IS 'Cargo dimensions (L x W x H)';
COMMENT ON COLUMN blink_shipments.cbm IS 'Cubic meters measurement';
COMMENT ON COLUMN blink_shipments.mawb IS 'Master Air Waybill number';
COMMENT ON COLUMN blink_shipments.hawb IS 'House Air Waybill number';
COMMENT ON COLUMN blink_shipments.mbl IS 'Master Bill of Lading number';
COMMENT ON COLUMN blink_shipments.hbl IS 'House Bill of Lading number';
COMMENT ON COLUMN blink_shipments.voyage IS 'Voyage number';
