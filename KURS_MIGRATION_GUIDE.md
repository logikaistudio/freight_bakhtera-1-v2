# Migrasi Kurs (Exchange Rate) untuk Tabel Pabean

## Ringkasan

Migrasi ini menambahkan kolom `kurs` (nilai tukar/exchange rate) ke tabel pabean barang masuk (`freight_inbound`) dan pabean barang keluar (`freight_outbound`). Data kurs diambil dari kolom `exchange_rate` pada tabel pengajuan (`freight_quotations`).

## Perubahan yang Dilakukan

### 1. Database Schema

#### Tabel `freight_inbound` (Pabean Barang Masuk)
- **Kolom Baru**: `kurs` (NUMERIC 15,4) - Nilai tukar dari pengajuan
- **Kolom Baru**: `kurs_pengajuan_id` (UUID) - Foreign key ke freight_quotations

#### Tabel `freight_outbound` (Pabean Barang Keluar)
- **Kolom Baru**: `kurs` (NUMERIC 15,4) - Nilai tukar dari pengajuan
- **Kolom Baru**: `kurs_pengajuan_id` (UUID) - Foreign key ke freight_quotations

### 2. Data Context (`src/context/DataContext.jsx`)

#### Fungsi `mapInboundToState()`
```javascript
// Tambahan mapping untuk kurs
kurs: i.kurs,
kursPengajuanId: i.kurs_pengajuan_id,
```

#### Fungsi `mapOutboundToState()`
```javascript
// Tambahan mapping untuk kurs
kurs: o.kurs,
kursPengajuanId: o.kurs_pengajuan_id,
```

### 3. UI Components

#### BarangMasuk.jsx
- ✅ Kolom "Kurs" ditampilkan di tabel utama (antara Pengirim dan Jml Item)
- ✅ Kolom "Mata Uang" menampilkan currency code (IDR, USD, dll)
- ✅ Export XLS termasuk kedua kolom
- ✅ Export CSV termasuk kedua kolom
- ✅ Format: 2-4 desimal dengan pemisah lokal (contoh: 15.250,50)

#### BarangKeluar.jsx
- ✅ Kolom "Kurs" ditampilkan di tabel utama
- ✅ Kolom "Mata Uang" menampilkan currency code
- ✅ Export XLS termasuk kedua kolom
- ✅ Export CSV termasuk kedua kolom
- ✅ Peningkatan: Sekarang menggunakan `outboundTransactions` dari DataContext

## Cara Menggunakan

### Opsi 1: Menggunakan Script Node.js (Rekomendasi)

```bash
# Jalankan migrasi otomatis
node apply_kurs_migration.mjs
```

Script ini akan:
1. Menambahkan kolom `kurs` ke kedua tabel
2. Mengisi data kurs dari tabel pengajuan
3. Menampilkan verifikasi dan sampel data

### Opsi 2: Menggunakan SQL Langsung

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Buka file: add_kurs_to_pabean.sql
-- Copy dan paste seluruh isi ke Supabase SQL Editor
-- Jalankan untuk menerapkan migrasi
```

Atau jalankan query satu per satu:

```bash
# Jalankan migrasi SQL
psql -h [DB_HOST] -U [DB_USER] -d [DB_NAME] -f add_kurs_to_pabean.sql
```

## Verifikasi Setelah Migrasi

### 1. Check Kolom Database

Buka Supabase SQL Editor dan jalankan:

```sql
-- Periksa kolom di freight_inbound
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'freight_inbound' AND column_name LIKE 'kurs%'
ORDER BY ordinal_position;

-- Periksa kolom di freight_outbound
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'freight_outbound' AND column_name LIKE 'kurs%'
ORDER BY ordinal_position;
```

### 2. Check Data Terisii

```sql
-- Hitung berapa row dengan kurs terisi
SELECT 
    'freight_inbound' as tabel,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN kurs IS NOT NULL THEN 1 END) as rows_with_kurs
FROM public.freight_inbound
UNION ALL
SELECT 
    'freight_outbound',
    COUNT(*),
    COUNT(CASE WHEN kurs IS NOT NULL THEN 1 END)
FROM public.freight_outbound;

