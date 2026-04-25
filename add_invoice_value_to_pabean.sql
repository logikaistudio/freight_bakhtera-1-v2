-- ============================================================
-- SYNC NILAI (INVOICE VALUE) TO PABEAN TABLES
-- Mengambil data dari invoice_value pada freight_quotations
-- ============================================================

-- Step 1: Tambah kolom nilai_invoice jika belum ada
ALTER TABLE IF EXISTS public.freight_inbound
ADD COLUMN IF NOT EXISTS nilai_invoice NUMERIC(18, 2) DEFAULT NULL;

ALTER TABLE IF EXISTS public.freight_outbound
ADD COLUMN IF NOT EXISTS nilai_invoice NUMERIC(18, 2) DEFAULT NULL;

-- Step 2: Update nilai_invoice dari freight_quotations
UPDATE public.freight_inbound fi
SET nilai_invoice = fq.invoice_value
FROM public.freight_quotations fq
WHERE fi.pengajuan_id = fq.id
  AND fq.invoice_value IS NOT NULL;

UPDATE public.freight_outbound fo
SET nilai_invoice = fq.invoice_value
FROM public.freight_quotations fq
WHERE fo.pengajuan_id = fq.id
  AND fq.invoice_value IS NOT NULL;

-- Step 3: Verifikasi hasil
SELECT 'freight_inbound' AS tabel, COUNT(*) AS total, COUNT(CASE WHEN nilai_invoice IS NOT NULL THEN 1 END) AS terisi
FROM public.freight_inbound
UNION ALL
SELECT 'freight_outbound', COUNT(*), COUNT(CASE WHEN nilai_invoice IS NOT NULL THEN 1 END)
FROM public.freight_outbound;
