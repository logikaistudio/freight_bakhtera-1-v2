import { supabase } from '../lib/supabase';

/**
 * Seed Sample Data for AR Testing
 * This will insert 2 complete transaction flows:
 * 1. PT Sejahtera Logistik - Partial Payment (50M of 94.35M paid)
 * 2. CV Maju Bersama - Overdue (No payment, past due date)
 */

export async function seedSampleData() {
    console.log('🌱 Starting sample data seeding...');

    try {
        // Check if data already exists
        const { data: existing } = await supabase
            .from('blink_quotations')
            .select('quotation_number')
            .in('quotation_number', ['QT-2026-001', 'QT-2025-099']);

        if (existing && existing.length > 0) {
            console.log('⚠️ Sample data already exists. Skipping...');
            return { success: true, message: 'Sample data already exists' };
        }

        // SAMPLE 1: PT Sejahtera Logistik (PARTIAL PAYMENT)
        console.log('📦 Creating Sample 1: PT Sejahtera Logistik...');

        const { data: quotation1, error: q1Error } = await supabase
            .from('blink_quotations')
            .insert({
                quotation_number: 'QT-2026-001',
                job_number: 'JOB-2026-0001',
                customer_name: 'PT Sejahtera Logistik',
                customer_company: 'PT Sejahtera Logistik',
                customer_address: 'Jl. Sudirman No. 123, Jakarta Pusat',
                sales_person: 'John Doe',
                quotation_type: 'RG',
                quotation_date: '2026-01-02',
                valid_until: '2026-02-28',
                origin: 'Jakarta',
                destination: 'Singapore',
                service_type: 'sea',
                cargo_type: 'General Cargo',
                weight: 15000.00,
                volume: 25.50,
                commodity: 'Electronics Components',
                currency: 'IDR',
                total_amount: 85000000,
                status: 'converted'
            })
            .select()
            .single();

        if (q1Error) throw new Error(`Quotation 1 error: ${q1Error.message}`);
        console.log('  ✓ Quotation 1 created');

        const { data: shipment1, error: s1Error } = await supabase
            .from('blink_shipments')
            .insert({
                shipment_number: 'SH-2026-001',
                quotation_id: quotation1.id,
                customer_name: 'PT Sejahtera Logistik',
                origin: 'Jakarta, Indonesia',
                destination: 'Singapore',
                status: 'completed',
                etd: '2026-01-05',
                eta: '2026-01-10',
                actual_departure: '2026-01-05',
                bl_number: 'HLCU2600123456',
                vessel_name: 'MV OCEAN HARMONY',
                voyage: 'VOY001',
                container_number: 'TCNU1234567',
                cargo_description: 'Electronics Components - 150 Cartons',
                weight_kg: 15000.00,
                volume_cbm: 25.50
            })
            .select()
            .single();

        if (s1Error) throw new Error(`Shipment 1 error: ${s1Error.message}`);
        console.log('  ✓ Shipment 1 created');

        const { data: invoice1, error: i1Error } = await supabase
            .from('blink_invoices')
            .insert({
                invoice_number: 'INV-2026-001',
                quotation_id: quotation1.id,
                shipment_id: shipment1.id,
                customer_name: 'PT Sejahtera Logistik',
                customer_email: 'finance@sejahtera.co.id',
                invoice_date: '2026-01-11',
                due_date: '2026-02-10',
                currency: 'IDR',
                subtotal: 85000000,
                tax_percentage: 11.00,
                tax_amount: 9350000,
                total_amount: 94350000,
                paid_amount: 50000000,
                outstanding_amount: 44350000,
                status: 'partial',
                payment_terms: 'NET 30',
                notes: 'Partial payment received - 50M IDR'
            })
            .select()
            .single();

        if (i1Error) throw new Error(`Invoice 1 error: ${i1Error.message}`);
        console.log('  ✓ Invoice 1 created');

        const { error: p1Error } = await supabase
            .from('blink_payments')
            .insert({
                payment_number: 'PMT-IN-2026-001',
                payment_type: 'incoming',
                payment_date: '2026-01-15',
                reference_type: 'invoice',
                reference_id: invoice1.id,
                amount: 50000000,
                currency: 'IDR',
                payment_method: 'Bank Transfer',
                bank_account: 'BCA - 1234567890',
                transaction_ref: 'TRF20260115001',
                description: 'Partial payment for INV-2026-001',
                status: 'completed',
                created_by: 'System'
            });

        if (p1Error) throw new Error(`Payment 1 error: ${p1Error.message}`);
        console.log('  ✓ Payment 1 recorded');

        // SAMPLE 2: CV Maju Bersama (OVERDUE)
        console.log('📦 Creating Sample 2: CV Maju Bersama...');

        const { data: quotation2, error: q2Error } = await supabase
            .from('blink_quotations')
            .insert({
                quotation_number: 'QT-2025-099',
                job_number: 'JOB-2025-0099',
                customer_name: 'CV Maju Bersama',
                customer_company: 'CV Maju Bersama',
                customer_address: 'Jl. Raya Darmo No. 456, Surabaya',
                sales_person: 'Jane Smith',
                quotation_type: 'RG',
                quotation_date: '2025-12-10',
                valid_until: '2026-01-15',
                origin: 'Surabaya',
                destination: 'Hong Kong',
                service_type: 'air',
                cargo_type: 'Documents',
                weight: 250.00,
                volume: 0.80,
                commodity: 'Legal Documents & Certificates',
                currency: 'IDR',
                total_amount: 12500000,
                status: 'converted'
            })
            .select()
            .single();

        if (q2Error) throw new Error(`Quotation 2 error: ${q2Error.message}`);
        console.log('  ✓ Quotation 2 created');

        const { data: shipment2, error: s2Error } = await supabase
            .from('blink_shipments')
            .insert({
                shipment_number: 'SH-2025-099',
                quotation_id: quotation2.id,
                customer_name: 'CV Maju Bersama',
                origin: 'Surabaya, Indonesia',
                destination: 'Hong Kong',
                status: 'completed',
                etd: '2025-12-15',
                eta: '2025-12-16',
                actual_departure: '2025-12-15',
                actual_arrival: '2025-12-16',
                awb_number: 'AWB-627-12345678',
                flight_number: 'CX 778',
                cargo_description: 'Legal Documents - 5 Packages',
                weight_kg: 250.00,
                volume_cbm: 0.80
            })
            .select()
            .single();

        if (s2Error) throw new Error(`Shipment 2 error: ${s2Error.message}`);
        console.log('  ✓ Shipment 2 created');

        const { data: invoice2, error: i2Error } = await supabase
            .from('blink_invoices')
            .insert({
                invoice_number: 'INV-2025-099',
                quotation_id: quotation2.id,
                shipment_id: shipment2.id,
                customer_name: 'CV Maju Bersama',
                customer_email: 'finance@majubersama.id',
                invoice_date: '2025-12-17',
                due_date: '2025-12-31',
                currency: 'IDR',
                subtotal: 12500000,
                tax_percentage: 11.00,
                tax_amount: 1375000,
                total_amount: 13875000,
                paid_amount: 0,
                outstanding_amount: 13875000,
                status: 'unpaid',
                payment_terms: 'NET 14',
                notes: 'OVERDUE - Payment reminder sent 3x'
            })
            .select()
            .single();

        if (i2Error) throw new Error(`Invoice 2 error: ${i2Error.message}`);
        console.log('  ✓ Invoice 2 created');

        console.log('✅ Sample data seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log('  • 2 Quotations');
        console.log('  • 2 Shipments');
        console.log('  • 2 Invoices');
        console.log('  • 1 Payment');
        console.log('\n🔄 Refresh your AR page to see the data!');

        return {
            success: true,
            message: 'Sample data created successfully',
            data: {
                quotations: 2,
                shipments: 2,
                invoices: 2,
                payments: 1
            }
        };

    } catch (error) {
        console.error('❌ Error seeding sample data:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Auto-run if imported in browser console
if (typeof window !== 'undefined') {
    window.seedSampleData = seedSampleData;
    console.log('💡 Sample data seeder loaded! Run: window.seedSampleData()');
}
