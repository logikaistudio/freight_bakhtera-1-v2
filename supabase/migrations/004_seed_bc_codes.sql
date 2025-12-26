-- =====================================================
-- Seed Data for BC Codes (Master)
-- Table: freight_bc_codes
-- =====================================================

INSERT INTO freight_bc_codes (id, code, name, category, description, is_active)
VALUES
    ('bc-2.3', 'BC 2.3', 'Pemasukan Barang Lokal ke TPPB', 'inbound', 'Digunakan untuk memasukkan barang asal dalam negeri ke TPPB untuk keperluan pameran.', true),
    ('bc-2.6.1', 'BC 2.6.1', 'Pemasukan dari TPPB Lain', 'inbound', 'Pemasukan barang dari TPPB satu ke TPPB lainnya.', true),
    ('bc-2.6.2', 'BC 2.6.2', 'Pengeluaran ke TPPB Lain', 'outbound', 'Pengeluaran barang dari satu TPPB ke TPPB lainnya.', true),
    ('bc-2.7', 'BC 2.7', 'Pemasukan/Pengeluaran Barang untuk Diolah', 'inbound', 'Pemasukan atau pengeluaran barang untuk tujuan pengolahan (subkontrak).', true),
    ('bc-4.0', 'BC 4.0', 'Pemasukan Barang Impor ke TPPB', 'inbound', 'Pemasukan barang impor langsung ke TPPB tanpa bayar bea masuk (penangguhan).', true),
    ('bc-4.1', 'BC 4.1', 'Pengeluaran Barang Impor dari TPPB', 'outbound', 'Pengeluaran barang impor dari TPPB ke tempat lain dalam daerah pabean.', true),
    ('bc-2.0', 'BC 2.0', 'Pemberitahuan Impor Barang (PIB)', 'inbound', 'Dokumen untuk impor barang umum.', true),
    ('bc-3.0', 'BC 3.0', 'Pemberitahuan Ekspor Barang (PEB)', 'outbound', 'Dokumen untuk ekspor barang ke luar negeri.', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- End of Seed
