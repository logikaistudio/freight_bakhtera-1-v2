# Blink Finance Module - Database Migration Script
# 
# This migration creates the following tables:
# - blink_purchase_orders (Purchase Order management)
# - blink_ar_transactions (Accounts Receivable)
# - blink_ap_transactions (Accounts Payable)  
# - blink_journal_entries (General Ledger)
#
# INSTRUCTIONS:
# ============
# 1. Open your Supabase Dashboard: https://supabase.com/dashboard
# 2. Select your project
# 3. Navigate to: SQL Editor (left sidebar)
# 4. Click "+ New query" button
# 5. Copy the ENTIRE content from the file below:
#    File: supabase/migrations/011_blink_finance_module.sql
# 6. Paste into the SQL Editor
# 7. Click "Run" or press Cmd/Ctrl + Enter
# 8. Wait for "Success" message
# 9. Refresh your application
#
# ALTERNATIVE METHOD (Command Line with psql):
# ============================================
# If you have PostgreSQL client installed and Supabase connection string:
#
# psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
#   -f supabase/migrations/011_blink_finance_module.sql
#
# Get your connection string from: Supabase Dashboard > Settings > Database
#
# VERIFICATION:
# ============
# After running the migration, you can verify the tables were created by running:
#
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'blink_%_transactions' 
OR tablename = 'blink_purchase_orders'
OR tablename = 'blink_journal_entries';
#
# Expected output:
# - blink_purchase_orders
# - blink_ar_transactions  
# - blink_ap_transactions
# - blink_journal_entries
#
# TROUBLESHOOTING:
# ===============
# If you get errors about tables already existing:
# - The migration was already run (safe to ignore)
# - Or you need to drop old tables first (be careful!)
#
# For help, check: https://supabase.com/docs/guides/database/migrations
