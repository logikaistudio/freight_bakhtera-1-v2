import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://nkyoszmtyrpdwfjxggmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reW9zem10eXJwZHdmanhnZ21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcxMDMxNiwiZXhwIjoyMDgyMjg2MzE2fQ.Rc4bf2Ju6rGDZ18FnPbHna80L_720xtQDHBu7debMPU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    try {
        console.log('🚀 Applying bridge_assets migration...\n');

        // 1. Check if table exists
        const { data: tables, error: checkError } = await supabase
            .rpc('information_schema.tables', {
                table_schema: 'public',
                table_name: 'bridge_assets'
            })
            .single();

        // Read migration files
        const migration076 = fs.readFileSync(path.join('.', 'supabase/migrations/076_create_bridge_assets.sql'), 'utf-8');
        const migration077 = fs.readFileSync(path.join('.', 'supabase/migrations/077_add_location_bridge_assets.sql'), 'utf-8');

        // Split SQL statements and filter empty ones
        const sql076Statements = migration076
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        const sql077Statements = migration077
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        // Execute migration 076
        console.log('📝 Applying migration 076_create_bridge_assets...');
        for (const statement of sql076Statements) {
            try {
                const { error } = await supabase.rpc('execute_sql', {
                    sql_query: statement + ';'
                });
                if (error) {
                    // Ignore errors for CREATE TABLE IF NOT EXISTS and similar
                    if (!error.message.includes('already exists')) {
                        console.error('   ⚠️  Error:', error.message);
                    }
                } else {
                    console.log('   ✅ Statement executed');
                }
            } catch (e) {
                console.log('   ℹ️  Skipping statement (might be already applied)');
            }
        }

        // Execute migration 077
        console.log('\n📝 Applying migration 077_add_location_bridge_assets...');
        for (const statement of sql077Statements) {
            try {
                const { error } = await supabase.rpc('execute_sql', {
                    sql_query: statement + ';'
                });
                if (error && !error.message.includes('already exists')) {
                    console.error('   ⚠️  Error:', error.message);
                } else {
                    console.log('   ✅ Statement executed');
                }
            } catch (e) {
                console.log('   ℹ️  Skipping statement (might be already applied)');
            }
        }

        // Verify table exists
        console.log('\n✅ Verifying table creation...');
        const { data, error } = await supabase
            .from('bridge_assets')
            .select('*')
            .limit(1);

        if (error) {
            console.log('⚠️  Table might not be ready yet. Error:', error.message);
            console.log('\n💡 Try one of these solutions:');
            console.log('1. Manually run the SQL in Supabase dashboard');
            console.log('2. Wait a few minutes for Supabase to refresh schema cache');
            console.log('3. Hard refresh the browser (Cmd+Shift+R)');
        } else {
            console.log('✅ bridge_assets table is ready!');
            console.log(`   Current records: ${data?.length || 0}`);
        }

    } catch (error) {
        console.error('❌ Migration error:', error.message);
        console.log('\n💡 Alternative solution:');
        console.log('1. Go to Supabase Dashboard');
        console.log('2. SQL Editor > New Query');
        console.log('3. Copy content from supabase/migrations/076_create_bridge_assets.sql');
        console.log('4. Execute the SQL');
    }
}

applyMigration();
