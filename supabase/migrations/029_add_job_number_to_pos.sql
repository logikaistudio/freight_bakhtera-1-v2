-- Add linking columns to link Costs (PO) to Revenue (Job/Shipment)
ALTER TABLE blink_purchase_orders 
ADD COLUMN IF NOT EXISTS idx serial,
ADD COLUMN IF NOT EXISTS shipment_id uuid REFERENCES blink_shipments(id),
ADD COLUMN IF NOT EXISTS quotation_id uuid REFERENCES blink_quotations(id),
ADD COLUMN IF NOT EXISTS job_number text;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_po_shipment ON blink_purchase_orders(shipment_id);
CREATE INDEX IF NOT EXISTS idx_po_job_number ON blink_purchase_orders(job_number);

COMMENT ON COLUMN blink_purchase_orders.shipment_id IS 'Link to blink_shipments table for Job Profitability';
COMMENT ON COLUMN blink_purchase_orders.job_number IS 'Job Number for easier grouping';
