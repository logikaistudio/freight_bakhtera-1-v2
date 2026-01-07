-- Create payments tracking table for Finance module
-- This table stores all payment transactions (incoming from invoices, outgoing to vendors/POs)

-- Payment transactions table
CREATE TABLE IF NOT EXISTS blink_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('incoming', 'outgoing')),
    payment_date DATE NOT NULL,
    
    -- Link to source document (invoice or PO)
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('invoice', 'po')),
    reference_id UUID NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    
    -- Payment details
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'IDR',
    payment_method VARCHAR(50), -- 'bank_transfer', 'cash', 'check', 'credit_card', etc
    bank_account VARCHAR(100),
    transaction_ref VARCHAR(100), -- bank transaction reference or check number
    
    -- Additional info
    description TEXT,
    payment_proof_url TEXT, -- URL to receipt/bukti transfer file
    notes TEXT,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(100)
);

-- Create indexes for better query performance
CREATE INDEX idx_payments_type ON blink_payments(payment_type);
CREATE INDEX idx_payments_date ON blink_payments(payment_date DESC);
CREATE INDEX idx_payments_reference ON blink_payments(reference_type, reference_id);
CREATE INDEX idx_payments_status ON blink_payments(status);
CREATE INDEX idx_payments_created_at ON blink_payments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE blink_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (authenticated users can read/write)
CREATE POLICY "Enable read access for authenticated users" ON blink_payments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON blink_payments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON blink_payments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON blink_payments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blink_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_blink_payments_timestamp
    BEFORE UPDATE ON blink_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_blink_payments_updated_at();

-- Comment on table
COMMENT ON TABLE blink_payments IS 'Payment transactions for invoices (AR) and purchase orders (AP)';
COMMENT ON COLUMN blink_payments.payment_type IS 'Type of payment: incoming (from customers) or outgoing (to vendors)';
COMMENT ON COLUMN blink_payments.reference_type IS 'Source document type: invoice or po';
COMMENT ON COLUMN blink_payments.reference_id IS 'Foreign key to blink_invoices.id or blink_pos.id';
