-- Migration: 021_sample_data.sql
-- Description: Insert 2 sample transactions for AR/AP testing
-- This will populate data from Quotation → Shipment → Invoice → Payment

-- =====================================================
-- SAMPLE 1: PT Sejahtera Logistik (PARTIAL PAYMENT)
-- =====================================================

-- Insert Quotation
INSERT INTO blink_quotations (
    quotation_number, job_number, customer_name, customer_company,
    customer_address, sales_person, quotation_type, quotation_date,
    valid_until, origin, destination, service_type, cargo_type,
    weight, volume, commodity, currency, total_amount, status,
    created_at, updated_at
) VALUES (
    'QT-2026-001', 'JOB-2026-0001',
    'PT Sejahtera Logistik', 'PT Sejahtera Logistik',
    'Jl. Sudirman No. 123, Jakarta Pusat', 'John Doe',
    'RG', '2026-01-02', '2026-02-28',
    'Jakarta', 'Singapore', 'sea', 'General Cargo',
    15000.00, 25.50, 'Electronics Components',
    'IDR', 85000000, 'converted',
    NOW(), NOW()
) ON CONFLICT (quotation_number) DO NOTHING;

-- Insert Shipment
INSERT INTO blink_shipments (
    shipment_number, quotation_id, customer_name, origin, destination,
    status, etd, eta, actual_departure, bl_awb_number, vessel_flight,
    container_numbers, cargo_description, weight_kg, volume_cbm,
    created_at, updated_at
) VALUES (
    'SH-2026-001',
    (SELECT id FROM blink_quotations WHERE quotation_number = 'QT-2026-001' LIMIT 1),
    'PT Sejahtera Logistik', 'Jakarta, Indonesia', 'Singapore',
    'completed', '2026-01-05', '2026-01-10', '2026-01-05',
    'HLCU2600123456', 'MV OCEAN HARMONY', 'TCNU1234567',
    'Electronics Components - 150 Cartons', 15000.00, 25.50,
    NOW(), NOW()
) ON CONFLICT (shipment_number) DO NOTHING;

-- Insert Invoice
INSERT INTO blink_invoices (
    invoice_number, quotation_id, shipment_id, customer_name,
    customer_email, invoice_date, due_date, currency,
    subtotal, tax_percentage, tax_amount, total_amount,
    paid_amount, outstanding_amount, status, payment_terms,
    created_at, updated_at
) VALUES (
    'INV-2026-001',
    (SELECT id FROM blink_quotations WHERE quotation_number = 'QT-2026-001' LIMIT 1),
    (SELECT id FROM blink_shipments WHERE shipment_number = 'SH-2026-001' LIMIT 1),
    'PT Sejahtera Logistik', 'finance@sejahtera.co.id',
    '2026-01-11', '2026-02-10', 'IDR',
    85000000, 11.00, 9350000, 94350000,
    50000000, 44350000, 'partial', 'NET 30',
    NOW(), NOW()
) ON CONFLICT (invoice_number) DO NOTHING;

-- Insert Payment
INSERT INTO blink_payments (
    payment_number, payment_type, payment_date, reference_type,
    reference_id, amount, currency, payment_method, bank_account,
    transaction_ref, description, status, created_by,
    created_at, updated_at
) VALUES (
    'PMT-IN-2026-001', 'incoming', '2026-01-15', 'invoice',
    (SELECT id FROM blink_invoices WHERE invoice_number = 'INV-2026-001' LIMIT 1),
    50000000, 'IDR', 'Bank Transfer', 'BCA - 1234567890',
    'TRF20260115001', 'Partial payment for INV-2026-001',
    'completed', 'System', NOW(), NOW()
) ON CONFLICT (payment_number) DO NOTHING;

-- =====================================================
-- SAMPLE 2: CV Maju Bersama (OVERDUE - NO PAYMENT)
-- =====================================================

-- Insert Quotation
INSERT INTO blink_quotations (
    quotation_number, job_number, customer_name, customer_company,
    customer_address, sales_person, quotation_type, quotation_date,
    valid_until, origin, destination, service_type, cargo_type,
    weight, volume, commodity, currency, total_amount, status,
    created_at, updated_at
) VALUES (
    'QT-2025-099', 'JOB-2025-0099',
    'CV Maju Bersama', 'CV Maju Bersama',
    'Jl. Raya Darmo No. 456, Surabaya', 'Jane Smith',
    'RG', '2025-12-10', '2026-01-15',
    'Surabaya', 'Hong Kong', 'air', 'Documents',
    250.00, 0.80, 'Legal Documents & Certificates',
    'IDR', 12500000, 'converted',
    NOW(), NOW()
) ON CONFLICT (quotation_number) DO NOTHING;

-- Insert Shipment
INSERT INTO blink_shipments (
    shipment_number, quotation_id, customer_name, origin, destination,
    status, etd, eta, actual_departure, actual_arrival,
    bl_awb_number, vessel_flight, cargo_description,
    weight_kg, volume_cbm, created_at, updated_at
) VALUES (
    'SH-2025-099',
    (SELECT id FROM blink_quotations WHERE quotation_number = 'QT-2025-099' LIMIT 1),
    'CV Maju Bersama', 'Surabaya, Indonesia', 'Hong Kong',
    'completed', '2025-12-15', '2025-12-16', '2025-12-15', '2025-12-16',
    'AWB-627-12345678', 'CX 778', 'Legal Documents - 5 Packages',
    250.00, 0.80, NOW(), NOW()
) ON CONFLICT (shipment_number) DO NOTHING;

-- Insert Invoice (OVERDUE)
INSERT INTO blink_invoices (
    invoice_number, quotation_id, shipment_id, customer_name,
    customer_email, invoice_date, due_date, currency,
    subtotal, tax_percentage, tax_amount, total_amount,
    paid_amount, outstanding_amount, status, payment_terms,
    created_at, updated_at
) VALUES (
    'INV-2025-099',
    (SELECT id FROM blink_quotations WHERE quotation_number = 'QT-2025-099' LIMIT 1),
    (SELECT id FROM blink_shipments WHERE shipment_number = 'SH-2025-099' LIMIT 1),
    'CV Maju Bersama', 'finance@majubersama.id',
    '2025-12-17', '2025-12-31', 'IDR',
    12500000, 11.00, 1375000, 13875000,
    0, 13875000, 'unpaid', 'NET 14',
    NOW(), NOW()
) ON CONFLICT (invoice_number) DO NOTHING;

-- Verification Query (commented out, run manually if needed)
-- SELECT 'Quotations' as table_name, COUNT(*) as count FROM blink_quotations WHERE quotation_number IN ('QT-2026-001', 'QT-2025-099')
-- UNION ALL
-- SELECT 'Shipments', COUNT(*) FROM blink_shipments WHERE shipment_number IN ('SH-2026-001', 'SH-2025-099')
-- UNION ALL
-- SELECT 'Invoices', COUNT(*) FROM blink_invoices WHERE invoice_number IN ('INV-2026-001', 'INV-2025-099')
-- UNION ALL
-- SELECT 'Payments', COUNT(*) FROM blink_payments WHERE payment_number = 'PMT-IN-2026-001';
