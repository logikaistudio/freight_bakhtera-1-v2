-- Fix bridge_assets table foreign keys for custom auth
-- Remove foreign key constraints to auth.users since we use custom users table

ALTER TABLE bridge_assets DROP CONSTRAINT IF EXISTS bridge_assets_created_by_fkey;
ALTER TABLE bridge_assets DROP CONSTRAINT IF EXISTS bridge_assets_updated_by_fkey;

-- Make created_by and updated_by nullable (remove NOT NULL if exists)
ALTER TABLE bridge_assets ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE bridge_assets ALTER COLUMN updated_by DROP NOT NULL;

-- Optional: Add comment
COMMENT ON COLUMN bridge_assets.created_by IS 'User ID from custom users table (nullable)';
COMMENT ON COLUMN bridge_assets.updated_by IS 'User ID from custom users table (nullable)';