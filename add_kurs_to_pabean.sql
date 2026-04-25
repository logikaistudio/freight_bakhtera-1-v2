-- ============================================================
-- ADD KURS (EXCHANGE RATE) COLUMNS TO PABEAN TABLES
-- Mengambil data dari kurs_pengajuan (exchange_rate) pada freight_quotations
-- ============================================================

-- Step 1: Add kurs column to freight_inbound (Pabean Barang Masuk)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.freight_inbound
ADD COLUMN IF NOT EXISTS kurs NUMERIC(15, 4) DEFAULT NULL;

ALTER TABLE IF EXISTS public.freight_inbound
ADD COLUMN IF NOT EXISTS kurs_pengajuan_id UUID DEFAULT NULL;

-- Step 2: Add kurs column to freight_outbound (Pabean Barang Keluar)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.freight_outbound
ADD COLUMN IF NOT EXISTS kurs NUMERIC(15, 4) DEFAULT NULL;

ALTER TABLE IF EXISTS public.freight_outbound
ADD COLUMN IF NOT EXISTS kurs_pengajuan_id UUID DEFAULT NULL;

-- Step 3: Populate kurs from freight_quotations
-- ─────────────────────────────────────────────────────────────

-- Update freight_inbound with exchange_rate from pengajuan
UPDATE public.freight_inbound fi
SET kurs = fq.exchange_rate,
    kurs_pengajuan_id = fq.id
FROM public.freight_quotations fq
WHERE fi.pengajuan_id = fq.id
  AND fq.exchange_rate IS NOT NULL;

-- Update freight_outbound with exchange_rate from pengajuan
UPDATE public.freight_outbound fo
SET kurs = fq.exchange_rate,
    kurs_pengajuan_id = fq.id
FROM public.freight_quotations fq
WHERE fo.pengajuan_id = fq.id
  AND fq.exchange_rate IS NOT NULL;

-- Step 4: Verify the updates
-- ─────────────────────────────────────────────────────────────
SELECT 'freight_inbound' AS tabel,
       COUNT(*) AS total_rows,
       COUNT(CASE WHEN kurs IS NOT NULL THEN 1 END) AS rows_with_kurs,
       ROUND(100.0 * COUNT(CASE WHEN kurs IS NOT NULL THEN 1 END) / COUNT(*), 2) AS percentage_filled
FROM public.freight_inbound
UNION ALL
SELECT 'freight_outbound',
       COUNT(*),
       COUNT(CASE WHEN kurs IS NOT NULL THEN 1 END),
       ROUND(100.0 * COUNT(CASE WHEN kurs IS NOT NULL THEN 1 END) / COUNT(*), 2)
FROM public.freight_outbound;

-- Step 5: Show sample data
-- ─────────────────────────────────────────────────────────────
SELECT id, pengajuan_id, kurs, kurs_pengajuan_id, created_at
FROM public.freight_inbound
WHERE kurs IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

SELECT id, pengajuan_id, kurs, kurs_pengajuan_id, created_at
FROM public.freight_outbound
WHERE kurs IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
