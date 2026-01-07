-- Migration: Add shipping details columns to blink_shipments table
-- Description: Adds BL/AWB, Voyage, Shipper, Delivery Date, Container, Weight, Dimensions, CBM fields

-- Add shipping document fields
ALTER TABLE blink_shipments
ADD COLUMN IF NOT EXISTS bl_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS awb_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS voyage VARCHAR(100),
ADD COLUMN IF NOT EXISTS flight_number VARCHAR(100);

-- Add shipper information
ALTER TABLE blink_shipments
ADD COLUMN IF NOT EXISTS shipper VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipper_name VARCHAR(255);

-- Add delivery date
ALTER TABLE blink_shipments
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS eta TIMESTAMP;

-- Add cargo details
ALTER TABLE blink_shipments
ADD COLUMN IF NOT EXISTS container_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS total_weight DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100),
ADD COLUMN IF NOT EXISTS cbm DECIMAL(10, 3);

-- Add comments
COMMENT ON COLUMN blink_shipments.bl_number IS 'Bill of Lading number for ocean freight';
COMMENT ON COLUMN blink_shipments.awb_number IS 'Air Waybill number for air freight';
COMMENT ON COLUMN blink_shipments.voyage IS 'Voyage number for ocean freight';
COMMENT ON COLUMN blink_shipments.flight_number IS 'Flight number for air freight';
COMMENT ON COLUMN blink_shipments.shipper IS 'Shipper company/person name';
COMMENT ON COLUMN blink_shipments.delivery_date IS 'Actual delivery date';
COMMENT ON COLUMN blink_shipments.eta IS 'Estimated Time of Arrival';
COMMENT ON COLUMN blink_shipments.container_type IS 'Container type (e.g., 20ft, 40ft, 40HC)';
COMMENT ON COLUMN blink_shipments.weight IS 'Cargo weight in kg';
COMMENT ON COLUMN blink_shipments.total_weight IS 'Total gross weight in kg';
COMMENT ON COLUMN blink_shipments.dimensions IS 'Cargo dimensions (L x W x H)';
COMMENT ON COLUMN blink_shipments.cbm IS 'Cubic meters (volume)';
