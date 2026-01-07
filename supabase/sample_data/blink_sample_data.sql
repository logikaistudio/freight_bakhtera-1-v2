-- Sample Data for BLINK Module: Quotation → Shipment → Invoice → AR/AP
-- Use this to populate Supabase with 2 complete transaction flows

-- =====================================================
-- SAMPLE 1: PT Sejahtera Logistik (PAID PARTIAL)
-- =====================================================

-- 1. Quotation for PT Sejahtera Logistik
INSERT INTO blink_quotations (
    quotation_number,
    customer_name,
    customer_email,
    customer_phone,
    origin_city,
    origin_country,
    destination_city,
    destination_country,
    service_type,
    cargo_type,
    weight,
    volume,
    quantity,
    commodity,
    incoterm,
    valid_until,
    quotation_date,
    total_amount,
    currency,
    notes,
    status,
    approved_by,
    approved_at
) VALUES (
    'QT-2026-001',
    'PT Sejahtera Logistik',
    'procurement@sejahtera.co.id',
    '+62-21-55551234',
    'Jakarta',
    'Indonesia',
    'Singapore',
    'Singapore',
    'Sea Freight - FCL',
    'General Cargo',
    15000.00,
    25.50,
    1,
    'Electronics Components',
    'FOB',
    '2026-02-28',
    '2026-01-02',
    85000000.00,
    'IDR',
    'Urgent shipment - Priority handling required',
    'approved',
    'Manager Operations',
    '2026-01-02 09:00:00'
);

-- 2. Shipment for PT Sejahtera Logistik
INSERT INTO blink_shipments (
    shipment_number,
    quotation_id,
    customer_name,
    origin,
    destination,
    status,
    etd,
    eta,
    actual_departure,
    bl_awb_number,
    vessel_flight,
    container_numbers,
    cargo_description,
    weight_kg,
    volume_cbm,
    notes
) VALUES (
    'SH-2026-001',
    (SELECT id FROM blink_quotations WHERE quotation_number = 'QT-2026-001' LIMIT 1),
    'PT Sejahtera Logistik',
    'Jakarta, Indonesia',
    'Singapore',
    'completed',
    '2026-01-05',
    '2026-01-10',
    '2026-01-05',
    'HLCU2600123456',
    'MV OCEAN HARMONY',
    'TCNU1234567',
    'Electronics Components - 150 Cartons',
    15000.00,
    25.50,
    'Successfully delivered on schedule'
);

-- 3. Invoice for PT Sejahtera Logistik
INSERT INTO blink_invoices (
    invoice_number,
    quotation_id,
    shipment_id,
    customer_name,
    customer_email,
    invoice_date,
    due_date,
    currency,
    subtotal,
    tax_percentage,
    tax_amount,
    total_amount,
    paid_amount,
    outstanding_amount,
    status,
    notes,
    payment_terms
) VALUES (
    'INV-2026-001',
    (SELECT id FROM blink_quotations WHERE quotation_number = 'QT-2026-001' LIMIT 1),
    (SELECT id FROM blink_shipments WHERE shipment_number = 'SH-2026-001' LIMIT 1),
    'PT Sejahtera Logistik',
    'finance@sejahtera.co.id',
    '2026-01-11',
    '2026-02-10',
    'IDR',
    85000000.00,
    11.00,
    9350000.00,
    94350000.00,
    50000000.00,
    44350000.00,
    'partial',
    'Partial payment received - 50M IDR',
    'NET 30'
);

-- 4. Payment Record for PT Sejahtera Logistik (Partial Payment)
INSERT INTO blink_payments (
    payment_number,
    payment_type,
    payment_date,
    reference_type,
    reference_id,
    amount,
    currency,
    payment_method,
    bank_account,
    transaction_ref,
    description,
    status,
    created_by
) VALUES (
    'PMT-IN-2026-001',
    'incoming',
    '2026-01-15',
    'invoice',
    (SELECT id FROM blink_invoices WHERE invoice_number = 'INV-2026-001' LIMIT 1),
    50000000.00,
    'IDR',
    'Bank Transfer',
    'BCA - 1234567890',
    'TRF20260115001',
    'Partial payment for INV-2026-001',
    'completed',
    'System'
);

-- =====================================================
-- SAMPLE 2: CV Maju Bersama (OVERDUE - NO PAYMENT)
-- =====================================================

