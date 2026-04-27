# Dokumentasi Fitur Detail Pengajuan dengan Dokumen

## 📋 Ringkasan Fitur
Fitur detail pengajuan memungkinkan user untuk melihat:
- **Detail lengkap pengajuan** (nomor, tanggal, customer, BC document, dsb.)
- **Daftar dokumen pendukung** dengan tombol preview dan download
- **Detail barang per package** (kode item, nama, jumlah, unit)
- **Ringkasan total** (jumlah package, item, quantity)
- **Akses untuk semua status** (pengajuan, approved, rejected)

---

## 🚀 Cara Menggunakan

### Step 1: Navigasi ke Menu Bridge → Pengajuan
1. Buka aplikasi dan masuk ke menu **Bridge**
2. Pilih submenu **Pengajuan** (atau **Pengajuan Masuk/Keluar**)
3. Anda akan melihat daftar tabel pengajuan (Masuk/Keluar)

### Step 2: Klik Baris Pengajuan untuk Membuka Detail
1. Pada tabel, **klik salah satu baris pengajuan** (misal: baris dengan No. Pengajuan "PGJ-2025-001")
2. Sebuah modal akan terbuka menampilkan **Detail Pengajuan**

### Step 3: Lihat & Download Dokumen Pendukung
Di dalam modal detail, akan ada section **"📑 Dokumen Pendukung"** berisi:
- Tabel dengan kolom: **Nama** | **Tanggal** | **Aksi**
- Setiap baris dokumen memiliki 2 tombol:
  - **[Preview]** - Membuka dokumen di tab baru (untuk PDF/Image)
  - **[Download]** - Mengunduh dokumen ke komputer

### Step 4: Lihat Detail Barang
Scroll ke bawah untuk melihat section **"📦 Detail Barang"** yang berisi:
- **Package-by-package breakdown**
- Setiap package menampilkan tabel item dengan:
  - Kode item
  - Nama item
  - Jumlah (Qty)
  - Satuan (Unit)

### Step 5: Lihat Ringkasan
Di akhir modal, ada **ringkasan** yang menampilkan:
- **Total Package** - Jumlah total package
- **Total Item** - Jumlah total item unik
- **Total Quantity** - Total quantity dari semua item

### Step 6: Tombol Aksi
Di bagian footer modal ada 3 tombol:
1. **Tutup** - Menutup detail modal
2. **Hapus** - Menghapus pengajuan (jika ada hak akses)
3. **Edit** - Membuka modal edit untuk mengubah status/dokumen (jika ada hak akses & status belum approved)

---

## 📝 Catatan Penting

### ✅ Akses untuk Status Approved
- **Modal detail tetap bisa dibuka** meski status pengajuan sudah "Approved"
- **Tombol Edit** akan **disable** jika status sudah "Approved"
- **Preview/Download dokumen** tetap aktif untuk referensi

### 📄 Format File yang Didukung
- **PDF** (.pdf)
- **Gambar** (.jpg, .jpeg, .png)
- Format lain bergantung pada konfigurasi Supabase Storage

### 💾 Penyimpanan Dokumen
- Dokumen disimpan dalam bentuk **base64** di frontend
- Atau bisa diintegrasikan dengan **Supabase Storage** untuk penyimpanan file yang lebih efisien
- Metadata dokumen: Nama, Tanggal Upload, File Type, Ukuran

### 🔐 Kontrol Akses
- **Hak Lihat Detail** - Semua user dengan akses menu Bridge dapat melihat detail pengajuan
- **Hak Edit/Hapus** - Tergantung pada role/permission di sistem
- **Download Dokumen** - Semua user dengan akses Bridge dapat download dokumen

---

## 🎯 Contoh Use Case

### Use Case 1: Verifikasi Dokumen Pengajuan yang Sudah Approved
1. Manager ingin memverifikasi dokumen yang sudah di-approve oleh approver
2. Manager membuka detail pengajuan yang sudah "Approved"
3. Manager dapat melihat semua dokumen pendukung dan preview/download untuk verifikasi
4. Modal detail tetap accessible meski status "Approved"

### Use Case 2: Follow-up Dokumen Pengajuan Masuk
1. Staff ingin cek dokumen apa saja yang sudah diupload untuk pengajuan tertentu
2. Staff klik baris pengajuan di tabel
3. Staff langsung melihat daftar dokumen + detail barang
4. Staff dapat download dokumen untuk arsip atau forward ke pihak terkait

### Use Case 3: Quick Reference untuk Detail Barang
1. Warehouse staff ingin lihat detail barang dari pengajuan tertentu
2. Staff klik baris pengajuan
3. Modal menampilkan detail barang per package, including kode item, qty, dsb.
4. Staff bisa cross-check dengan physical goods di warehouse

---

## ⚙️ Integrasi dengan Supabase (Optional)

Jika ingin menyimpan file dokumen di **Supabase Storage** (lebih scalable):

### Step 1: Setup Supabase Storage
```sql
-- Buat bucket untuk dokumen pengajuan
INSERT INTO storage.buckets (id, name, public)
VALUES ('bridge-documents', 'Bridge Documents', false);
```

### Step 2: Update Metadata Dokumen
Saat upload, simpan metadata dengan file URL:
```javascript
{
  id: 'doc-12345',
  name: 'Invoice ABC',
  fileName: 'invoice-abc.pdf',
  fileType: 'pdf',
  fileSize: 102400,
  uploadedAt: '2025-04-27T10:30:00Z',
  url: 'https://your-supabase.supabase.co/storage/v1/object/public/bridge-documents/...',
  storageKey: 'bridge-documents/pengajuan-123/invoice-abc.pdf'
}
```

### Step 3: Preview/Download dari Supabase
```javascript
// Preview
window.open(doc.url, '_blank');

// Download
fetch(doc.url).then(res => res.blob()).then(blob => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = doc.fileName;
  a.click();
});
```

---

## 🐛 Troubleshooting

### ❌ Masalah: Modal Detail Tidak Muncul
**Solusi:**
- Pastikan JavaScript console tidak ada error
- Refresh halaman
- Cek apakah row onClick sudah diubah ke `setShowDetailModal(true)`

### ❌ Masalah: Dokumen Tidak Tampil
**Solusi:**
- Pastikan field `bcSupportingDocuments` terisi di database
- Cek apakah dokumen disimpan dalam format base64 atau URL Supabase
- Validasi struktur data dokumen (harus ada field: name/fileName, uploadedAt, fileData/url)

### ❌ Masalah: Preview/Download Tidak Bekerja
**Solusi:**
- Jika file base64, pastikan tidak ada karakter terputus
- Jika URL Supabase, pastikan file masih tersimpan di storage
- Cek browser console untuk error detail

### ❌ Masalah: Tombol Edit Tetap Bisa Diklik untuk Status Approved
**Solusi:**
- Validasi di backend perlu dilakukan: jangan boleh update pengajuan dengan status approved
- Atau matikan tombol Edit jika status approved dengan conditional render

---

## 📞 Support & Dokumentasi Lebih Lanjut
Untuk bantuan teknis atau fitur tambahan, hubungi:
- **Team Developer** - Untuk integrasi Supabase Storage
- **Team QA** - Untuk testing & validation

---

**Last Updated:** 27 April 2025
**Version:** 1.0
