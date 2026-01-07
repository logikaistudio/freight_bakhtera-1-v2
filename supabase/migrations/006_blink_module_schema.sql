-- BLINK Module Database Schema
-- Sales, Operations & Logistics Management System
-- Created: 2025-12-29

-- ============================================================================
-- NOTE: This migration makes customer_id optional
-- If you have a customers table, you can add foreign key later:
-- ALTER TABLE blink_quotations ADD FOREIGN KEY (customer_id) REFERENCES customers(id);
-- ============================================================================

-- ============================================================================
-- 1. QUOTATIONS Table
-- ============================================================================
-- Purpose: Store sales quotations with pricing and service items
-- Used by: QuotationManagement
-- Flow: Create → Finance Approval → Send to Customer → Approved → Create SO

CREATE TABLE IF NOT EXISTS blink_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification
    job_number VARCHAR(50) UNIQUE NOT NULL,  -- Primary reference: JOB-2025-0001
    quotation_number VARCHAR(50),            -- Same as job_number
    
    -- Customer Information (no FK constraint - can link later)
    customer_id UUID,                        -- Optional reference to customers table
    customer_name VARCHAR(255) NOT NULL,
    customer_company VARCHAR(255),
    customer_address TEXT,
    sales_person VARCHAR(255),
    
    -- Quotation Details
    quotation_type VARCHAR(10) DEFAULT 'RG', -- RG=Regular, PJ=Project, CM=Common
    quotation_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    
    -- Route Information
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    service_type VARCHAR(20) NOT NULL,      -- sea, air, land
    cargo_type VARCHAR(50),                  -- FCL, LCL, General, Bulk
    
    -- Cargo Details
    weight DECIMAL(10,2),
    volume DECIMAL(10,2),
    commodity VARCHAR(255),
    
    -- Pricing
    currency VARCHAR(10) DEFAULT 'USD',     -- USD or IDR
    total_amount DECIMAL(15,2) NOT NULL,
    service_items JSONB,                     -- Array of service items with costs
    
    -- Status Management
    status VARCHAR(50) DEFAULT 'draft',
    -- draft → pending_approval → approved_internal → sent → approved → converted → rejected
    rejection_reason TEXT,
    
    -- Additional Info
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_blink_quotations_job_number ON blink_quotations(job_number);
CREATE INDEX idx_blink_quotations_customer_id ON blink_quotations(customer_id);
CREATE INDEX idx_blink_quotations_status ON blink_quotations(status);
CREATE INDEX idx_blink_quotations_quotation_date ON blink_quotations(quotation_date);

-- RLS Policies
ALTER TABLE blink_quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON blink_quotations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON blink_quotations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON blink_quotations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 3. SHIPMENTS Table
-- ============================================================================
-- Purpose: Store operational shipment data
-- Used by: ShipmentManagement, TrackingMonitoring
-- Flow: Auto-created from SO → Pending → Confirmed → Booked → In Transit → Arrived → Delivered → Completed

CREATE TABLE IF NOT EXISTS blink_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification (from Quotation/SO)
    job_number VARCHAR(50) NOT NULL,        -- Reference to quotation
    so_number VARCHAR(50),                  -- Sales Order number
    quotation_id UUID REFERENCES blink_quotations(id) ON DELETE SET NULL,
    
    -- Customer Information (copied from quotation)
    customer_id UUID,                        -- Optional reference
    customer VARCHAR(255) NOT NULL,
    sales_person VARCHAR(255),
    quotation_type VARCHAR(10),
    quotation_date DATE,
    
    -- Route & Service (editable)
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    service_type VARCHAR(20) NOT NULL,     -- sea, air, land
    cargo_type VARCHAR(50),
    
    -- Cargo Details (editable)
    weight DECIMAL(10,2),
    volume DECIMAL(10,2),
    commodity VARCHAR(255),
    
    -- Financial (from quotation, for COGS tracking)
    quoted_amount DECIMAL(15,2),           -- Sales price from quotation
    
    -- Booking Details
    booking JSONB,                          -- { vesselName, voyageNumber, polCode, podCode, etc }
    
    -- Date Management
    etd DATE,                               -- Estimated Time of Departure
    eta DATE,                               -- Estimated Time of Arrival
    actual_departure DATE,
    actual_arrival DATE,
    delivery_date DATE,
    
    -- Container Management
    containers JSONB,                       -- Array of containers
    
    -- COGS & Profit Tracking
    cogs JSONB,                            -- { oceanFreight, trucking, thc, documentation, customs, insurance, demurrage, other }
    cogs_currency VARCHAR(10),             -- USD or IDR
    exchange_rate DECIMAL(10,2),           -- USD to IDR rate
    rate_date DATE,                        -- Exchange rate date
    
    -- Status Management
    status VARCHAR(50) DEFAULT 'pending',
    -- pending → confirmed → booked → in_transit → arrived → delivered → completed
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_from VARCHAR(50) DEFAULT 'sales_order', -- sales_order, manual, import
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_blink_shipments_job_number ON blink_shipments(job_number);
CREATE INDEX idx_blink_shipments_so_number ON blink_shipments(so_number);
CREATE INDEX idx_blink_shipments_quotation_id ON blink_shipments(quotation_id);
CREATE INDEX idx_blink_shipments_customer_id ON blink_shipments(customer_id);
CREATE INDEX idx_blink_shipments_status ON blink_shipments(status);
CREATE INDEX idx_blink_shipments_service_type ON blink_shipments(service_type);
CREATE INDEX idx_blink_shipments_etd ON blink_shipments(etd);

