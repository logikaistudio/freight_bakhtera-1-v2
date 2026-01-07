/**
 * Simplified AR Sample Data Seeder - FIXED VERSION
 * Creates invoices directly with correct column names
 */

import { supabase } from '../lib/supabase';

export async function seedARSampleData() {
    console.log('🌱 Starting AR sample data seeding (FIXED)...');

    try {
        // Check existing data
        const { data: existingInvoices } = await supabase
            .from('blink_invoices')
            .select('invoice_number')
            .in('invoice_number', ['INV-2026-001', 'INV-2025-099']);

        if (existingInvoices && existingInvoices.length > 0) {
            console.log('⚠️ Sample invoices already exist');
            return { success: true, message: 'Data already exists' };
        }

        console.log('📝 Creating Invoice 1: PT Sejahtera (Partial Payment)...');

        // Invoice 1 - Partial Payment (FIXED COLUMN NAMES)
        const { data: inv1, error: inv1Error } = await supabase
            .from('blink_invoices')
            .insert({
                invoice_number: 'INV-2026-001',
                job_number: 'JOB-2026-001',
                customer_name: 'PT Sejahtera Logistik',
                customer_email: 'finance@sejahtera.co.id',
                invoice_date: '2026-01-11',
                due_date: '2026-02-10',
                currency: 'IDR',
                invoice_items: [],
                subtotal: 85000000,
                tax_rate: 11.00,
                tax_amount: 9350000,
                total_amount: 94350000,
                paid_amount: 50000000,
                outstanding_amount: 44350000,
                status: 'partial',
                payment_terms: 'NET 30',
                notes: 'Sample data: Partial payment received'
            })
            .select()
            .single();

        if (inv1Error) {
            console.error('❌ Error creating Invoice 1:', inv1Error);
            throw inv1Error;
        }
        console.log('  ✅ Invoice 1 created:', inv1.invoice_number);

        console.log('📝 Creating Invoice 2: CV Maju (Overdue)...');

        // Invoice 2 - Overdue (FIXED COLUMN NAMES)
        const { data: inv2, error: inv2Error } = await supabase
            .from('blink_invoices')
            .insert({
                invoice_number: 'INV-2025-099',
                job_number: 'JOB-2025-099',
                customer_name: 'CV Maju Bersama',
                customer_email: 'finance@majubersama.id',
                invoice_date: '2025-12-17',
                due_date: '2025-12-31',
                currency: 'IDR',
                invoice_items: [],
                subtotal: 12500000,
                tax_rate: 11.00,
                tax_amount: 1375000,
                total_amount: 13875000,
                paid_amount: 0,
                outstanding_amount: 13875000,
                status: 'unpaid',
                payment_terms: 'NET 14',
                notes: 'Sample data: OVERDUE - No payment'
            })
            .select()
            .single();

        if (inv2Error) {
            console.error('❌ Error creating Invoice 2:', inv2Error);
            throw inv2Error;
        }
        console.log('  ✅ Invoice 2 created:', inv2.invoice_number);

        console.log('\n✅ Sample data created successfully!');
        console.log('📊 Summary:');
        console.log('  • 2 Invoices created');
        console.log('  • Total AR: Rp 108,225,000');
        console.log('  • Outstanding: Rp 58,225,000');
        console.log('\n🔄 Navigate to /blink/finance/ar to see the data!');

        return {
            success: true,
            message: 'Sample invoices created',
            invoices: [inv1.invoice_number, inv2.invoice_number]
        };

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        console.error('Error details:', error.message);
        console.error('Error code:', error.code);
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
}

// Auto-load in browser
if (typeof window !== 'undefined') {
    window.seedARSampleData = seedARSampleData;
    console.log('💡 AR Seeder FIXED loaded! Run: window.seedARSampleData()');
}
