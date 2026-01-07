-- Migration 036: Add internal_notes for change tracking in BIG module
-- Enables re-approval flow for quotations with audit trail

-- Add internal_notes to big_quotations
ALTER TABLE big_quotations ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add internal_notes to big_invoices  
ALTER TABLE big_invoices ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add internal_notes to big_costs
ALTER TABLE big_costs ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add quotation_id to big_costs for linking costs to source quotation
ALTER TABLE big_costs ADD COLUMN IF NOT EXISTS quotation_id UUID REFERENCES big_quotations(id);
