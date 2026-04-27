# Test Plan: Detail Pengajuan dengan Dokumen

## 🎯 Tujuan Testing
Memverifikasi bahwa fitur detail pengajuan dengan daftar dokumen bekerja sesuai spesifikasi untuk semua skenario (status pengajuan, akses dokumen, dsb.)

---

## 🧪 Test Cases

### Test Case 1: Buka Detail Pengajuan Masuk (Status: Pengajuan)
**Precondition:**
- User sudah login dan memiliki akses menu Bridge
- Ada minimal 1 pengajuan masuk dengan status "Pengajuan"

**Steps:**
1. Navigasi ke Bridge → Pengajuan
2. Lihat tabel "Pengajuan Masuk (Inbound)"
3. Klik salah satu baris dengan status "Pengajuan"

**Expected Result:**
- Modal detail pengajuan terbuka
- Menampilkan semua field: No. Pengajuan, Tanggal, Customer, BC Document, dsb.
- Status dokumen menampilkan badge "Pengajuan" (kuning)
- Section dokumen menampilkan list dokumen (atau "Tidak ada dokumen" jika kosong)
- Section detail barang menampilkan package + item per package
- Tombol Edit **aktif** (dapat diklik)
- Tombol Delete **aktif** (dapat diklik)

**Priority:** 🔴 HIGH

---

### Test Case 2: Buka Detail Pengajuan Masuk (Status: Approved)
**Precondition:**
- Ada minimal 1 pengajuan masuk dengan status "Approved"

**Steps:**
1. Navigasi ke Bridge → Pengajuan
2. Klik salah satu baris dengan status "Approved"

**Expected Result:**
- Modal detail pengajuan terbuka
- Status dokumen menampilkan badge "Approved" (hijau)
- Section dokumen menampilkan list dokumen
- Tombol Edit **disable/tidak bisa diklik** (atau menampilkan warning)
- Tombol Delete tetap **aktif**
- Semua field dokumentasi tetap bisa diakses untuk referensi

**Priority:** 🔴 HIGH

---

### Test Case 3: Buka Detail Pengajuan Keluar (Status: Outbound)
**Precondition:**
- Ada minimal 1 pengajuan keluar dengan data lengkap

**Steps:**
1. Navigasi ke Bridge → Pengajuan
2. Lihat tabel "Pengajuan Keluar (Outbound)"
3. Klik salah satu baris

**Expected Result:**
- Modal detail pengajuan terbuka
- Menampilkan referensi pengajuan masuk (jika ada): "📥 Referensi Pengajuan Masuk"
- Field source pengajuan terisi dengan No. Pengajuan Asal & No. Pabean Asal
- Tombol Edit dan Delete bekerja sesuai status dokumen

**Priority:** 🔴 HIGH

---

### Test Case 4: Preview Dokumen
**Precondition:**
- Pengajuan dengan minimal 1 dokumen yang sudah diupload

**Steps:**
1. Buka detail pengajuan
2. Di section "📑 Dokumen Pendukung", klik tombol **[Preview]** pada salah satu dokumen

**Expected Result:**
- Jika file PDF: Tab baru membuka PDF viewer/preview
- Jika file Image (JPG/PNG): Tab baru membuka image preview
- Tidak ada error di console

**Priority:** 🟡 MEDIUM

---

### Test Case 5: Download Dokumen
**Precondition:**
- Pengajuan dengan minimal 1 dokumen yang sudah diupload

**Steps:**
1. Buka detail pengajuan
2. Di section "📑 Dokumen Pendukung", klik tombol **[Download]** pada salah satu dokumen

**Expected Result:**
- Browser menampilkan dialog download
- File terunduh dengan nama yang benar (sesuai field `name` atau `fileName`)
- File dapat dibuka di local machine tanpa error
- Ukuran file sesuai dengan yang diupload

**Priority:** 🟡 MEDIUM

---

### Test Case 6: Lihat Detail Barang per Package
**Precondition:**
- Pengajuan dengan minimal 2 package, masing-masing punya 2+ item

**Steps:**
1. Buka detail pengajuan
2. Scroll ke section "📦 Detail Barang"
3. Lihat tabel item di setiap package

**Expected Result:**
- Setiap package ditampilkan dalam card terpisah
- Tabel item menampilkan kolom: Kode, Nama Item, Qty, Unit
- Data item terisi dengan benar sesuai database
- Tidak ada item yang hilang atau duplikat

**Priority:** 🔴 HIGH

---

### Test Case 7: Lihat Ringkasan
**Precondition:**
- Pengajuan dengan minimal 3 package + 5 item total

**Steps:**
1. Buka detail pengajuan
2. Scroll ke bagian akhir modal
3. Lihat section "Ringkasan" dengan 3 kartu: Total Package, Total Item, Total Quantity