-- Lihat sampel data
SELECT pengajuan_id, kurs, kurs_pengajuan_id, created_at
FROM public.freight_inbound
WHERE kurs IS NOT NULL
LIMIT 10;
```

### 3. Test di UI

1. **Restart Development Server**
   ```bash
   npm run dev
   ```

2. **Buka Menu Barang Masuk**
   - Navigasi ke: Bridge > Pabean > Barang Masuk
   - Periksa apakah kolom "Kurs" dan "Mata Uang" tampil
   - Verifikasi data terisi dengan benar

3. **Buka Menu Barang Keluar**
   - Navigasi ke: Bridge > Pabean > Barang Keluar
   - Periksa apakah kolom "Kurs" dan "Mata Uang" tampil
   - Verifikasi data terisi dengan benar

4. **Test Export**
   - Klik tombol "XLS" untuk export
   - Klik tombol "CSV" untuk export
   - Verifikasi kolom kurs ada di file yang diunduh

## Struktur Data

### freight_quotations (Data Source)
```sql
SELECT 
    id,                    -- UUID
    quotation_number,      -- Nomor pengajuan
    exchange_rate,         -- Nilai tukar (kurs pengajuan)
    invoice_currency,      -- Kode mata uang
    created_at
FROM freight_quotations
WHERE exchange_rate IS NOT NULL
LIMIT 1;
```

### freight_inbound (After Migration)
```sql
SELECT 
    id,                    -- UUID
    pengajuan_id,          -- Foreign key ke freight_quotations
    kurs,                  -- Nilai tukar (baru)
    kurs_pengajuan_id,     -- Foreign key ke freight_quotations (baru)
    pengajuan_number,
    customs_doc_number,
    created_at
FROM freight_inbound
WHERE kurs IS NOT NULL
LIMIT 1;
```

### freight_outbound (After Migration)
```sql
SELECT 
    id,                    -- UUID
    pengajuan_id,          -- Foreign key ke freight_quotations
    kurs,                  -- Nilai tukar (baru)
    kurs_pengajuan_id,     -- Foreign key ke freight_quotations (baru)
    pengajuan_number,
    customs_doc_number,
    created_at
FROM freight_outbound
WHERE kurs IS NOT NULL
LIMIT 1;
```

## Rollback (Jika Diperlukan)

Jika perlu membatalkan migrasi:

```sql
-- Hapus kolom dari freight_inbound
ALTER TABLE public.freight_inbound
DROP COLUMN IF EXISTS kurs;

ALTER TABLE public.freight_inbound
DROP COLUMN IF EXISTS kurs_pengajuan_id;

-- Hapus kolom dari freight_outbound
ALTER TABLE public.freight_outbound
DROP COLUMN IF EXISTS kurs;

ALTER TABLE public.freight_outbound
DROP COLUMN IF EXISTS kurs_pengajuan_id;
```

## Format Tampilan Kurs

Nilai kurs ditampilkan dengan format:
- **Desimal**: 2-4 angka di belakang koma
- **Pemisah Ribuan**: Mengikuti locale Indonesia (. untuk ribuan)
- **Contoh**: 
  - 15250.50 → "15.250,50"
  - 1.2345 → "1,2345"
  - NULL → "-"

## Kolom di Export

### Export XLS
```
| No | No. Pengajuan | Jenis Dok | No. Pabean | Tgl Dok | Pengirim | Kurs Pengajuan | Mata Uang | Jml Item | Total Nilai |
```

### Export CSV
```
No. Pengajuan, Jenis Dok, No. Pabean, Tgl, Pengirim, Kurs Pengajuan, Mata Uang, Total Items, Total Nilai
```

## Catatan Penting

1. **Data yang Sudah Ada**: Hanya pengajuan yang memiliki nilai `exchange_rate` yang akan terisi kolom `kurs`. Pengajuan tanpa exchange rate akan memiliki NULL di kolom ini.

2. **Mapping Field**: 
   - Field UI: `kurs` → Database: `kurs`
   - Field UI: `kursPengajuanId` → Database: `kurs_pengajuan_id`

3. **Backward Compatibility**: Perubahan UI tidak menghapus kolom apapun, hanya menambah. Sistem tetap kompatibel dengan data lama.

4. **Performance**: Kolom kurs akan ditampilkan di tabel tanpa impact signifikan karena menggunakan join via pengajuan_id yang sudah indexed.

## Troubleshooting

### Kurs tidak muncul di UI
- Periksa apakah browser sudah reload
- Buka DevTools Console untuk lihat error
- Verifikasi data di database dengan query di atas

### Export tidak ada kolom Kurs
- Refresh halaman browser
- Periksa file export yang diunduh (bisa tertutup saat scroll)
- Pastikan ada data dengan kurs terisi

### Error saat menjalankan migration script
```bash
# Periksa .env file
cat .env | grep VITE_SUPABASE

# Pastikan key ada dan valid
# Jalankan dengan debug
DEBUG=* node apply_kurs_migration.mjs
```

## Support

Untuk pertanyaan atau masalah:
1. Periksa log di browser DevTools Console
2. Jalankan query verifikasi di SQL Editor
3. Lihat file error log jika ada

---

**Last Updated**: 2026-04-23
**Version**: 1.0.0
