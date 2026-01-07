-- Cleanup Script: Remove all sample data except vendors and customers
-- Date: 2025-12-31
-- Purpose: Clean database while preserving vendor and customer data

-- ============================================================================
-- FINANCE MODULE CLEANUP
-- ============================================================================

-- Delete Purchase Orders (will cascade to related records)
DELETE FROM blink_purchase_orders;

-- Delete AR Transactions
DELETE FROM blink_ar_transactions;

-- Delete AP Transactions
DELETE FROM blink_ap_transactions;

-- Delete Journal Entries
DELETE FROM blink_journal_entries;

-- ============================================================================
-- BLINK MODULE CLEANUP
-- ============================================================================

-- Delete Invoices (keep vendor/customer references)
DELETE FROM blink_invoices;

-- Delete Shipments
DELETE FROM blink_shipments;

-- Delete Quotations
DELETE FROM blink_quotations;

-- Delete Sales Orders (if exists)
DELETE FROM blink_sales_orders WHERE 1=1;

-- ============================================================================
-- BRIDGE/PABEAN MODULE CLEANUP (if needed)
-- ============================================================================

-- Delete BC Documents
DELETE FROM bc_documents WHERE 1=1;

-- Delete Inbound/Outbound records
DELETE FROM inbound_goods WHERE 1=1;
DELETE FROM outbound_goods WHERE 1=1;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show remaining record counts
SELECT 'freight_vendors' as table_name, COUNT(*) as record_count FROM freight_vendors
UNION ALL
SELECT 'freight_customers' as table_name, COUNT(*) as record_count FROM freight_customers
UNION ALL
SELECT 'blink_purchase_orders' as table_name, COUNT(*) as record_count FROM blink_purchase_orders
UNION ALL
SELECT 'blink_ar_transactions' as table_name, COUNT(*) as record_count FROM blink_ar_transactions
UNION ALL
SELECT 'blink_ap_transactions' as table_name, COUNT(*) as record_count FROM blink_ap_transactions
UNION ALL
SELECT 'blink_journal_entries' as table_name, COUNT(*) as record_count FROM blink_journal_entries
UNION ALL
SELECT 'blink_invoices' as table_name, COUNT(*) as record_count FROM blink_invoices
UNION ALL
SELECT 'blink_shipments' as table_name, COUNT(*) as record_count FROM blink_shipments
UNION ALL
SELECT 'blink_quotations' as table_name, COUNT(*) as record_count FROM blink_quotations
ORDER BY table_name;

-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this script:
-- - All transactional data will be removed
-- - Vendor data (freight_vendors) will be preserved
-- - Customer data (freight_customers) will be preserved
-- - You can start fresh with clean data for production use
-- ============================================================================
