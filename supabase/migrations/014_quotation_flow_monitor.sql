-- Migration: Create Quotation Flow Monitor Table
-- This table tracks all timestamps and users for quotation lifecycle events

CREATE TABLE IF NOT EXISTS blink_quotation_flow_monitor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES blink_quotations(id) ON DELETE CASCADE,
    quotation_number TEXT NOT NULL,
    job_number TEXT NOT NULL,
    
    -- Creation
    created_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    
    -- Manager Approval
    manager_approved_at TIMESTAMP WITH TIME ZONE,
    manager_approved_by TEXT,
    
    -- Revision
    revision_requested_at TIMESTAMP WITH TIME ZONE,
    revision_requested_by TEXT,
    revision_reason TEXT,
    
    -- Sent to Customer
    sent_to_customer_at TIMESTAMP WITH TIME ZONE,
    sent_by TEXT,
    
    -- Customer Decision
    customer_approved_at TIMESTAMP WITH TIME ZONE,
    customer_approved_by TEXT,
    
    -- SO Creation
    so_created_at TIMESTAMP WITH TIME ZONE,
    so_created_by TEXT,
    so_number TEXT,
    
    -- Status and Remarks
    current_status TEXT,
    remark TEXT,
    
    -- System fields
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_flow_monitor_quotation ON blink_quotation_flow_monitor(quotation_id);
CREATE INDEX IF NOT EXISTS idx_flow_monitor_job ON blink_quotation_flow_monitor(job_number);
CREATE INDEX IF NOT EXISTS idx_flow_monitor_quotation_number ON blink_quotation_flow_monitor(quotation_number);
CREATE INDEX IF NOT EXISTS idx_flow_monitor_status ON blink_quotation_flow_monitor(current_status);

-- Comments for documentation
COMMENT ON TABLE blink_quotation_flow_monitor IS 'Tracks timestamps and users for all quotation lifecycle events';
COMMENT ON COLUMN blink_quotation_flow_monitor.quotation_id IS 'Reference to quotation';
COMMENT ON COLUMN blink_quotation_flow_monitor.created_at IS 'When quotation was first created';
COMMENT ON COLUMN blink_quotation_flow_monitor.manager_approved_at IS 'When manager approved the quotation';
COMMENT ON COLUMN blink_quotation_flow_monitor.sent_to_customer_at IS 'When quotation was sent to customer';
COMMENT ON COLUMN blink_quotation_flow_monitor.customer_approved_at IS 'When customer approved the quotation';
COMMENT ON COLUMN blink_quotation_flow_monitor.so_created_at IS  'When Sales Order was created from quotation';
COMMENT ON COLUMN blink_quotation_flow_monitor.remark IS 'Additional notes or remarks for this quotation flow';