-- 1. Quotation for CV Maju Bersama
INSERT INTO blink_quotations (
    quotation_number,
    customer_name,
    customer_email,
    customer_phone,
    origin_city,
    origin_country,
    destination_city,
    destination_country,
    service_type,
    cargo_type,
    weight,
    volume,
    quantity,
    commodity,
    incoterm,
    valid_until,
    quotation_date,
    total_amount,
    currency,
    notes,
    status,
    approved_by,
    approved_at
) VALUES (
    'QT-2025-099',
    'CV Maju Bersama',
    'admin@majubersama.id',
    '+62-31-77889900',
    'Surabaya',
    'Indonesia',
    'Hong Kong',
    'Hong Kong',
    'Air Freight',
    'Documents',
    250.00,
    0.80,
    5,
    'Legal Documents & Certificates',
    'CIF',
    '2026-01-15',
    '2025-12-10',
    12500000.00,
    'IDR',
    'Urgent express delivery required',
    'approved',
    'Manager Sales',
    '2025-12-10 14:30:00'
);

-- 2. Shipment for CV Maju Bersama
INSERT INTO blink_shipments (
    shipment_number,
    quotation_id,
    customer_name,
    origin,
    destination,
    status,
    etd,
    eta,
    actual_departure,
    actual_arrival,
    bl_awb_number,
    vessel_flight,
    cargo_description,
    weight_kg,
    volume_cbm,
    notes
) VALUES (
    'SH-2025-099',
    (SELECT id FROM blink_quotations WHERE quotation_number = 'QT-2025-099' LIMIT 1),
    'CV Maju Bersama',
    'Surabaya, Indonesia',
    'Hong Kong',
    'completed',
    '2025-12-15',
    '2025-12-16',
    '2025-12-15',
    '2025-12-16',
    'AWB-627-12345678',
    'CX 778',
    'Legal Documents - 5 Packages',
    250.00,
    0.80,
    'Delivered successfully via Cathay Pacific'
);

-- 3. Invoice for CV Maju Bersama (OVERDUE)
INSERT INTO blink_invoices (
    invoice_number,
    quotation_id,
    shipment_id,
    customer_name,
    customer_email,
    invoice_date,
    due_date,
    currency,
    subtotal,
    tax_percentage,
    tax_amount,
    total_amount,
    paid_amount,
    outstanding_amount,
    status,
    notes,
    payment_terms
) VALUES (
    'INV-2025-099',
    (SELECT id FROM blink_quotations WHERE quotation_number = 'QT-2025-099' LIMIT 1),
    (SELECT id FROM blink_shipments WHERE shipment_number = 'SH-2025-099' LIMIT 1),
    'CV Maju Bersama',
    'finance@majubersama.id',
    '2025-12-17',
    '2025-12-31',
    'IDR',
    12500000.00,
    11.00,
    1375000.00,
    13875000.00,
    0.00,
    13875000.00,
    'unpaid',
    'OVERDUE - Payment reminder sent 3x',
    'NET 14'
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check inserted data
-- SELECT * FROM blink_quotations WHERE quotation_number IN ('QT-2026-001', 'QT-2025-099');
-- SELECT * FROM blink_shipments WHERE shipment_number IN ('SH-2026-001', 'SH-2025-099');
-- SELECT * FROM blink_invoices WHERE invoice_number IN ('INV-2026-001', 'INV-2025-099');
-- SELECT * FROM blink_payments WHERE payment_number = 'PMT-IN-2026-001';

-- =====================================================
-- EXPECTED RESULTS IN AR MODULE
-- =====================================================

-- AR Report should show:
-- 1. PT Sejahtera Logistik:
--    - AR Number: INV-2026-001
--    - Original: Rp 94,350,000
--    - Paid: Rp 50,000,000
--    - Outstanding: Rp 44,350,000
--    - Status: Sebagian (Partial)
--    - Aging: 0-30 days (Current)

-- 2. CV Maju Bersama:
--    - AR Number: INV-2025-099
--    - Original: Rp 13,875,000
--    - Paid: Rp 0
--    - Outstanding: Rp 13,875,000
--    - Status: Terlambat (Overdue)
--    - Aging: 0-30 days (2+ days overdue as of 2026-01-02)
