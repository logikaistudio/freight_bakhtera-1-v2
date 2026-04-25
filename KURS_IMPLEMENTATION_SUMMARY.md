# Summary: Penambahan Kolom Kurs pada Pabean

## ✅ Selesai Dilakukan

Telah menambahkan kolom **kurs** (nilai tukar/exchange rate) pada tabel pabean barang masuk dan keluar, dengan data diambil dari kurs pengajuan pada menu bridge.

## 📁 File yang Dibuat/Diubah

### 1. Database Migration
- **File Baru**: `add_kurs_to_pabean.sql`
  - SQL script untuk menambahkan kolom kurs ke freight_inbound dan freight_outbound
  - Mengisi data dari freight_quotations.exchange_rate via pengajuan_id
  - Termasuk query verifikasi

### 2. Node.js Migration Script
- **File Baru**: `apply_kurs_migration.mjs`
  - Script otomatis untuk menjalankan migrasi ke Supabase
  - Verifikasi dan menampilkan hasil migrasi
  - Menampilkan sampel data yang berhasil

### 3. Documentation
- **File Baru**: `KURS_MIGRATION_GUIDE.md`
  - Panduan lengkap penggunaan dan verifikasi
  - Instruksi rollback jika diperlukan
  - Troubleshooting dan FAQ

### 4. Backend Update
- **File Diubah**: `src/context/DataContext.jsx`
  - Fungsi `mapInboundToState()`: menambah mapping `kurs` dan `kursPengajuanId`
  - Fungsi `mapOutboundToState()`: menambah mapping `kurs` dan `kursPengajuanId`

### 5. UI Components - Barang Masuk
- **File Diubah**: `src/pages/Bridge/Pabean/BarangMasuk.jsx`
  - Tabel utama: Kolom "Kurs" ditampilkan antara Pengirim dan Jml Item
  - Export XLS: Termasuk "Kurs Pengajuan" dan "Mata Uang"
  - Export CSV: Termasuk "Kurs Pengajuan" dan "Mata Uang"
  - Format: Numeric dengan 2-4 desimal sesuai locale Indonesia

### 6. UI Components - Barang Keluar
- **File Diubah**: `src/pages/Bridge/Pabean/BarangKeluar.jsx`
  - Tabel utama: Kolom "Kurs" ditampilkan
  - Export XLS: Termasuk "Kurs Pengajuan" dan "Mata Uang"
  - Export CSV: Termasuk "Kurs Pengajuan" dan "Mata Uang"
  - Improvement: Sekarang menggunakan outboundTransactions dari DataContext

## 🔄 Alur Data

```
Pengajuan (freight_quotations)
    ↓ exchange_rate
    ↓
Database Columns
    ├─ freight_inbound.kurs
    ├─ freight_inbound.kurs_pengajuan_id
    ├─ freight_outbound.kurs
    └─ freight_outbound.kurs_pengajuan_id
    ↓
DataContext (mapInboundToState / mapOutboundToState)
    ├─ kurs
    └─ kursPengajuanId
    ↓
UI Components (BarangMasuk / BarangKeluar)
    ├─ Tampilan di tabel
    ├─ Export XLS
    └─ Export CSV
```

## 🚀 Cara Menjalankan Migrasi

### Opsi 1: Otomatis (Recommended)
```bash
node apply_kurs_migration.mjs
```

### Opsi 2: Manual SQL
```bash
# Buka Supabase SQL Editor
# Copy isi dari add_kurs_to_pabean.sql
# Paste dan Run di SQL Editor
```

## ✨ Fitur Baru

### Tabel Barang Masuk
- ✅ Kolom "Kurs" menampilkan nilai tukar dari pengajuan
- ✅ Kolom "Mata Uang" menampilkan kode mata uang (IDR, USD, dll)
- ✅ Format angka lokal Indonesia
- ✅ Terintegrasi di export XLS dan CSV

### Tabel Barang Keluar
- ✅ Kolom "Kurs" menampilkan nilai tukar dari pengajuan
- ✅ Kolom "Mata Uang" menampilkan kode mata uang
- ✅ Format angka lokal Indonesia
- ✅ Terintegrasi di export XLS dan CSV
- ✅ Menggunakan outboundTransactions dari DataContext

## 📊 Contoh Tampilan

### Tabel Barang Masuk (Sebelum)
```
No. Pengajuan | Jenis Dok | No. Pabean | Tgl Dok | Pengirim | Jml Item | Total Nilai
```

### Tabel Barang Masuk (Sesudah)
```
No. Pengajuan | Jenis Dok | No. Pabean | Tgl Dok | Pengirim | Kurs | Jml Item | Total Nilai
PJ-001        | BC 2.3    | BC-123456  | 01/04   | PT ABC   | 15250.50 | 5 | Rp 2.500.000
```

## 📋 Database Schema

### freight_inbound & freight_outbound (Kolom Baru)
```sql
-- Kolom Baru
kurs NUMERIC(15, 4)          -- Nilai tukar dari pengajuan
kurs_pengajuan_id UUID       -- Foreign key ke freight_quotations
```

## 🔍 Verifikasi Hasil

Setelah menjalankan migrasi:

1. **Buka Pabean > Barang Masuk**
   - Lihat kolom "Kurs" di tabel
   - Nilai harus terisi untuk pengajuan yang punya exchange_rate

2. **Buka Pabean > Barang Keluar**
   - Lihat kolom "Kurs" di tabel
   - Nilai harus terisi untuk pengajuan yang punya exchange_rate

3. **Test Export**
   - Klik XLS → Lihat kolom "Kurs Pengajuan" dan "Mata Uang"
   - Klik CSV → Lihat kolom "Kurs Pengajuan" dan "Mata Uang"

4. **Verifikasi Database**
   ```sql
   SELECT COUNT(*) as total_with_kurs
   FROM freight_inbound
   WHERE kurs IS NOT NULL;
   ```

## 📝 Catatan

- **Backward Compatible**: Tidak ada breaking changes
- **Data Lama**: Pengajuan lama yang sudah ada akan auto-filled saat migrasi
- **Pengajuan Baru**: Saat membuat pengajuan baru, kurs akan auto-filled dari exchange_rate
- **Format Kurs**: Ditampilkan dengan 2-4 desimal mengikuti locale Indonesia

## 🎯 Next Steps

1. ✅ Jalankan migrasi: `node apply_kurs_migration.mjs`
2. ✅ Restart development server: `npm run dev`
3. ✅ Buka menu Barang Masuk dan Barang Keluar
4. ✅ Verifikasi kolom Kurs tampil dan terisi
5. ✅ Test export XLS/CSV
6. ✅ Deploy ke production

## 📚 Dokumentasi Lengkap

Lihat: `KURS_MIGRATION_GUIDE.md`

---

**Status**: ✅ Siap Dijalankan
**Version**: 1.0.0
**Last Updated**: 2026-04-23
