-- Migration: Seed locations table for exhibition/warehouse locations
-- Run this in Supabase SQL Editor

-- 1. Create locations table if not exists
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    is_exhibition BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (optional, adjust as needed)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for public read access (adjust if needed)
DROP POLICY IF EXISTS "Allow public read access on locations" ON locations;
CREATE POLICY "Allow public read access on locations" ON locations FOR SELECT USING (true);

-- 4. Seed default locations (upsert style)
INSERT INTO locations (value, label, is_exhibition, is_default) VALUES
    ('gudang', 'Gudang', false, true),
    ('parkiran', 'Parkiran', false, false)
ON CONFLICT (value) DO UPDATE SET
    label = EXCLUDED.label,
    is_exhibition = EXCLUDED.is_exhibition,
    is_default = EXCLUDED.is_default,
    updated_at = NOW();

-- 5. Seed Hall 1-11 as exhibition locations
INSERT INTO locations (value, label, is_exhibition, is_default) 
SELECT 
    'hall ' || generate_series,
    'Hall ' || generate_series,
    true,
    false
FROM generate_series(1, 11)
ON CONFLICT (value) DO UPDATE SET
    label = EXCLUDED.label,
    is_exhibition = EXCLUDED.is_exhibition,
    is_default = EXCLUDED.is_default,
    updated_at = NOW();

-- 6. Verify data
SELECT * FROM locations ORDER BY is_default DESC, label ASC;