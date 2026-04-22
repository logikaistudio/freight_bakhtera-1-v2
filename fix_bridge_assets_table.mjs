import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkyoszmtyrpdwfjxggmb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reW9zem10eXJwZHdmanhnZ21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcxMDMxNiwiZXhwIjoyMDgyMjg2MzE2fQ.Rc4bf2Ju6rGDZ18FnPbHna80L_720xtQDHBu7debMPU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAndCreateBridgeAssets() {
    try {
        console.log('🔍 Checking bridge_assets table...\n');

        // Try to query the table
        const { data, error } = await supabase
            .from('bridge_assets')
            .select('*')
            .limit(1);

        if (!error) {
            console.log('✅ bridge_assets table already exists!');
            console.log(`   Records found: ${data?.length || 0}`);
            return;
        }

        if (error.code === '42P01') {
            console.log('❌ Table does not exist. Creating now...\n');

            // Create the table with proper SQL
            const { data: createResult, error: createError } = await supabase.rpc('execute_sql', {
                query: `
                    CREATE TABLE IF NOT EXISTS bridge_assets (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name VARCHAR(255) NOT NULL,
                        brand VARCHAR(255),
                        type VARCHAR(255),
                        serial_number VARCHAR(255),
                        quantity INTEGER DEFAULT 1,
                        condition VARCHAR(50) DEFAULT 'Baik',
                        location VARCHAR(50) DEFAULT 'Warehouse',
                        operational_date DATE,
                        notes TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW(),
                        created_by UUID,
                        updated_by UUID
                    );
                    
                    ALTER TABLE bridge_assets ENABLE ROW LEVEL SECURITY;
                    
                    CREATE POLICY "Enable read access for all users" ON bridge_assets 
                        FOR SELECT USING (true);
                    CREATE POLICY "Enable insert for authenticated users" ON bridge_assets 
                        FOR INSERT WITH CHECK (true);
                    CREATE POLICY "Enable update for authenticated users" ON bridge_assets 
                        FOR UPDATE USING (true);
                    CREATE POLICY "Enable delete for authenticated users" ON bridge_assets 
                        FOR DELETE USING (true);
                `
            });

            if (createError) {
                console.log('⚠️  RPC method not available. Use manual SQL execution instead.');
                console.log('\n📋 Manual Steps:');
                console.log('1. Open Supabase Dashboard: https://app.supabase.com');
                console.log('2. Go to SQL Editor > New Query');
                console.log('3. Copy and execute this SQL:\n');
                console.log(`
CREATE TABLE IF NOT EXISTS bridge_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    type VARCHAR(255),
    serial_number VARCHAR(255),
    quantity INTEGER DEFAULT 1,
    condition VARCHAR(50) DEFAULT 'Baik',
    location VARCHAR(50) DEFAULT 'Warehouse',
    operational_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

ALTER TABLE bridge_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON bridge_assets;
CREATE POLICY "Enable read access for all users" ON bridge_assets 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bridge_assets;
CREATE POLICY "Enable insert for authenticated users" ON bridge_assets 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON bridge_assets;
CREATE POLICY "Enable update for authenticated users" ON bridge_assets 
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON bridge_assets;
CREATE POLICY "Enable delete for authenticated users" ON bridge_assets 
    FOR DELETE USING (true);
                `);
                return;
            }

            console.log('✅ Table created successfully!');
        } else {
            console.log('❌ Error checking table:', error.message);
        }

        // Verify again
        const { data: verify } = await supabase
            .from('bridge_assets')
            .select('*')
            .limit(1);

        console.log('✅ Verification: Table is ready for use!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAndCreateBridgeAssets();
