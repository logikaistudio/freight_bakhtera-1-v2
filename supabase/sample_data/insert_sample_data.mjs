import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkyoszmtyrpdwfjxggmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reW9zem10eXJwZHdmanhnZ21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Njk5MDksImV4cCI6MjA1MDE0NTkwOX0.qCY6DPfHoJXS-rrDH0YgWLVJC78BU4AO0UhCpWkKUiY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSampleData() {
    console.log('🚀 Starting sample data insertion...\n');

    try {
        // ===== SAMPLE 1: PT Sejahtera Logistik =====
        console.log('📦 Sample 1: PT Sejahtera Logistik');

        // 1. Insert Quotation
        const { data: quotation1, error: q1Error } = await supabase
            .from('blink_quotations')
            .insert({
                quotation_number: 'QT-2026-001',
                customer_name: 'PT Sejahtera Logistik',
                customer_email: 'procurement@sejahtera.co.id',
                customer_phone: '+62-21-55551234',
                origin_city: 'Jakarta',
                origin_country: 'Indonesia',
                destination_city: 'Singapore',
                destination_country: 'Singapore',
                service_type: 'Sea Freight - FCL',
                cargo_type: 'General Cargo',
                weight: 15000.00,
                volume: 25.50,
                quantity: 1,
                commodity: 'Electronics Components',
                incoterm: 'FOB',
                valid_until: '2026-02-28',
                quotation_date: '2026-01-02',
                total_amount: 85000000.00,
                currency: 'IDR',
                notes: 'Urgent shipment - Priority handling required',
                status: 'approved',
                approved_by: 'Manager Operations',
                approved_at: '2026-01-02T09:00:00'
            })
            .select()
            .single();

        if (q1Error) throw new Error(`Quotation 1: ${q1Error.message}`);
        console.log('  ✓ Quotation created:', quotation1.quotation_number);

        // 2. Insert Shipment
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
                bl_awb_number: 'HLCU2600123456',
                vessel_flight: 'MV OCEAN HARMONY',
                container_numbers: 'TCNU1234567',
                cargo_description: 'Electronics Components - 150 Cartons',
                weight_kg: 15000.00,
                volume_cbm: 25.50,
                notes: 'Successfully delivered on schedule'
            })
            .select()
            .single();

        if (s1Error) throw new Error(`Shipment 1: ${s1Error.message}`);
        console.log('  ✓ Shipment created:', shipment1.shipment_number);

        // 3. Insert Invoice
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
                subtotal: 85000000.00,
                tax_percentage: 11.00,
                tax_amount: 9350000.00,
                total_amount: 94350000.00,
                paid_amount: 50000000.00,
                outstanding_amount: 44350000.00,
                status: 'partial',
                notes: 'Partial payment received - 50M IDR',
                payment_terms: 'NET 30'
            })
            .select()
            .single();

        if (i1Error) throw new Error(`Invoice 1: ${i1Error.message}`);
        console.log('  ✓ Invoice created:', invoice1.invoice_number);

        // 4. Insert Payment
        const { data: payment1, error: p1Error } = await supabase
            .from('blink_payments')
            .insert({
                payment_number: 'PMT-IN-2026-001',
                payment_type: 'incoming',
                payment_date: '2026-01-15',
                reference_type: 'invoice',
                reference_id: invoice1.id,
                amount: 50000000.00,
                currency: 'IDR',
                payment_method: 'Bank Transfer',
                bank_account: 'BCA - 1234567890',
                transaction_ref: 'TRF20260115001',
                description: 'Partial payment for INV-2026-001',
                status: 'completed',
                created_by: 'System'
            })
            .select()
            .single();

        if (p1Error) throw new Error(`Payment 1: ${p1Error.message}`);
        console.log('  ✓ Payment recorded:', payment1.payment_number);

        console.log('\n📦 Sample 2: CV Maju Bersama');

        // ===== SAMPLE 2: CV Maju Bersama =====

        // 1. Insert Quotation
        const { data: quotation2, error: q2Error } = await supabase
            .from('blink_quotations')
            .insert({
                quotation_number: 'QT-2025-099',
                customer_name: 'CV Maju Bersama',
                customer_email: 'admin@majubersama.id',
                customer_phone: '+62-31-77889900',
                origin_city: 'Surabaya',
                origin_country: 'Indonesia',
                destination_city: 'Hong Kong',
                destination_country: 'Hong Kong',
                service_type: 'Air Freight',
                cargo_type: 'Documents',
                weight: 250.00,
                volume: 0.80,
                quantity: 5,
                commodity: 'Legal Documents & Certificates',
                incoterm: 'CIF',
                valid_until: '2026-01-15',
                quotation_date: '2025-12-10',
                total_amount: 12500000.00,
                currency: 'IDR',
                notes: 'Urgent express delivery required',
                status: 'approved',
                approved_by: 'Manager Sales',
                approved_at: '2025-12-10T14:30:00'
            })
            .select()
            .single();

        if (q2Error) throw new Error(`Quotation 2: ${q2Error.message}`);
        console.log('  ✓ Quotation created:', quotation2.quotation_number);

        // 2. Insert Shipment
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
                bl_awb_number: 'AWB-627-12345678',
                vessel_flight: 'CX 778',
                cargo_description: 'Legal Documents - 5 Packages',
                weight_kg: 250.00,
                volume_cbm: 0.80,
                notes: 'Delivered successfully via Cathay Pacific'
            })
            .select()
            .single();

        if (s2Error) throw new Error(`Shipment 2: ${s2Error.message}`);
        console.log('  ✓ Shipment created:', shipment2.shipment_number);

        // 3. Insert Invoice (OVERDUE)
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
                subtotal: 12500000.00,
                tax_percentage: 11.00,
                tax_amount: 1375000.00,
                total_amount: 13875000.00,
                paid_amount: 0.00,
                outstanding_amount: 13875000.00,
                status: 'unpaid',
                notes: 'OVERDUE - Payment reminder sent 3x',
                payment_terms: 'NET 14'
            })
            .select()
            .single();

        if (i2Error) throw new Error(`Invoice 2: ${i2Error.message}`);
        console.log('  ✓ Invoice created:', invoice2.invoice_number);

        console.log('\n✅ Sample data insertion completed successfully!');
        console.log('\n📊 Summary:');
        console.log('  • 2 Quotations');
        console.log('  • 2 Shipments');
        console.log('  • 2 Invoices');
        console.log('  • 1 Payment');
        console.log('\n🔄 Refresh your application to see the data!');

    } catch (error) {
        console.error('\n❌ Error inserting sample data:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

// Run the script
insertSampleData();
