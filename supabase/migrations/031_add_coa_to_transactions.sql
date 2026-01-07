-- Add coa_id to freight_invoices (Revenue)
ALTER TABLE freight_invoices 
ADD COLUMN IF NOT EXISTS coa_id UUID REFERENCES finance_coa(id);

-- Add coa_id to blink_purchase_orders (Expense/Asset)
ALTER TABLE blink_purchase_orders 
ADD COLUMN IF NOT EXISTS coa_id UUID REFERENCES finance_coa(id);

-- Add comment/description for clarity
COMMENT ON COLUMN freight_invoices.coa_id IS 'Link to Chart of Accounts (Revenue/Income)';
COMMENT ON COLUMN blink_purchase_orders.coa_id IS 'Link to Chart of Accounts (Expense/Asset)';
