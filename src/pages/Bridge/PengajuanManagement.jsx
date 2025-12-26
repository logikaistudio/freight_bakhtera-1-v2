import React, { useState } from 'react';
import { Plus, FileText, CheckCircle, Edit2, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Button from '../../components/Common/Button';
import PackageManager from '../../components/Common/PackageManager';
import DocumentUploadManager from '../../components/Common/DocumentUploadManager';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '../../utils/exportCSV';

const PengajuanManagement = () => {
    const {
        quotations = [],
        customers = [],
        addQuotation,
        updateQuotation,
        confirmQuotation,
        bcCodes = [],
        itemMaster = [],
        vendors = []
    } = useData();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, quotationId: null });
    const [editModal, setEditModal] = useState({ show: false, pengajuan: null });
    const [editFormData, setEditFormData] = useState({
        bcDocumentNumber: '',
        bcDocumentDate: '',
        bcSupportingDocuments: [],
        documentStatus: 'pengajuan',
        rejectionReason: '',
        rejectionDate: '',
        pic: ''
    });

    const [formData, setFormData] = useState({
        submissionDate: new Date().toISOString().split('T')[0],
        customer: '',
        type: 'inbound',
        bcDocType: '',
        itemCode: '',
        shipper: '',
        origin: '',
        destination: '',
        itemDate: '',  // Tanggal Masuk/Keluar Barang (conditional based on type)
        packages: [],
        documents: [],
        notes: '',
        // BL and Invoice fields
        blNumber: '',
        blDate: '',
        invoiceNumber: '',
        invoiceValue: '',
        invoiceCurrency: 'IDR',
        exchangeRate: '',
        exchangeRateDate: '',
        // Approval workflow fields
        documentStatus: 'pengajuan',
        bcDocumentNumber: '',
        bcDocumentDate: '',  // Tanggal Pabean
        bcSupportingDocuments: [],
        rejectionReason: '',
        rejectionDate: '',
        pic: '',
        customsStatus: 'pending'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('🚀 handleSubmit called');
        console.log('📋 Current formData:', formData);
        console.log('📦 Packages:', formData.packages);
        console.log('📦 Packages length:', formData.packages.length);

        if (formData.packages.length === 0) {
            console.error('❌ Validation failed: No packages');
            alert('❌ VALIDASI GAGAL:\nHarap tambahkan minimal satu package!\n\nKlik "Tambah Package" terlebih dahulu.');
            return;
        }

        // Check if at least one package has items
        console.log('🔍 Checking if packages have items...');
        formData.packages.forEach((pkg, idx) => {
            console.log(`  Package ${idx + 1} (${pkg.packageNumber}):`, pkg.items?.length || 0, 'items');
        });

        const hasItems = formData.packages.some(pkg => pkg.items && pkg.items.length > 0);
        if (!hasItems) {
            console.error('❌ Validation failed: No items in packages');
            alert('❌ VALIDASI GAGAL:\nMinimal satu package harus berisi barang!\n\n1. Expand package dengan klik chevron\n2. Klik "Tambah Barang" dalam package\n3. Isi minimal nama barang');
            return;
        }

        console.log('✅ Validation passed - packages:', formData.packages.length, 'items:', formData.packages.reduce((sum, pkg) => sum + (pkg.items?.length || 0), 0));

        const pengajuanData = {
            ...formData,
            date: new Date().toISOString().split('T')[0],
            status: 'quotation',
            documentStatus: 'pengajuan', // Default status
            customsStatus: 'pending'
        };

        console.log('📝 Sending pengajuan data:', pengajuanData);
        addQuotation(pengajuanData);
        console.log('✅ addQuotation called');

        // Reset form
        setFormData({
            submissionDate: new Date().toISOString().split('T')[0],
            customer: '',
            type: 'inbound',
            bcDocType: '',
            itemCode: '',
            shipper: '',
            origin: '',
            destination: '',
            itemDate: '',
            packages: [],
            documents: [],
            notes: '',
            blNumber: '',
            blDate: '',
            invoiceNumber: '',
            invoiceValue: '',
            invoiceCurrency: 'IDR',
            exchangeRate: '',
            exchangeRateDate: '',
            documentStatus: 'pengajuan',
            bcDocumentNumber: '',
            bcSupportingDocuments: [],
            rejectionReason: '',
            rejectionDate: '',
            pic: '',
            customsStatus: 'pending'
        });
        setShowForm(false);
        alert('Pengajuan berhasil dibuat!');
        console.log('✅ Form reset complete');
    };

    const handleConfirm = (quotationId) => {
        setConfirmDialog({ show: true, quotationId });
    };

    const handleConfirmAction = () => {
        confirmQuotation(confirmDialog.quotationId);
        setConfirmDialog({ show: false, quotationId: null });
        navigate('/bridge/customs-docs');
    };

    const handleCancelDialog = () => {
        setConfirmDialog({ show: false, quotationId: null });
    };

    const handleEditPengajuan = (pengajuan) => {
        setEditFormData({
            bcDocumentNumber: pengajuan.bcDocumentNumber || '',
            bcDocumentDate: pengajuan.bcDocumentDate || '',
            bcSupportingDocuments: pengajuan.bcSupportingDocuments || [],
            documentStatus: pengajuan.documentStatus || 'pengajuan',
            rejectionReason: pengajuan.rejectionReason || '',
            rejectionDate: pengajuan.rejectionDate || '',
            pic: pengajuan.pic || ''
        });
        setEditModal({ show: true, pengajuan });
    };

    const handleSaveEdit = () => {
        // Validation
        if (editFormData.documentStatus === 'approved' && !editFormData.bcDocumentNumber.trim()) {
            alert('❌ No. Dokumen Pabean wajib diisi untuk approval');
            return;
        }

        if (editFormData.documentStatus === 'rejected') {
            if (!editFormData.rejectionReason.trim()) {
                alert('❌ Keterangan Penolakan wajib diisi untuk rejection');
                return;
            }
            if (!editFormData.rejectionDate) {
                alert('❌ Tanggal Reject wajib diisi untuk rejection');
                return;
            }
        }

        console.log('💾 Updating pengajuan:', editModal.pengajuan.id, editFormData);

        // Call update function from DataContext
        if (updateQuotation) {
            const updatedData = {
                ...editModal.pengajuan,
                ...editFormData,
                // Also update customs status when document is approved
                customsStatus: editFormData.documentStatus === 'approved' ? 'approved' : editModal.pengajuan.customsStatus,
                approvedDate: editFormData.documentStatus === 'approved' ? new Date().toISOString().split('T')[0] : editModal.pengajuan.approvedDate,
                approvedBy: editFormData.documentStatus === 'approved' ? 'Admin' : editModal.pengajuan.approvedBy
            };

            updateQuotation(editModal.pengajuan.id, updatedData);
            alert('✅ Status pengajuan berhasil diupdate!');
            setEditModal({ show: false, pengajuan: null });
        } else {
            alert('❌ updateQuotation function not found');
        }
    };

    const handleCancelEdit = () => {
        setEditModal({ show: false, pengajuan: null });
        setEditFormData({
            bcDocumentNumber: '',
            bcSupportingDocuments: [],
            documentStatus: 'pengajuan',
            rejectionReason: '',
            rejectionDate: '',
            pic: ''
        });
    };

    const getFilteredBCCodes = () => {
        return bcCodes.filter(bc =>
            bc.isActive &&
            (formData.type === 'inbound' ? bc.category === 'inbound' : bc.category === 'outbound')
        );
    };

    const getCustomsStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Menunggu' },
            submitted: { color: 'bg-blue-500/20 text-blue-400', label: 'Diajukan' },
            approved: { color: 'bg-green-500/20 text-green-400', label: 'Disetujui' },
            rejected: { color: 'bg-red-500/20 text-red-400', label: 'Ditolak' },
            processing: { color: 'bg-purple-500/20 text-purple-400', label: 'Diproses' }
        };
        return badges[status] || badges.pending;
    };

    // Export to CSV handler
    const handleExportCSV = () => {
        const columns = [
            { key: 'quotationNumber', header: 'No. Pendaftaran' },
            { key: 'submissionDate', header: 'Tanggal' },
            { key: 'customer', header: 'Pelanggan' },
            { key: 'type', header: 'Tipe' },
            { key: 'bcDocType', header: 'Dokumen BC' },
            { key: 'itemCode', header: 'Kode Barang' },
            { key: 'bcDocumentNumber', header: 'No. Dokumen Pabean' },
            { key: 'bcDocumentDate', header: 'Tgl Approval' },
            { key: 'documentStatus', header: 'Status Dokumen' },
            { key: 'customsStatus', header: 'Status Bea Cukai' },
            { key: 'shipper', header: 'Pengirim' },
            { key: 'origin', header: 'Asal' },
            { key: 'destination', header: 'Tujuan' },
            { key: 'notes', header: 'Catatan' }
        ];

        exportToCSV(quotations, 'Pendaftaran_TPPB', columns);
    };

    // Debug logging
    console.log('🔍 PengajuanManagement render - quotations count:', quotations.length);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Manajemen Pendaftaran</h1>
                    <p className="text-silver-dark mt-1">Pendaftaran Layanan TPPB & Tracking Status Bea Cukai</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} icon={Plus}>
                    {showForm ? 'Batal' : 'Buat Pendaftaran Baru'}
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card p-6 rounded-lg space-y-6">
                    <h3 className="text-lg font-semibold text-silver-light">Pendaftaran Baru</h3>

                    {/* Submission Info */}
                    <div className="glass-card p-4 rounded-lg border-2 border-accent-blue bg-accent-blue/10">
                        <h4 className="text-sm font-semibold text-silver-light mb-3">📋 Informasi Pendaftaran</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    No. Pendaftaran
                                </label>
                                <input
                                    type="text"
                                    value="Auto-generated saat submit"
                                    disabled
                                    className="w-full bg-dark-surface/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    Tanggal Pendaftaran *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.submissionDate}
                                    onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    {formData.type === 'inbound' ? 'Tanggal Masuk Barang' : 'Tanggal Keluar Barang'}
                                    {formData.type === 'outbound' && <span className="text-red-400"> *</span>}
                                </label>
                                <input
                                    type="date"
                                    required={formData.type === 'outbound'}
                                    value={formData.itemDate}
                                    onChange={(e) => setFormData({ ...formData, itemDate: e.target.value })}
                                    className="w-full"
                                />
                                <p className="text-xs text-silver-dark mt-1">
                                    {formData.type === 'inbound'
                                        ? 'Tanggal barang masuk ke TPPB (opsional)'
                                        : 'Tanggal barang keluar dari TPPB (wajib untuk ekspor)'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Transaction Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Pelanggan *</label>
                            <select
                                required
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                className="w-full"
                            >
                                <option value="">-- Pilih Pelanggan --</option>
                                {customers.map(cust => (
                                    <option key={cust.id} value={cust.name}>
                                        {cust.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-silver-dark mt-1">
                                Pilih dari daftar customer yang sudah terdaftar
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Tipe *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full"
                            >
                                <option value="inbound">Masuk (Impor)</option>
                                <option value="outbound">Keluar (Ekspor)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Jenis Dokumen BC *</label>
                            <select
                                required
                                value={formData.bcDocType}
                                onChange={(e) => setFormData({ ...formData, bcDocType: e.target.value })}
                                className="w-full"
                            >
                                <option value="">-- Pilih Jenis Dokumen BC --</option>
                                {getFilteredBCCodes().map(bc => (
                                    <option key={bc.id} value={bc.code}>
                                        {bc.code} - {bc.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Kode Barang *</label>
                            <select
                                required
                                value={formData.itemCode}
                                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                                className="w-full"
                            >
                                <option value="">-- Pilih Kode Barang --</option>
                                {itemMaster.map(item => (
                                    <option key={item.id} value={item.itemCode}>
                                        {item.itemCode} - {item.itemType}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Shipper *</label>
                            <select
                                required
                                value={formData.shipper}
                                onChange={(e) => setFormData({ ...formData, shipper: e.target.value })}
                                className="w-full"
                            >
                                <option value="">-- Pilih Shipper --</option>
                                {vendors.map(vendor => (
                                    <option key={vendor.id} value={vendor.name}>
                                        {vendor.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Asal</label>
                            <input
                                type="text"
                                value={formData.origin}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                placeholder="Negara/Kota asal"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Tujuan</label>
                            <input
                                type="text"
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                placeholder="Negara/Kota tujuan"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* BL & Invoice Information */}
                    <div className="glass-card p-4 rounded-lg border-2 border-accent-green bg-accent-green/10">
                        <h4 className="text-sm font-semibold text-silver-light mb-3">📄 Informasi BL & Invoice</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">No. BL</label>
                                <input
                                    type="text"
                                    value={formData.blNumber}
                                    onChange={(e) => setFormData({ ...formData, blNumber: e.target.value })}
                                    placeholder="Bill of Lading Number"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">Tanggal BL</label>
                                <input
                                    type="date"
                                    value={formData.blDate}
                                    onChange={(e) => setFormData({ ...formData, blDate: e.target.value })}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">No. Invoice</label>
                                <input
                                    type="text"
                                    value={formData.invoiceNumber}
                                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                    placeholder="Invoice Number"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">Nilai Invoice</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.invoiceValue}
                                    onChange={(e) => setFormData({ ...formData, invoiceValue: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">Kurs</label>
                                <select
                                    value={formData.invoiceCurrency}
                                    onChange={(e) => setFormData({ ...formData, invoiceCurrency: e.target.value })}
                                    className="w-full"
                                >
                                    <option value="IDR">IDR - Rupiah</option>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="SGD">SGD - Singapore Dollar</option>
                                    <option value="JPY">JPY - Japanese Yen</option>
                                    <option value="CNY">CNY - Chinese Yuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">Rate Kurs</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={formData.exchangeRate}
                                    onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                                    placeholder="1.0000"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">Tanggal Rate Kurs</label>
                                <input
                                    type="date"
                                    value={formData.exchangeRateDate}
                                    onChange={(e) => setFormData({ ...formData, exchangeRateDate: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Package Management - Nested structure */}
                    <PackageManager
                        packages={formData.packages}
                        onChange={(packages) => setFormData({ ...formData, packages })}
                        itemMaster={itemMaster}
                    />

                    {/* Document Upload */}
                    <DocumentUploadManager
                        documents={formData.documents}
                        onChange={(docs) => setFormData({ ...formData, documents: docs })}
                        maxFiles={10}
                        maxSizeKB={200}
                    />

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">Catatan</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Catatan tambahan..."
                            rows={3}
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                            Batal
                        </Button>
                        <Button type="submit" icon={Plus}>
                            Buat Pendaftaran
                        </Button>
                    </div>
                </form>
            )}

            {/* Daftar Pengajuan - TABLE FORMAT */}
            <div className="glass-card p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-silver-light">Pendaftaran</h3>
                    <Button
                        onClick={handleExportCSV}
                        variant="secondary"
                        icon={Download}
                    >
                        Export CSV
                    </Button>
                </div>

                {quotations.length === 0 ? (
                    <div className="text-center py-8 text-silver-dark">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Belum ada pengajuan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-accent-blue">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">No. Pendaftaran</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Pelanggan</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tipe</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Dokumen BC</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Jumlah Barang</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">No. Dokumen Pabean</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tgl Approval</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status Dokumen</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status Bea Cukai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {quotations.map(quot => {
                                    const customsStatusBadge = getCustomsStatusBadge(quot.customsStatus || 'pending');
                                    const docStatus = quot.documentStatus || 'pengajuan';
                                    const docStatusBadge = {
                                        pengajuan: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pendaftaran' },
                                        approved: { color: 'bg-green-500/20 text-green-400', label: 'Approved' },
                                        rejected: { color: 'bg-red-500/20 text-red-400', label: 'Rejected' }
                                    }[docStatus] || { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pendaftaran' };

                                    return (
                                        <tr
                                            key={quot.id}
                                            onClick={() => handleEditPengajuan(quot)}
                                            className="hover:bg-dark-surface smooth-transition cursor-pointer"
                                        >
                                            <td className="px-4 py-3 text-sm text-silver-light font-medium">
                                                {quot.quotationNumber || quot.id}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-silver-dark">
                                                {new Date(quot.submissionDate || quot.date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-silver">
                                                {quot.customer}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-silver-dark">
                                                {quot.type === 'inbound' ? 'Masuk' : 'Keluar'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-silver">
                                                {quot.bcDocType || '-'}
                                            </td>

                                            {/* Jumlah Barang */}
                                            <td className="px-4 py-3 text-sm text-silver">
                                                {quot.packages
                                                    ? `${quot.packages.length} package (${quot.packages.reduce((sum, pkg) => sum + (pkg.items?.length || 0), 0)} item)`
                                                    : (quot.packageItems?.length || quot.items?.length || 0)
                                                }
                                            </td>

                                            {/* No. Dokumen Pabean */}
                                            <td className="px-4 py-3 text-sm text-accent-blue font-medium">
                                                {quot.bcDocumentNumber || '-'}
                                            </td>

                                            {/* Tanggal Approval */}
                                            <td className="px-4 py-3 text-sm text-silver">
                                                {quot.approvedDate ? new Date(quot.approvedDate).toLocaleDateString('id-ID') : '-'}
                                            </td>

                                            {/* Status Dokumen */}
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${docStatusBadge.color}`}>
                                                    {docStatusBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${customsStatusBadge.color}`}>
                                                    {customsStatusBadge.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="glass-card p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-silver-light mb-4">
                            Konfirmasi Pendaftaran
                        </h3>
                        <p className="text-silver mb-6">
                            Apakah Anda yakin ingin mengirim pengajuan ini ke Bea Cukai?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="secondary" onClick={handleCancelDialog}>
                                Batal
                            </Button>
                            <Button onClick={handleConfirmAction} icon={CheckCircle}>
                                Ya, Kirim
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Pengajuan Modal */}
            {editModal.show && editModal.pengajuan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="glass-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-dark-surface p-6 border-b border-dark-border z-10">
                            <h2 className="text-2xl font-bold gradient-text">Edit Status Pendaftaran</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Summary */}
                            <div className="glass-card p-4 rounded-lg bg-accent-blue/10">
                                <h3 className="text-sm font-semibold text-silver-light mb-3">📋 Ringkasan Pendaftaran</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-silver-dark">No. Pendaftaran</p>
                                        <p className="text-silver-light font-medium">{editModal.pengajuan.quotationNumber || editModal.pengajuan.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-silver-dark">Tanggal</p>
                                        <p className="text-silver-light">{new Date(editModal.pengajuan.submissionDate || editModal.pengajuan.date).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <div>
                                        <p className="text-silver-dark">Customer</p>
                                        <p className="text-silver-light font-medium">{editModal.pengajuan.customer}</p>
                                    </div>
                                    <div>
                                        <p className="text-silver-dark">BC Document</p>
                                        <p className="text-silver-light">{editModal.pengajuan.bcDocType}</p>
                                    </div>
                                    <div>
                                        <p className="text-silver-dark">Package</p>
                                        <p className="text-silver-light">{editModal.pengajuan.packages?.length || 0} package</p>
                                    </div>
                                    <div>
                                        <p className="text-silver-dark">Total Items</p>
                                        <p className="text-silver-light">
                                            {editModal.pengajuan.packages?.reduce((sum, pkg) => sum + (pkg.items?.length || 0), 0) || 0} item
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* BC Document Number */}
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    No. Dokumen Pabean {editFormData.documentStatus === 'approved' && <span className="text-red-400">*</span>}
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.bcDocumentNumber}
                                    onChange={(e) => setEditFormData({ ...editFormData, bcDocumentNumber: e.target.value })}
                                    placeholder="contoh: BC2.3-2025-001"
                                    className="w-full"
                                />
                            </div>

                            {/* BC Document Date */}
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    Tanggal Dokumen Pabean
                                </label>
                                <input
                                    type="date"
                                    value={editFormData.bcDocumentDate}
                                    onChange={(e) => setEditFormData({ ...editFormData, bcDocumentDate: e.target.value })}
                                    className="w-full"
                                />
                            </div>

                            {/* BC Supporting Documents */}
                            <DocumentUploadManager
                                documents={editFormData.bcSupportingDocuments}
                                onChange={(docs) => setEditFormData({ ...editFormData, bcSupportingDocuments: docs })}
                                maxFiles={10}
                                maxSizeKB={200}
                                label="Dokumen Pendukung Pabean"
                            />

                            {/* Status Selection */}
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    Status Dokumen *
                                </label>
                                <select
                                    value={editFormData.documentStatus}
                                    onChange={(e) => setEditFormData({ ...editFormData, documentStatus: e.target.value })}
                                    className="w-full"
                                >
                                    <option value="pengajuan">Pendaftaran</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                {editFormData.documentStatus === 'approved' && (
                                    <p className="text-xs text-green-400 mt-2">
                                        ✅ Approved akan otomatis membuat inventory di gudang
                                    </p>
                                )}
                            </div>

                            {/* PIC Field */}
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    PIC (Person In Charge)
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.pic}
                                    onChange={(e) => setEditFormData({ ...editFormData, pic: e.target.value })}
                                    placeholder="Nama PIC yang menangani pendaftaran"
                                    className="w-full"
                                />
                            </div>

                            {/* Rejection Reason (Conditional) */}
                            {editFormData.documentStatus === 'rejected' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-silver mb-2">
                                            Tanggal Reject *
                                        </label>
                                        <input
                                            type="date"
                                            value={editFormData.rejectionDate}
                                            onChange={(e) => setEditFormData({ ...editFormData, rejectionDate: e.target.value })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-silver mb-2">
                                            Keterangan Penolakan *
                                        </label>
                                        <textarea
                                            value={editFormData.rejectionReason}
                                            onChange={(e) => setEditFormData({ ...editFormData, rejectionReason: e.target.value })}
                                            placeholder="Jelaskan alasan penolakan..."
                                            rows={3}
                                            className="w-full"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
                                <Button variant="secondary" onClick={handleCancelEdit}>
                                    Batal
                                </Button>
                                <Button onClick={handleSaveEdit} icon={CheckCircle}>
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PengajuanManagement;
