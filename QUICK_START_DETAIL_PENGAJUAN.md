# 🚀 Quick Start: Detail Pengajuan dengan Dokumen

## ⚡ 30 Detik Setup

Fitur sudah **LIVE** di menu Bridge! Tidak perlu setup tambahan.

---

## 🎬 Mulai Gunakan

### 1️⃣ Buka Menu Bridge
```
Dashboard → Bridge → Pengajuan
```

### 2️⃣ Klik Salah Satu Pengajuan di Tabel
```
Tabel "Pengajuan Masuk" atau "Pengajuan Keluar"
↓
Klik baris pengajuan apapun
↓
Modal Detail terbuka 👉 Lihat semua info & dokumen!
```

### 3️⃣ Explore Fitur
- 📑 **Preview/Download dokumen** di section "Dokumen Pendukung"
- 📦 **Lihat detail barang** per package
- 🔢 **Ringkasan** (total package, item, qty)
- ✏️ **Edit** atau 🗑️ **Hapus** pengajuan (jika hak akses ada)

---

## 📋 Yang Bisa Dilakukan

| Fitur | Status |
|-------|--------|
| Lihat detail pengajuan | ✅ |
| Lihat daftar dokumen | ✅ |
| Preview dokumen (PDF/Image) | ✅ |
| Download dokumen | ✅ |
| Lihat detail barang per package | ✅ |
| Edit pengajuan (jika status pengajuan) | ✅ |
| Edit pengajuan (jika status approved) | ❌ Disabled |
| Hapus pengajuan | ✅ |

---

## 🎯 Contoh Penggunaan

### Verifikasi Dokumen Approved
1. Klik pengajuan dengan status **"Approved"** (badge hijau)
2. Modal terbuka → Lihat **Dokumen Pendukung**
3. Klik **[Preview]** untuk cek dokumen
4. Klik **[Download]** untuk simpan di komputer

### Quick Check Detail Barang
1. Klik pengajuan apapun
2. Scroll ke **"📦 Detail Barang"**
3. Lihat kode item, nama, qty, unit per package
4. Bandingkan dengan physical goods di warehouse

### Hapus Pengajuan yang Salah
1. Klik pengajuan dengan status **"Pengajuan"** (belum approved)
2. Klik tombol **[Hapus]** di footer
3. Confirm → Pengajuan dihapus

---

## ⚙️ Technical Info

**File yang Diubah:**
- `src/pages/Bridge/PengajuanManagement.jsx`
  - Added: Detail modal component
  - Updated: Row onClick untuk tabel (inbound + outbound)

**State Management:**
- `showDetailModal` - Boolean untuk kontrol modal visibility
- `selectedPengajuan` - Object pengajuan yang dipilih

**Database Fields:**
- `bcSupportingDocuments` (JSONB) - Array dokumen dengan struktur:
  ```json
  {
    "id": "doc-123",
    "name": "Invoice",
    "fileName": "invoice.pdf",
    "fileType": "pdf",
    "fileSize": 102400,
    "uploadedAt": "2025-04-27T10:30:00Z",
    "fileData": "data:application/pdf;base64,JVBERi0..."
  }
  ```

---

## 🔍 Cek Dokumen Muncul atau Tidak

### ✅ Dokumen Seharusnya Muncul Jika:
- Pengajuan punya field `bcSupportingDocuments` yang terisi
- Dokumen punya struktur data: `name/fileName`, `uploadedAt`, `fileData` atau `url`

### ❌ Troubleshoot Jika Dokumen Tidak Muncul:
1. **Check Browser Console** → `F12` → Console tab
   - Cari error message, laporkan ke developer

2. **Check Database** → Buka Supabase Dashboard
   - Tabel `freight_quotations`
   - Cari kolom `bc_supporting_documents`
   - Lihat apakah ada data untuk pengajuan tersebut

3. **Check Component** → Buka Developer Tools (F12)
   - Inspect modal element
   - Cek apakah section "Dokumen Pendukung" muncul

---

## 💡 Tips & Tricks

### 🎨 Styling Custom
Jika ingin ubah warna/layout, file CSS ada di:
- `src/styles/` atau langsung di component dengan `className`
- Class yang digunakan: Tailwind CSS + custom classes (`accent-purple`, `glass-card`, dsb.)

### 🔐 Permission Control
Edit permission di `src/context/AuthContext.jsx` atau database `permissions` table:
- `bridge_pengajuan:edit` - Untuk tombol Edit
- `bridge_pengajuan:delete` - Untuk tombol Delete

### 📱 Mobile Optimization
Modal sudah responsive (tested di 320px+), tapi jika ada issue:
- Max-width modal: `max-w-4xl` (bisa dikecil jadi `max-w-3xl` untuk mobile)
- Scroll: Modal body punya `max-h-[60vh] overflow-y-auto`

---

## 🆘 Bantuan

**Q: Dokumen tidak bisa di-download?**
A: Cek:
- File masih tersimpan di database (field `fileData` atau `url` tidak kosong)
- Browser tidak memblokir pop-up/download
- Ukuran file < limit browser (biasanya 2GB)

**Q: Modal tidak muncul saat klik baris tabel?**
A: Kemungkinan:
- JavaScript error (cek console F12)
- State tidak update dengan benar
- Refresh halaman dan coba lagi

**Q: Tombol Edit tetap aktif meski status Approved?**
A: Developer perlu tambah validasi di `handleEditPengajuan` untuk disable edit jika status approved

**Q: Ingin tambah format file baru (misal: DOC, XLS)?**
A: Update validasi di `DocumentUploadManager.jsx`:
- Field `validTypes` di function `validateFile`
- Update UI untuk icon file type yang baru

---

## 📞 Report Issue

Jika ada bug atau feature request, buat issue dengan template:

```markdown
**Judul:** [Bug/Feature] Deskripsi singkat

**Deskripsi:**
Penjelasan detail tentang bug atau feature yang diminta

**Langkah Reproduksi (untuk bug):**
1. Buka...
2. Klik...
3. Lihat...

**Expected vs Actual:**
- Expected: [Hasil yang diharapkan]
- Actual: [Hasil yang terjadi]

**Attachment:**
- Screenshot/Video (jika ada)
```

---

**Last Updated:** 27 April 2025
**Quick Start Version:** 1.0
