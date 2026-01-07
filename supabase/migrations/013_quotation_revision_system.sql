-- Migration: Add Quotation Revision System
-- This enables version tracking for quotations, allowing revisions while maintaining history

-- Add revision tracking columns to blink_quotations
ALTER TABLE blink_quotations ADD COLUMN IF NOT EXISTS revision_number INTEGER DEFAULT 1;
ALTER TABLE blink_quotations ADD COLUMN IF NOT EXISTS parent_quotation_id UUID REFERENCES blink_quotations(id) ON DELETE CASCADE;
ALTER TABLE blink_quotations ADD COLUMN IF NOT EXISTS is_superseded BOOLEAN DEFAULT false;
ALTER TABLE blink_quotations ADD COLUMN IF NOT EXISTS superseded_by_id UUID REFERENCES blink_quotations(id) ON DELETE SET NULL;
ALTER TABLE blink_quotations ADD COLUMN IF NOT EXISTS revision_reason TEXT;
ALTER TABLE blink_quotations ADD COLUMN IF NOT EXISTS revised_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE blink_quotations ADD COLUMN IF NOT EXISTS revised_by TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blink_quotations_parent ON blink_quotations(parent_quotation_id) WHERE parent_quotation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blink_quotations_superseded ON blink_quotations(is_superseded) WHERE is_superseded = true;
CREATE INDEX IF NOT EXISTS idx_blink_quotations_revision_number ON blink_quotations(revision_number);

-- Add comment for documentation
COMMENT ON COLUMN blink_quotations.revision_number IS 'Version number of quotation (1, 2, 3...)';
COMMENT ON COLUMN blink_quotations.parent_quotation_id IS 'Link to original/parent quotation for revisions';
COMMENT ON COLUMN blink_quotations.is_superseded IS 'True if this quotation has been replaced by a newer revision';
COMMENT ON COLUMN blink_quotations.superseded_by_id IS 'ID of the newer revision that replaced this quotation';
COMMENT ON COLUMN blink_quotations.revision_reason IS 'Reason for creating this revision (customer request, changes needed, etc)';
COMMENT ON COLUMN blink_quotations.revised_at IS 'Timestamp when this revision was created';
COMMENT ON COLUMN blink_quotations.revised_by IS 'User who created this revision';

-- Update existing quotations to have revision_number = 1 if null
UPDATE blink_quotations SET revision_number = 1 WHERE revision_number IS NULL;