-- RLS Policies
ALTER TABLE blink_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON blink_shipments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON blink_shipments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON blink_shipments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 4. TRACKING_UPDATES Table
-- ============================================================================
-- Purpose: Store shipment tracking timeline
-- Used by: ShipmentManagement (Tracking tab)
-- Relationship: One shipment has many tracking updates

CREATE TABLE IF NOT EXISTS blink_tracking_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationship
    shipment_id UUID REFERENCES blink_shipments(id) ON DELETE CASCADE,
    
    -- Tracking Details
    location VARCHAR(255) NOT NULL,
    status VARCHAR(100),
    notes TEXT,
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_blink_tracking_shipment_id ON blink_tracking_updates(shipment_id);
CREATE INDEX idx_blink_tracking_timestamp ON blink_tracking_updates(timestamp);

-- RLS Policies
ALTER TABLE blink_tracking_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON blink_tracking_updates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON blink_tracking_updates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 5. LEADS Table (CRM)
-- ============================================================================
-- Purpose: Customer leads/prospects management
-- Used by: LeadManagement
-- Flow: New → Contacted → Qualified → Proposal → Won/Lost

CREATE TABLE IF NOT EXISTS blink_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Lead Information
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Lead Details
    source VARCHAR(100),                    -- Website, Referral, Cold Call, etc
    industry VARCHAR(100),
    estimated_value DECIMAL(15,2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'new',      -- new, contacted, qualified, proposal, won, lost
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    
    -- Assignment
    assigned_to VARCHAR(255),              -- Sales person
    
    -- Notes & Follow-up
    notes TEXT,
    next_follow_up DATE,
    
    -- Conversion
    converted_to_customer_id UUID,           -- Optional reference
    conversion_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_blink_leads_status ON blink_leads(status);
CREATE INDEX idx_blink_leads_assigned_to ON blink_leads(assigned_to);
CREATE INDEX idx_blink_leads_next_follow_up ON blink_leads(next_follow_up);

-- RLS Policies
ALTER TABLE blink_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON blink_leads
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- 6. Updated Trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_blink_quotations_updated_at BEFORE UPDATE ON blink_quotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blink_shipments_updated_at BEFORE UPDATE ON blink_shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blink_leads_updated_at BEFORE UPDATE ON blink_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS for Documentation
-- ============================================================================

COMMENT ON TABLE blink_quotations IS 'Sales quotations with pricing and approval workflow';
COMMENT ON TABLE blink_shipments IS 'Operational shipment tracking with COGS and profit management';
COMMENT ON TABLE blink_tracking_updates IS 'Timeline of shipment location and status updates';
COMMENT ON TABLE blink_leads IS 'CRM lead/prospect management';

COMMENT ON COLUMN blink_quotations.job_number IS 'Primary reference number for entire shipment lifecycle';
COMMENT ON COLUMN blink_shipments.quoted_amount IS 'Sales price from quotation for profit calculation';
COMMENT ON COLUMN blink_shipments.cogs IS 'Cost of Goods Sold breakdown in JSON format';
COMMENT ON COLUMN blink_shipments.exchange_rate IS 'USD to IDR conversion rate for multi-currency COGS';
