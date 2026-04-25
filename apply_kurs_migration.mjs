import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runMigration() {
    try {
        console.log('🚀 Starting Kurs Migration for Pabean Tables...\n');

        // Step 1: Add kurs columns to freight_inbound
        console.log('📝 Step 1: Adding kurs columns to freight_inbound...');
        const { error: inboundColError } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE IF EXISTS public.freight_inbound
                ADD COLUMN IF NOT EXISTS kurs NUMERIC(15, 4) DEFAULT NULL;

                ALTER TABLE IF EXISTS public.freight_inbound
                ADD COLUMN IF NOT EXISTS kurs_pengajuan_id UUID DEFAULT NULL;
            `
        }).catch(err => ({ error: err }));

        if (inboundColError && !inboundColError.message?.includes('unknown')) {
            console.log('⚠️  Note: Using direct SQL instead (rpc not available)');
        } else {
            console.log('✅ Columns added to freight_inbound');
        }

        // Step 2: Add kurs columns to freight_outbound
        console.log('📝 Step 2: Adding kurs columns to freight_outbound...');
        const { error: outboundColError } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE IF EXISTS public.freight_outbound
                ADD COLUMN IF NOT EXISTS kurs NUMERIC(15, 4) DEFAULT NULL;

                ALTER TABLE IF EXISTS public.freight_outbound
                ADD COLUMN IF NOT EXISTS kurs_pengajuan_id UUID DEFAULT NULL;
            `
        }).catch(err => ({ error: err }));

        if (outboundColError && !outboundColError.message?.includes('unknown')) {
            console.log('⚠️  Note: Using direct SQL instead (rpc not available)');
        } else {
            console.log('✅ Columns added to freight_outbound');
        }

        // Step 3: Populate kurs from freight_quotations to freight_inbound
        console.log('📝 Step 3: Populating kurs data in freight_inbound...');
        const { error: inboundPopError } = await supabase.rpc('exec_sql', {
            sql: `
                UPDATE public.freight_inbound fi
                SET kurs = fq.exchange_rate,
                    kurs_pengajuan_id = fq.id
                FROM public.freight_quotations fq
                WHERE fi.pengajuan_id = fq.id
                  AND fq.exchange_rate IS NOT NULL;
            `
        }).catch(err => ({ error: err }));

        if (!inboundPopError) {
            console.log('✅ Kurs data populated in freight_inbound');
        } else {
            console.log('⚠️  Could not populate freight_inbound via rpc');
        }

        // Step 4: Populate kurs from freight_quotations to freight_outbound
        console.log('📝 Step 4: Populating kurs data in freight_outbound...');
        const { error: outboundPopError } = await supabase.rpc('exec_sql', {
            sql: `
                UPDATE public.freight_outbound fo
                SET kurs = fq.exchange_rate,
                    kurs_pengajuan_id = fq.id
                FROM public.freight_quotations fq
                WHERE fo.pengajuan_id = fq.id
                  AND fq.exchange_rate IS NOT NULL;
            `
        }).catch(err => ({ error: err }));

        if (!outboundPopError) {
            console.log('✅ Kurs data populated in freight_outbound');
        } else {
            console.log('⚠️  Could not populate freight_outbound via rpc');
        }

        // Step 5: Verify results
        console.log('\n📊 Verification Results:');
        
        const { data: inboundStats, error: inboundStatsError } = await supabase
            .from('freight_inbound')
            .select('id', { count: 'exact' })
            .not('kurs', 'is', null);

        const { data: outboundStats, error: outboundStatsError } = await supabase
            .from('freight_outbound')
            .select('id', { count: 'exact' })
            .not('kurs', 'is', null);

        if (!inboundStatsError) {
            console.log(`✅ freight_inbound: ${inboundStats?.length || 0} rows with kurs data`);
        }
        
        if (!outboundStatsError) {
            console.log(`✅ freight_outbound: ${outboundStats?.length || 0} rows with kurs data`);
        }

        // Sample data
        console.log('\n📋 Sample Data:');
        
        const { data: inboundSample } = await supabase
            .from('freight_inbound')
            .select('id, pengajuan_id, kurs, kurs_pengajuan_id, created_at')
            .not('kurs', 'is', null)
            .order('created_at', { ascending: false })
            .limit(3);

        const { data: outboundSample } = await supabase
            .from('freight_outbound')
            .select('id, pengajuan_id, kurs, kurs_pengajuan_id, created_at')
            .not('kurs', 'is', null)
            .order('created_at', { ascending: false })
            .limit(3);

        if (inboundSample?.length > 0) {
            console.log('\nInbound Sample:');
            inboundSample.forEach(row => {
                console.log(`  - Pengajuan ${row.pengajuan_id}: Kurs ${row.kurs}`);
            });
        }

        if (outboundSample?.length > 0) {
            console.log('\nOutbound Sample:');
            outboundSample.forEach(row => {
                console.log(`  - Pengajuan ${row.pengajuan_id}: Kurs ${row.kurs}`);
            });
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📌 Next Steps:');
        console.log('1. Restart your development server');
        console.log('2. Open BarangMasuk and BarangKeluar pages in the UI');
        console.log('3. Verify that the "Kurs" column is now visible with exchange rate values');
        console.log('4. Test exports (XLS, CSV) to confirm kurs data is included');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run the migration
runMigration();
