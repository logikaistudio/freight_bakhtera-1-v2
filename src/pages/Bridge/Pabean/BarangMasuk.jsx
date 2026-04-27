import React, { useState } from 'react';
import { ArrowDownCircle, Search, Eye, Package, Download, FileSpreadsheet } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import Button from '../../../components/Common/Button';
import { formatCurrency, getCurrencySymbol } from '../../../utils/currencyFormatter';
import { exportToCSV } from '../../../utils/exportCSV';
import { exportToXLS } from '../../../utils/exportXLS';

const BarangMasuk = () => {
    const { inboundTransactions = [], companySettings, bridgeSettings } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Filter Transactions
    const filteredTransactions = inboundTransactions.filter(t => {
        const docDate = new Date(t.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (end) end.setHours(23, 59, 59, 999);

        const matchesDate = (!start || docDate >= start) && (!end || docDate <= end);
        const matchesSearch = (
            (t.pengajuanNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.customsDocNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.sender || t.supplier || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        return matchesDate && matchesSearch;
    });

    // Helper: Calculate Total Value
    const getTransactionTotal = (t) => {
        // Jika ada invoiceValue di transaksi, gunakan itu sebagai total
        if (t.invoiceValue) return Number(t.invoiceValue);
        return (t.items || []).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    };

    // Helper: Calculate Total Qty
    const getTransactionQty = (t) => {
        return (t.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    };

    // Export Main Table to XLS
    const handleExportXLS = () => {
        const headerRows = [
            { value: bridgeSettings?.company_name || companySettings?.company_name || 'PT. BAKHTERA FREIGHT WORLDWIDE', style: 'company' },
            { value: bridgeSettings?.company_address || companySettings?.company_address || 'Jl. Contoh No. 123, Jakarta', style: 'normal' },
            { value: `NPWP: ${bridgeSettings?.company_npwp || companySettings?.company_npwp || '-'}`, style: 'normal' },
            { value: '', style: 'normal' },
            { value: 'DATA BARANG MASUK (INBOUND)', style: 'title' }
        ];

        const xlsColumns = [
            { header: 'No', key: 'no', width: 5, align: 'center' },
            { header: 'No. Bukti Penerimaan', key: 'receiptNumber', width: 22 },
            { header: 'Tgl Bukti Penerimaan', key: 'receiptDateStr', width: 18, align: 'center' },
            { header: 'No. Pengajuan', key: 'pengajuanNumber', width: 20 },
            { header: 'Jenis Dok', key: 'customsDocType', width: 10, align: 'center' },
            { header: 'No. Pabean', key: 'customsDocNumber', width: 20 },
            { header: 'Tgl Dokumen Pabean', key: 'customsDocDate', width: 16, align: 'center' },
            { header: 'Nama Pemilik', key: 'ownerName', width: 28 },
            { header: 'Pengirim', key: 'sender', width: 25 },
            { header: 'Kode Barang', key: 'itemCodeSummary', width: 18 },
            { header: 'Nama Barang (Item)', key: 'itemSummary', width: 40 },
            { header: 'Satuan', key: 'unitSummary', width: 12 },
            { header: 'Jml Item', key: 'itemCount', width: 10, align: 'center' },
            { header: 'Total Nilai', key: 'totalValue', width: 15, align: 'right' }
        ];

        const data = filteredTransactions.map((t, idx) => ({
            ...t,
            no: idx + 1,
            receiptDateStr: t.receiptDate ? new Date(t.receiptDate).toLocaleDateString('id-ID') : (t.date ? new Date(t.date).toLocaleDateString('id-ID') : '-'),
            customsDocDate: t.customsDocDate ? new Date(t.customsDocDate).toLocaleDateString('id-ID') : '-',
            ownerName: t.customer || t.sender || '-',
            itemCodeSummary: (t.items || []).map(i => i.itemCode || '-').join('; ') || (t.itemCode || '-'),
            itemSummary: (t.items || []).map(i => i.assetName || i.goodsType || i.itemName || '-').join('; ') || (t.assetName || '-'),
            unitSummary: (t.items || []).map(i => i.unit || '-').join('; ') || (t.unit || '-'),
            itemCount: t.items ? t.items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) : (Number(t.quantity) || 0),
            currency: t.invoiceCurrency || t.currency || 'IDR',
            totalValue: formatCurrency(getTransactionTotal(t))
        }));

        exportToXLS(data, 'Laporan_Barang_Masuk', headerRows, xlsColumns);
    };

    // Export Main Table to CSV
    const handleExportCSV = () => {
        const columns = [
            { key: 'pengajuanNumber', header: 'No. Pengajuan' },
            { key: 'customsDocType', header: 'Jenis Dok' },
            { key: 'customsDocNumber', header: 'No. Pabean' },
            { key: 'date', header: 'Tgl Masuk' },
            { key: 'sender', header: 'Pengirim' },
            { key: 'itemSummary', header: 'Uraian Barang (Item)' },
            { key: 'itemNominalSummary', header: 'Nominal Satuan' },
            { key: 'kurs', header: 'Kurs Pengajuan' },
            { key: 'currency', header: 'Mata Uang' },
            { key: 'totalItems', header: 'Jml Item' },
            { key: 'totalValue', header: 'Total Nilai' }
        ];

        const data = filteredTransactions.map(t => ({
            ...t,
            date: new Date(t.date).toLocaleDateString('id-ID'),
            itemSummary: (t.items || []).map(i => i.assetName || i.goodsType || i.itemName || '-').join('; ') || '-',
            itemNominalSummary: (t.items || []).map(i => formatCurrency(i.price || (i.quantity ? i.value / i.quantity : 0))).join('; ') || '-',
            totalItems: t.items ? t.items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) : 0,
            kurs: t.kurs ? Number(t.kurs).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '-',
            currency: t.invoiceCurrency || t.currency || 'IDR',
            totalValue: getTransactionTotal(t)
        }));

        exportToCSV(data, 'Barang_Masuk', columns);
    };

    // Export Detail Modal to XLS
    const handleModalExportXLS = () => {
        if (!selectedTransaction) return;

        const headerRows = [
            { value: bridgeSettings?.company_name || companySettings?.company_name || 'PT. BAKHTERA FREIGHT WORLDWIDE', style: 'company' },
            { value: bridgeSettings?.company_address || companySettings?.company_address || 'Jl. Contoh No. 123, Jakarta', style: 'normal' },
            { value: `NPWP: ${bridgeSettings?.company_npwp || companySettings?.company_npwp || '-'}`, style: 'normal' },
            { value: '', style: 'normal' },
            { value: `DETAIL PENGAJUAN: ${selectedTransaction.pengajuanNumber}`, style: 'title' },
            { value: `No Pabean: ${selectedTransaction.customsDocNumber} | Tgl: ${selectedTransaction.customsDocDate ? new Date(selectedTransaction.customsDocDate).toLocaleDateString() : '-'}`, style: 'normal' }
        ];

        const xlsColumns = [
            { header: 'HS', key: 'hsCode', width: 15 },
            { header: 'ITEM', key: 'assetName', width: 30 },
            { header: 'JML', key: 'quantity', width: 8, align: 'center', render: (i) => Number(i.quantity) || 0 },
            { header: 'SAT', key: 'unit', width: 8, align: 'center' },
            { header: 'NOMINAL', key: 'nominal', width: 15, align: 'right', render: (i) => formatCurrency(i.price || (i.quantity ? i.value / i.quantity : 0)) },
            { header: 'TOTAL', key: 'value', width: 15, align: 'right', render: (i) => formatCurrency(i.value) },
            { header: 'KURS', key: 'currency', width: 8, align: 'center' }
        ];

        // Inject currency info to each item
        const itemsWithCurrency = getSyncedItems(selectedTransaction).map(i => ({ ...i, currency: selectedTransaction.invoiceCurrency || selectedTransaction.currency || 'IDR' }));
        exportToXLS(itemsWithCurrency, `Detail_${selectedTransaction.pengajuanNumber}`, headerRows, xlsColumns);
    };

    // Export Detail Modal to CSV
    const handleModalExportCSV = () => {
        if (!selectedTransaction) return;

        const columns = [
            { key: 'hsCode', header: 'HS' },
            { key: 'assetName', header: 'ITEM' },
            { key: 'quantity', header: 'JML' },
            { key: 'unit', header: 'SAT' },
            { key: 'nominal', header: 'NOMINAL' },
            { key: 'value', header: 'TOTAL' },
            { key: 'currency', header: 'KURS' }
        ];
        const itemsWithCurrency = getSyncedItems(selectedTransaction).map(i => ({ 
            ...i, 
            currency: selectedTransaction.invoiceCurrency || selectedTransaction.currency || 'IDR',
            nominal: i.price || (i.quantity ? i.value / i.quantity : 0)
        }));
        exportToCSV(itemsWithCurrency, `Detail_${selectedTransaction.pengajuanNumber}`, columns);
    };

    // Helper: Sinkronisasi nilai item dan kurs dari pengajuan
    const getSyncedItems = (t) => {
        // Jika ada invoiceValue, bagi rata ke semua item (atau gunakan logic lain sesuai kebutuhan)
        if (t.invoiceValue && t.items && t.items.length > 0) {
            const perItemValue = Number(t.invoiceValue) / t.items.length;
            return t.items.map(item => ({
                ...item,
                value: perItemValue,
                currency: t.invoiceCurrency || t.currency || 'IDR',
            }));
        }
        // Jika tidak, tetap gunakan value asli
        return (t.items || []).map(item => ({
            ...item,
            currency: t.invoiceCurrency || t.currency || 'IDR',
        }));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold gradient-text">Barang Masuk</h1>
                <p className="text-silver-dark mt-1">Daftar Pengajuan Barang Masuk (Per Dokumen)</p>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2 glass-card p-4 rounded-lg flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-silver-dark" />
                        <input
                            type="text"
                            placeholder="Cari No Pengajuan, No BC, atau Pengirim..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:border-accent-blue focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:border-accent-blue focus:outline-none text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:border-accent-blue focus:outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>
                <div className="glass-card p-4 rounded-lg border border-accent-blue">
                    <p className="text-xs text-silver-dark">Total Pengajuan</p>
                    <p className="text-2xl font-bold text-accent-blue">{filteredTransactions.length}</p>
                </div>
                <div className="glass-card p-4 rounded-lg border border-orange-500">
                    <p className="text-xs text-silver-dark">Barang Masuk</p>
                    <p className="text-2xl font-bold text-orange-500">
                        {filteredTransactions.reduce((sum, t) => sum + getTransactionQty(t), 0)}
                    </p>
                </div>
                <div className="glass-card p-4 rounded-lg border border-accent-green">
                    <p className="text-xs text-silver-dark">Total Nilai</p>
                    <p className="text-xl font-bold text-accent-green">
                        {formatCurrency(filteredTransactions.reduce((sum, t) => sum + getTransactionTotal(t), 0))}
                    </p>
                </div>
            </div>

            {/* Main Table - By Transaction */}
            <div className="glass-card rounded-lg overflow-hidden">
                <div className="p-4 border-b border-dark-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ArrowDownCircle className="w-5 h-5 text-accent-blue" />
                        <h2 className="text-lg font-semibold text-silver-light">Daftar Dokumen Masuk</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleExportXLS} variant="success" icon={FileSpreadsheet} className="!py-1.5 !px-3 !text-xs">XLS</Button>
                        <Button onClick={handleExportCSV} variant="secondary" icon={Download} className="!py-1.5 !px-3 !text-xs">CSV</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-accent-blue/10">
                            <tr>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-silver uppercase tracking-wider w-10">No</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-silver uppercase tracking-wider">No. Bukti Penerimaan</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-silver uppercase tracking-wider">Tgl Bukti Penerimaan</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-silver uppercase tracking-wider">Nama Pemilik</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-silver uppercase tracking-wider">No. Pengajuan</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-silver uppercase tracking-wider">Jenis Dok</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-silver uppercase tracking-wider">No. Pabean</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-silver uppercase tracking-wider">Tgl Pabean</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-silver uppercase tracking-wider">Pengirim</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-silver uppercase tracking-wider">Kode Barang</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-silver uppercase tracking-wider">Nama Barang (Item)</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-silver uppercase tracking-wider">Satuan</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-silver uppercase tracking-wider">Jml</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-silver uppercase tracking-wider">Total Nilai</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-silver uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="15" className="px-4 py-12 text-center text-silver-dark">
                                        Tidak ada data yang ditemukan
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t, idx) => {
                                    const itemCodes = (t.items && t.items.length > 0)
                                        ? [...new Set(t.items.map(i => i.itemCode || t.itemCode).filter(Boolean))]
                                        : [t.itemCode].filter(Boolean);
                                    const itemNames = (t.items && t.items.length > 0)
                                        ? t.items.map(i => i.assetName || i.goodsType || i.itemName || t.assetName || '-')
                                        : [t.assetName || '-'];
                                    const itemUnits = (t.items && t.items.length > 0)
                                        ? [...new Set(t.items.map(i => i.unit || t.unit).filter(Boolean))]
                                        : [t.unit].filter(Boolean);
                                    const totalQty = t.items
                                        ? t.items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
                                        : (Number(t.quantity) || 0);
                                    const ownerName = t.customer || t.sender || '-';
                                    const receiptDateStr = t.receiptDate || t.date;

                                    return (
                                        <tr key={idx} className="hover:bg-dark-surface/50 transition-colors">
                                            <td className="px-3 py-2.5 text-center text-silver-dark">{idx + 1}</td>
                                            <td className="px-3 py-2.5 text-accent-blue font-mono font-medium">{t.receiptNumber || t.pengajuanNumber || '-'}</td>
                                            <td className="px-3 py-2.5 text-center text-silver">
                                                {receiptDateStr ? new Date(receiptDateStr).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            <td className="px-3 py-2.5 text-silver font-medium">{ownerName}</td>
                                            <td className="px-3 py-2.5 text-silver-dark font-mono">{t.pengajuanNumber || '-'}</td>
                                            <td className="px-3 py-2.5 text-silver">{t.customsDocType || 'BC 2.3'}</td>
                                            <td className="px-3 py-2.5 text-silver font-mono">{t.customsDocNumber || '-'}</td>
                                            <td className="px-3 py-2.5 text-center text-silver">
                                                {t.customsDocDate ? new Date(t.customsDocDate).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            <td className="px-3 py-2.5 text-silver">{t.sender || '-'}</td>
                                            <td className="px-3 py-2.5 text-silver font-mono">
                                                {itemCodes.length > 0 ? (
                                                    <div className="space-y-0.5">
                                                        {itemCodes.slice(0, 2).map((c, i) => <div key={i} className="truncate max-w-[100px]">{c}</div>)}
                                                        {itemCodes.length > 2 && <div className="text-accent-blue/70 italic">+{itemCodes.length - 2}</div>}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-3 py-2.5 text-silver max-w-[180px]">
                                                <div className="space-y-0.5">
                                                    {itemNames.slice(0, 3).map((name, i) => (
                                                        <div key={i} className="flex items-center gap-1 truncate">
                                                            <span className="w-1 h-1 rounded-full bg-accent-blue/60 flex-shrink-0"></span>
                                                            <span className="truncate">{name}</span>
                                                        </div>
                                                    ))}
                                                    {itemNames.length > 3 && <span className="text-accent-blue/70 italic">+{itemNames.length - 3} lainnya</span>}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-silver">{itemUnits.join(', ') || '-'}</td>
                                            <td className="px-3 py-2.5 text-center font-bold text-white">{totalQty}</td>
                                            <td className="px-3 py-2.5 text-right text-accent-green font-medium">
                                                {getTransactionTotal(t) ? Number(getTransactionTotal(t)).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '-'}
                                            </td>
                                            <td className="px-3 py-2.5 text-center">
                                                <button
                                                    onClick={() => setSelectedTransaction(t)}
                                                    className="p-1.5 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal - Clean White Style */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-dark-card rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 dark:border-dark-border flex justify-between items-start bg-white dark:bg-dark-card">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Detail Inventaris</h3>
                                <p className="text-sm text-gray-500 dark:text-silver-dark mt-1">{selectedTransaction.pengajuanNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleModalExportXLS} variant="success" icon={FileSpreadsheet} className="text-xs">XLS</Button>
                                <Button onClick={handleModalExportCSV} variant="secondary" icon={Download} className="text-xs">CSV</Button>
                                <button onClick={() => setSelectedTransaction(null)} className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors">
                                    <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
                                </button>
                            </div>
                        </div>

                        {/* Data Info Card */}
                        <div className="p-5 pb-0">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-silver-light mb-3">
                                <Package className="w-4 h-4" /> Data Inventaris
                            </h4>
                            <div className="bg-accent-blue text-white rounded-t-lg px-4 py-3 grid grid-cols-7 gap-4 text-xs font-semibold">
                                <span className="col-span-2">NO. PENGAJUAN</span>
                                <span>NO. PABEAN</span>
                                <span>TGL DOKUMEN</span>
                                <span>TGL DITERIMA</span>
                                <span className="text-center">JML ITEM</span>
                                <span>PENGIRIM</span>
                            </div>
                            <div className="bg-white dark:bg-dark-surface border border-t-0 border-gray-200 dark:border-dark-border rounded-b-lg px-4 py-3 grid grid-cols-7 gap-4 text-xs items-center text-gray-600 dark:text-silver">
                                <span className="col-span-2 font-medium text-accent-blue">{selectedTransaction.pengajuanNumber}</span>
                                <span>{selectedTransaction.customsDocNumber}</span>
                                <span>{selectedTransaction.customsDocDate ? new Date(selectedTransaction.customsDocDate).toLocaleDateString('id-ID') : '-'}</span>
                                <span>{new Date(selectedTransaction.date).toLocaleDateString('id-ID')}</span>
                                <span className="text-center font-bold">{selectedTransaction.items ? selectedTransaction.items.length : 0}</span>
                                <span className="truncate">{selectedTransaction.sender || selectedTransaction.supplier || '-'}</span>
                            </div>
                        </div>

                        {/* Detail Items Table */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-silver-light mb-3">
                                📝 Detail Item
                            </h4>
                            <div className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-accent-blue text-white">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold">HS</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold">ITEM</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold">JML</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold">SAT</th>
                                            <th className="px-4 py-2 text-right text-xs font-semibold">NOMINAL</th>
                                            <th className="px-4 py-2 text-right text-xs font-semibold">TOTAL</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold">KURS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-dark-border bg-white dark:bg-dark-surface">
                                        {getSyncedItems(selectedTransaction).map((item, idx) => {
                                            const nominal = item.price || (item.quantity ? item.value / item.quantity : 0);
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-silver font-mono">{item.hsCode || '-'}</td>
                                                    <td className="px-4 py-2.5 text-xs text-gray-800 dark:text-silver-light">{item.assetName || item.itemName}</td>
                                                    <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-800 dark:text-white">{item.quantity}</td>
                                                    <td className="px-4 py-2.5 text-center text-xs text-gray-600 dark:text-silver">{item.unit || 'pcs'}</td>
                                                    <td className="px-4 py-2.5 text-right text-xs text-gray-800 dark:text-white">
                                                        {formatCurrency(nominal)}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right text-xs text-gray-800 dark:text-white font-medium">
                                                        {formatCurrency(item.value)}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center text-xs text-gray-600 dark:text-silver">{item.currency || 'IDR'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-dark-border">
                                        <tr>
                                            <td colSpan="5" className="px-4 py-2 text-right text-xs font-bold text-gray-700 dark:text-silver">GRAND TOTAL:</td>
                                            <td className="px-4 py-2 text-right text-xs font-bold text-accent-green">
                                                {formatCurrency(getTransactionTotal(selectedTransaction))}
                                            </td>
                                            <td className="px-4 py-2 text-center text-xs font-bold text-accent-green">{selectedTransaction.currency || 'IDR'}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="p-5 border-t border-gray-100 dark:border-dark-border">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-silver-light mb-3">
                                📑 Dokumen Pendukung
                            </h4>
                            {[...(selectedTransaction.documents || []), ...(selectedTransaction.bcSupportingDocuments || [])].length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-silver-dark">Tidak ada dokumen pendukung.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {[...(selectedTransaction.documents || []), ...(selectedTransaction.bcSupportingDocuments || [])].map((doc, idx) => (
                                        <div key={idx} className="border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface rounded-lg p-3 hover:shadow-md transition-shadow">
                                            {doc.type && doc.type.startsWith('image/') ? (
                                                <div className="aspect-video bg-white dark:bg-dark-card rounded mb-2 overflow-hidden flex items-center justify-center border border-gray-100 dark:border-dark-border">
                                                    <img 
                                                        src={doc.data || doc.url} 
                                                        alt={doc.title || doc.name || doc.fileName} 
                                                        className="object-contain w-full h-full cursor-pointer hover:scale-105 transition-transform"
                                                        onClick={() => {
                                                            const win = window.open();
                                                            win.document.write(`<iframe src="${doc.data || doc.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-video bg-white dark:bg-dark-card rounded mb-2 flex flex-col items-center justify-center cursor-pointer border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface/80"
                                                    onClick={() => {
                                                        const win = window.open();
                                                        win.document.write(`<iframe src="${doc.data || doc.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                                    }}
                                                >
                                                    <div className="w-10 h-10 text-gray-400 dark:text-silver-dark border-2 border-gray-200 dark:border-dark-border rounded-lg flex items-center justify-center mb-1 bg-gray-50 dark:bg-dark-surface">
                                                        <span className="text-[10px] font-bold uppercase">{doc.type ? doc.type.split('/')[1] : 'PDF'}</span>
                                                    </div>
                                                    <span className="text-[10px] text-accent-blue text-center px-2 underline">Buka Dokumen</span>
                                                </div>
                                            )}
                                            <div className="text-sm font-medium text-gray-800 dark:text-silver-light truncate" title={doc.title || doc.name || doc.fileName}>{doc.title || doc.name || doc.fileName || `Dokumen ${idx + 1}`}</div>
                                            <div className="text-xs text-gray-500 dark:text-silver-dark truncate">Tgl: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('id-ID') : '-'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface/50 flex justify-end">
                            <Button variant="secondary" onClick={() => setSelectedTransaction(null)}>Tutup</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarangMasuk;