**Expected Result:**
- Total Package: Sesuai jumlah package yang ada
- Total Item: Sesuai jumlah item unik
- Total Quantity: Sesuai sum dari semua item quantity
- Angka-angka **bold** dengan warna ungu (accent-purple)

**Priority:** 🟡 MEDIUM

---

### Test Case 8: Tutup Modal Detail
**Precondition:**
- Modal detail sudah terbuka

**Steps:**
1. Klik tombol **[Tutup]** di footer modal
2. Atau klik tombol X di header modal

**Expected Result:**
- Modal tertutup
- Kembali ke halaman daftar pengajuan
- Daftar pengajuan masih menampilkan data yang sama

**Priority:** 🟢 LOW

---

### Test Case 9: Edit dari Detail Modal (Status Approved)
**Precondition:**
- Pengajuan dengan status "Approved"

**Steps:**
1. Buka detail pengajuan dengan status Approved
2. Coba klik tombol **[Edit]**

**Expected Result:**
- **Opsi A (Recommended):** Tombol Edit disable/greyed out
- **Opsi B:** Muncul warning modal "Dokumen yang sudah approved tidak dapat diedit"
- **Opsi C:** Buka modal edit tapi field-field disable (read-only)

**Priority:** 🟡 MEDIUM

---

### Test Case 10: Hapus Pengajuan dari Detail Modal
**Precondition:**
- Pengajuan dengan status "Pengajuan" (bukan approved/rejected)
- User memiliki hak akses delete

**Steps:**
1. Buka detail pengajuan
2. Klik tombol **[Hapus]**
3. Konfirmasi dialog penghapusan jika muncul

**Expected Result:**
- Pengajuan terhapus dari database
- Modal tertutup
- Daftar pengajuan di halaman sebelumnya di-update (pengajuan hilang dari tabel)
- Muncul notifikasi sukses (toast/alert)

**Priority:** 🟡 MEDIUM

---

### Test Case 11: Responsiveness pada Mobile/Tablet
**Precondition:**
- Browser di-resize ke ukuran mobile (320px) atau tablet (768px)

**Steps:**
1. Buka detail pengajuan pada ukuran layar mobile
2. Scroll modal dan cek readability

**Expected Result:**
- Modal tetap readable pada ukuran kecil
- Tabel item bisa di-scroll horizontal
- Tombol aksi tetap accessible
- Tidak ada text yang terpotong

**Priority:** 🟡 MEDIUM

---

### Test Case 12: Performance - Modal dengan Banyak Dokumen
**Precondition:**
- Pengajuan dengan 20+ dokumen

**Steps:**
1. Buka detail pengajuan
2. Scroll section dokumen
3. Ukur waktu loading & scrolling performance

**Expected Result:**
- Modal tetap responsif
- Tidak ada lag saat scroll
- Semua dokumen tampil dengan benar
- Loading time < 2 detik

**Priority:** 🟢 LOW

---

## 📊 Test Execution Summary

| No | Test Case | Status | Notes |
|----|-----------|--------|-------|
| 1 | Detail Pengajuan - Status Pengajuan | ⏳ | |
| 2 | Detail Pengajuan - Status Approved | ⏳ | |
| 3 | Detail Pengajuan - Status Outbound | ⏳ | |
| 4 | Preview Dokumen | ⏳ | |
| 5 | Download Dokumen | ⏳ | |
| 6 | Detail Barang per Package | ⏳ | |
| 7 | Ringkasan | ⏳ | |
| 8 | Tutup Modal | ⏳ | |
| 9 | Edit Approved | ⏳ | |
| 10 | Hapus Pengajuan | ⏳ | |
| 11 | Responsiveness Mobile | ⏳ | |
| 12 | Performance Banyak Dokumen | ⏳ | |

**Legend:** 
- ⏳ Pending
- ✅ Pass
- ❌ Fail
- 🔄 In Progress

---

## 🚨 Bug Report Template

```
**Test Case:** [No] - [Nama Test Case]
**Status:** ❌ FAIL

**Describe Bug:**
[Deskripsi detail bug yang terjadi]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[Hasil yang diharapkan]

**Actual Result:**
[Hasil yang terjadi]

**Screenshots/Video:**
[Attach screenshot or video]

**Browser/Device:**
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [e.g., 125.0]
- Device: [Desktop/Mobile/Tablet]
- OS: [Windows/Mac/Linux]

**Severity:**
🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
```

---

## ✅ Sign-Off

- **Tested by:** [QA Name]
- **Date:** [Date]
- **Status:** [Pass/Fail/Partial]
- **Notes:** [Any additional notes]

---

**Last Updated:** 27 April 2025
**Version:** 1.0
