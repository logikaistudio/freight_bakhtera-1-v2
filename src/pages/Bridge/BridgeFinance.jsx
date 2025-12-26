import React, { useState } from 'react';
import { DollarSign, FileText, TrendingUp, TrendingDown, Plus, Edit, Check, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Button from '../../components/Common/Button';
import LineItemManager from '../../components/Common/LineItemManager';
import ServiceBreakdown from '../../components/Common/ServiceBreakdown';
import CustomCostsManager from '../../components/Common/CustomCostsManager';
import QuotationSummary from '../../components/Common/QuotationSummary';
import POFormModal from '../../components/Finance/POFormModal';
import { formatCurrency } from '../../utils/currencyFormatter';

const BridgeFinance = () => {
    const {
        invoices = [],
        purchases = [],
        purchaseOrders = [],
        customers = [],
        vendors = [],
        customsDocuments = [],
        quotations = [],
        addInvoice,
        updateInvoice,
        addPurchase,
        updatePurchase,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        getApprovedPengajuan,
        getActiveCustomers,
        getActiveVendors
    } = useData();

    const [activeTab, setActiveTab] = useState('invoices');
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [showPurchaseForm, setShowPurchaseForm] = useState(false);
    const [showPOForm, setShowPOForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [editingPurchase, setEditingPurchase] = useState(null);

    // Calculate summary
    const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const paidInvoices = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const unpaidInvoices = totalInvoices - paidInvoices;

    const totalPurchases = purchases.reduce((sum, pur) => sum + (pur.grandTotal || 0), 0);
    const paidPurchases = purchases
        .filter(pur => pur.status === 'paid')
        .reduce((sum, pur) => sum + (pur.grandTotal || 0), 0);
    const unpaidPurchases = totalPurchases - paidPurchases;

    const handleMarkAsPaid = (type, id) => {
        if (window.confirm('Tandai sebagai terbayar?')) {
            const updates = {
                status: 'paid',
                paidDate: new Date().toISOString().split('T')[0],
                paidAmount: type === 'invoice'
                    ? invoices.find(inv => inv.id === id)?.grandTotal
                    : purchases.find(pur => pur.id === id)?.grandTotal
            };

            if (type === 'invoice') {
                updateInvoice(id, updates);
            } else {
                updatePurchase(id, updates);
            }
        }
    };

    const handleAddInvoice = () => {
        setEditingInvoice(null);
        setShowInvoiceForm(true);
    };

    const handleAddPurchase = () => {
        setEditingPurchase(null);
        setShowPurchaseForm(true);
    };

    // Debug logging
    console.log('🔍 BridgeFinance render - invoices:', invoices);
    console.log('🔍 Invoices count:', invoices.length);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold gradient-text">Bridge Finance</h1>
                <p className="text-silver-dark mt-1">
                    Invoice & Purchase Management untuk Bridge TPPB
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <SummaryCard
                    title="Total Invoice"
                    value={totalInvoices}
                    icon={FileText}
                    color="blue"
                />
                <SummaryCard
                    title="Invoice Terbayar"
                    value={paidInvoices}
                    icon={TrendingUp}
                    color="green"
                />
                <SummaryCard
                    title="Invoice Belum Bayar"
                    value={unpaidInvoices}
                    icon={TrendingDown}
                    color="orange"
                />
                <SummaryCard
                    title="Total Pengeluaran"
                    value={totalPurchases}
                    icon={DollarSign}
                    color="red"
                />
                <SummaryCard
                    title="Pengeluaran Terbayar"
                    value={paidPurchases}
                    icon={TrendingUp}
                    color="green"
                />
                <SummaryCard
                    title="Pengeluaran Belum Bayar"
                    value={unpaidPurchases}
                    icon={TrendingDown}
                    color="orange"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 items-center">
                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`px-4 py-2 rounded-lg font-medium smooth-transition ${activeTab === 'invoices'
                        ? 'bg-accent-blue text-white'
                        : 'bg-dark-surface text-silver-dark hover:text-silver'
                        }`}
                >
                    Invoices ({invoices.length})
                </button>
                <button
                    onClick={() => setActiveTab('purchases')}
                    className={`px-4 py-2 rounded-lg font-medium smooth-transition ${activeTab === 'purchases'
                        ? 'bg-accent-blue text-white'
                        : 'bg-dark-surface text-silver-dark hover:text-silver'
                        }`}
                >
                    Purchases ({purchases.length})
                </button>
                <button
                    onClick={() => setActiveTab('pos')}
                    className={`px-4 py-2 rounded-lg font-medium smooth-transition ${activeTab === 'pos'
                        ? 'bg-accent-purple text-white'
                        : 'bg-dark-surface text-silver-dark hover:text-silver'
                        }`}
                >
                    Purchase Orders ({purchaseOrders.length})
                </button>

                {activeTab === 'invoices' ? (
                    <Button onClick={handleAddInvoice} icon={Plus} size="sm" className="ml-auto">
                        Buat Invoice
                    </Button>
                ) : activeTab === 'purchases' ? (
                    <Button onClick={handleAddPurchase} icon={Plus} size="sm" className="ml-auto">
                        Buat Purchase
                    </Button>
                ) : (
                    <Button onClick={() => setShowPOForm(true)} icon={Plus} size="sm" className="ml-auto">
                        Buat PO
                    </Button>
                )}
            </div>

            {/* Content */}
            <div className="glass-card p-6 rounded-lg">
                {activeTab === 'invoices' ? (
                    <>
                        <h3 className="text-xl font-semibold text-silver-light mb-4">
                            Daftar Invoice
                        </h3>

                        {invoices.length === 0 ? (
                            <div className="text-center py-8 text-silver-dark">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Belum ada invoice. Klik "Buat Invoice" untuk memulai.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-accent-blue">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">No. Invoice</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Ref. Pendaftaran</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Customer</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tanggal</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Judul</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Nilai</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-border">
                                        {invoices.map(invoice => (
                                            <tr key={invoice.id} className="hover:bg-dark-surface smooth-transition">
                                                <td className="px-4 py-3 text-sm text-silver-light font-medium">
                                                    {invoice.invoiceNumber}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-silver">
                                                    {invoice.pengajuanNumber ? (
                                                        <span className="text-accent-blue">{invoice.pengajuanNumber}</span>
                                                    ) : (
                                                        <span className="text-silver-dark">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-silver">
                                                    {invoice.customerName || invoice.customer || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-silver-dark">
                                                    {new Date(invoice.date).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-silver">
                                                    {invoice.title}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-accent-green font-semibold">
                                                    Rp {formatCurrency(invoice.grandTotal)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                        invoice.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {invoice.status !== 'paid' && (
                                                            <button
                                                                onClick={() => handleMarkAsPaid('invoice', invoice.id)}
                                                                className="p-1 hover:bg-green-500 hover:bg-opacity-20 rounded smooth-transition"
                                                                title="Tandai Terbayar"
                                                            >
                                                                <Check className="w-4 h-4 text-green-400" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : activeTab === 'purchases' ? (
                    <>
                        <h3 className="text-xl font-semibold text-silver-light mb-4">
                            Daftar Purchase/Pembayaran
                        </h3>

                        {purchases.length === 0 ? (
                            <div className="text-center py-8 text-silver-dark">
                                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Belum ada purchase. Klik "Buat Purchase" untuk memulai.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-accent-orange">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">No. Dokumen</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tanggal</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Vendor</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Judul</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Jumlah</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-border">
                                        {purchases.map(purchase => (
                                            <tr key={purchase.id} className="hover:bg-dark-surface smooth-transition">
                                                <td className="px-4 py-3 text-sm text-silver-light font-medium">
                                                    {purchase.documentNumber}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-silver-dark">
                                                    {new Date(purchase.date).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-silver">
                                                    {purchase.vendor}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-silver">
                                                    {purchase.title}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-accent-red font-semibold">
                                                    Rp {formatCurrency(purchase.grandTotal)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${purchase.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                        purchase.status === 'pending_approval' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {purchase.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {purchase.status !== 'paid' && (
                                                            <button
                                                                onClick={() => handleMarkAsPaid('purchase', purchase.id)}
                                                                className="p-1 hover:bg-green-500 hover:bg-opacity-20 rounded smooth-transition"
                                                                title="Tandai Terbayar"
                                                            >
                                                                <Check className="w-4 h-4 text-green-400" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : activeTab === 'pos' ? (
                    <>
                        <h3 className="text-xl font-semibold text-silver-light mb-4">
                            Daftar Purchase Orders
                        </h3>

                        {purchaseOrders.length === 0 ? (
                            <div className="text-center py-8 text-silver-dark">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Belum ada Purchase Order. Klik "Buat PO" untuk memulai.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-accent-purple">
                                        <tr>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-white">No</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">No. PO</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tanggal</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Vendor</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Judul</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-white">Nilai PO</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-border">
                                        {purchaseOrders.map((po, index) => {
                                            const statusColors = {
                                                draft: 'bg-yellow-500/20 text-yellow-400',
                                                sent: 'bg-blue-500/20 text-blue-400',
                                                approved: 'bg-green-500/20 text-green-400',
                                                received: 'bg-emerald-500/20 text-emerald-400',
                                                cancelled: 'bg-red-500/20 text-red-400'
                                            };

                                            return (
                                                <tr key={po.id} className="hover:bg-dark-surface smooth-transition">
                                                    <td className="px-4 py-3 text-sm text-center text-silver-dark font-medium">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-silver-light font-medium">
                                                        {po.poNumber}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-silver-dark">
                                                        {new Date(po.poDate).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-silver">
                                                        {po.vendorName}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-silver">
                                                        {po.title}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-accent-purple font-semibold">
                                                        Rp {formatCurrency(po.subtotalAfterDiscount || po.itemsSubtotal || 0)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[po.status] || statusColors.draft}`}>
                                                            {po.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : null}
            </div>

            {/* Invoice Form Modal */}
            {showInvoiceForm && (
                <InvoiceFormModal
                    onClose={() => setShowInvoiceForm(false)}
                    onSubmit={addInvoice}
                    customers={customers}
                    customsDocuments={customsDocuments}
                />
            )}

            {/* Purchase Form Modal */}
            {showPurchaseForm && (
                <PurchaseFormModal
                    onClose={() => setShowPurchaseForm(false)}
                    onSubmit={addPurchase}
                    vendors={vendors}
                />
            )}

            {/* Purchase Order Form Modal */}
            {showPOForm && (
                <POFormModal
                    onClose={() => setShowPOForm(false)}
                    onSubmit={addPurchaseOrder}
                    vendors={vendors}
                />
            )}
        </div>
    );
};

// Summary Card Component
const SummaryCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
        green: 'from-green-500/20 to-green-600/20 border-green-500/30',
        orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
        red: 'from-red-500/20 to-red-600/20 border-red-500/30'
    };

    const iconColors = {
        blue: 'text-blue-400',
        green: 'text-green-400',
        orange: 'text-orange-400',
        red: 'text-red-400'
    };

    return (
        <div className={`glass-card p-4 rounded-lg border bg-gradient-to-br ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-silver-dark uppercase">{title}</span>
                <Icon className={`w-5 h-5 ${iconColors[color]}`} />
            </div>
            <p className="text-xl font-bold text-silver-light">
                Rp {formatCurrency(value)}
            </p>
        </div>
    );
};

// Invoice Form Modal Component
const InvoiceFormModal = ({ onClose, onSubmit, customers, customsDocuments }) => {
    const { quotations = [] } = useData();

    // Filter only approved quotations
    const approvedQuotations = quotations.filter(q => q.status === 'approved');

    const [formData, setFormData] = useState({
        quotationId: '',
        customer: '',
        date: new Date().toISOString().split('T')[0],
        bcDocument: '',
        title: '',
        items: [],
        services: {},
        customCosts: [],
        discountType: 'percentage',
        discountValue: 0,
        taxRate: 11,
        notes: '',
        status: 'unpaid'
    });

    const [manualInvoiceNumber, setManualInvoiceNumber] = useState(false);
    const [customInvoiceNumber, setCustomInvoiceNumber] = useState('');

    // Handle quotation selection - auto populate all fields
    const handleQuotationSelect = (quotationId) => {
        const selectedQuotation = approvedQuotations.find(q => q.id === quotationId);

        if (selectedQuotation) {
            console.log('📋 Selected quotation:', selectedQuotation);
            setFormData({
                ...formData,
                quotationId: quotationId,
                customer: selectedQuotation.customer || '',
                bcDocument: selectedQuotation.bcDocumentNumber || '',
                title: `Invoice untuk Quotation ${selectedQuotation.quotationNumber || ''}`,
                // Map items properly - ensure they have the right structure
                items: (selectedQuotation.items || []).map(item => ({
                    id: item.id || `item-${Date.now()}-${Math.random()}`,
                    description: item.description || '',
                    quantity: item.quantity || 0,
                    unit: item.unit || 'Unit',
                    unitPrice: item.unitPrice || 0,
                    value: item.value || (item.quantity * item.unitPrice)
                })),
                services: selectedQuotation.services || {},
                customCosts: selectedQuotation.customCosts || [],
                discountType: selectedQuotation.discountType || 'percentage',
                discountValue: selectedQuotation.discountValue || 0,
                taxRate: selectedQuotation.taxRate || 11,
            });
            console.log('✅ Items auto-filled:', selectedQuotation.items);
        } else {
            // Reset if no quotation selected
            setFormData({
                quotationId: '',
                customer: '',
                date: new Date().toISOString().split('T')[0],
                bcDocument: '',
                title: '',
                items: [],
                services: {},
                customCosts: [],
                discountType: 'percentage',
                discountValue: 0,
                taxRate: 11,
                notes: '',
                status: 'unpaid'
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('📝 Invoice form submitted, formData:', formData);

        try {
            // Calculate
            const itemsSubtotal = formData.items.reduce((sum, item) => sum + (item.value || 0), 0);
            const serviceSubtotal = Object.values(formData.services).reduce((sum, s) => sum + (s.total || 0), 0);
            const customCostsSubtotal = formData.customCosts.reduce((sum, cost) => sum + (cost.total || 0), 0);
            const subtotalBeforeDiscount = itemsSubtotal + serviceSubtotal + customCostsSubtotal;

            let discountAmount = 0;
            if (formData.discountType === 'percentage') {
                discountAmount = (subtotalBeforeDiscount * formData.discountValue) / 100;
            } else {
                discountAmount = formData.discountValue;
            }

            const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;
            const taxAmount = (subtotalAfterDiscount * formData.taxRate) / 100;
            const grandTotal = subtotalAfterDiscount + taxAmount;

            const invoiceData = {
                ...formData,
                itemsSubtotal,
                serviceSubtotal,
                customCostsSubtotal,
                subtotalBeforeDiscount,
                discountAmount,
                subtotalAfterDiscount,
                taxAmount,
                grandTotal,
                // Add custom invoice number if manual mode
                customInvoiceNumber: manualInvoiceNumber ? customInvoiceNumber : null
            };

            console.log('📝 Calling onSubmit with invoice data:', invoiceData);
            onSubmit(invoiceData);
            console.log('📝 Invoice submitted successfully, closing modal');
            alert('Invoice berhasil disimpan!');
            onClose();
        } catch (error) {
            console.error('❌ Error submitting invoice:', error);
            alert('Gagal menyimpan invoice: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-dark-card border-b border-dark-border p-6 z-10">
                    <h2 className="text-2xl font-bold gradient-text">Buat Invoice Baru</h2>
                    <p className="text-silver-dark text-sm mt-1">Lengkapi informasi invoice dan breakdown biaya</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* INVOICE HEADER - PROMINENT SECTION */}
                    <div className="glass-card p-6 rounded-lg border border-accent-blue/30 bg-gradient-to-br from-accent-blue/5 to-transparent">
                        <h3 className="text-lg font-semibold text-silver-light mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-accent-blue" />
                            Informasi Invoice
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* No. Invoice - Manual or Auto */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-silver">
                                        No. Invoice *
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={manualInvoiceNumber}
                                            onChange={(e) => {
                                                setManualInvoiceNumber(e.target.checked);
                                                if (!e.target.checked) setCustomInvoiceNumber('');
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-xs text-silver-dark">Manual</span>
                                    </label>
                                </div>

                                {manualInvoiceNumber ? (
                                    <input
                                        type="text"
                                        required
                                        value={customInvoiceNumber}
                                        onChange={(e) => setCustomInvoiceNumber(e.target.value)}
                                        placeholder="Contoh: INV-2025-001"
                                        className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:border-accent-blue focus:outline-none"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-dark-surface/50 border border-dark-border rounded-lg">
                                        <p className="text-silver-light font-mono">
                                            Auto: INV-{new Date().getFullYear()}-XXX
                                        </p>
                                        <p className="text-xs text-silver-dark mt-1">Dibuat otomatis saat submit</p>
                                    </div>
                                )}
                            </div>

                            {/* No. Pengajuan Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    No. Pendaftaran
                                </label>
                                <select
                                    value={formData.quotationId}
                                    onChange={(e) => handleQuotationSelect(e.target.value)}
                                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:border-accent-blue focus:outline-none"
                                >
                                    <option value="">-- Pilih No. Pendaftaran --</option>
                                    {approvedQuotations.map(q => (
                                        <option key={q.id} value={q.id}>
                                            {q.quotationNumber} - {q.customer}
                                        </option>
                                    ))}
                                </select>
                                {formData.quotationId && (
                                    <p className="text-xs text-accent-blue mt-2">✓ Data customer, items, dan biaya sudah auto-filled</p>
                                )}
                            </div>

                            {/* Customer */}
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    Customer *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:border-accent-blue focus:outline-none"
                                    placeholder="Nama Customer"
                                    disabled={!!formData.quotationId}
                                />
                                {formData.quotationId && (
                                    <p className="text-xs text-silver-dark mt-1">Dari pengajuan terpilih</p>
                                )}
                            </div>

                            {/* Tanggal Invoice */}
                            <div>
                                <label className="block text-sm font-medium text-silver mb-2">
                                    Tanggal Invoice *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:border-accent-blue focus:outline-none"
                                />
                            </div>

                            {/* Judul Invoice */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-silver mb-2">
                                    Judul Invoice *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:border-accent-blue focus:outline-none"
                                    placeholder="Contoh: Invoice untuk Pengiriman Barang Impor"
                                />
                            </div>
                        </div>
                    </div>

                    {/* BREAKDOWN SECTION */}
                    <div className="border-t border-dark-border pt-6">
                        <h3 className="text-lg font-semibold text-silver-light mb-4">Detail Breakdown Biaya</h3>

                        <LineItemManager
                            key={formData.quotationId || 'no-quotation'}
                            items={formData.items}
                            onChange={(items) => setFormData({ ...formData, items })}
                        />

                        <ServiceBreakdown
                            key={formData.quotationId || 'no-quotation-service'}
                            services={formData.services}
                            onChange={(services) => setFormData({ ...formData, services })}
                            totalItems={formData.items.reduce((sum, item) => sum + item.quantity, 0)}
                        />

                        <CustomCostsManager
                            key={formData.quotationId || 'no-quotation-costs'}
                            costs={formData.customCosts}
                            onChange={(costs) => setFormData({ ...formData, customCosts: costs })}
                        />

                        <QuotationSummary
                            itemsSubtotal={formData.items.reduce((sum, item) => sum + (item.value || 0), 0)}
                            serviceSubtotal={Object.values(formData.services).reduce((sum, s) => sum + (s.total || 0), 0)}
                            customCostsSubtotal={formData.customCosts.reduce((sum, cost) => sum + (cost.total || 0), 0)}
                            discountType={formData.discountType}
                            discountValue={formData.discountValue}
                            taxRate={formData.taxRate}
                            onDiscountChange={({ type, value }) => setFormData({ ...formData, discountType: type, discountValue: value })}
                            onTaxRateChange={(rate) => setFormData({ ...formData, taxRate: rate })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Catatan</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full"
                                placeholder="Catatan tambahan..."
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button type="button" variant="secondary" onClick={onClose}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Simpan Invoice
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Purchase Form Modal Component
const PurchaseFormModal = ({ onClose, onSubmit, vendors }) => {
    const [formData, setFormData] = useState({
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        title: '',
        costItems: [],
        taxRate: 11,
        notes: '',
        status: 'unpaid'
    });

    const [costForm, setCostForm] = useState({
        description: '',
        quantity: '1',
        unitPrice: '0'
    });

    const handleAddCost = () => {
        if (!costForm.description || !costForm.quantity || !costForm.unitPrice) {
            alert('Lengkapi semua field biaya');
            return;
        }

        const newCost = {
            id: `cost-${Date.now()}`,
            description: costForm.description,
            quantity: Number(costForm.quantity),
            unitPrice: Number(costForm.unitPrice),
            total: Number(costForm.quantity) * Number(costForm.unitPrice)
        };

        setFormData({ ...formData, costItems: [...formData.costItems, newCost] });
        setCostForm({ description: '', quantity: '1', unitPrice: '0' });
    };

    const handleRemoveCost = (costId) => {
        setFormData({ ...formData, costItems: formData.costItems.filter(c => c.id !== costId) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const subtotal = formData.costItems.reduce((sum, cost) => sum + cost.total, 0);
        const taxAmount = (subtotal * formData.taxRate) / 100;
        const grandTotal = subtotal + taxAmount;

        onSubmit({
            ...formData,
            subtotal,
            taxAmount,
            grandTotal
        });

        onClose();
    };

    const subtotal = formData.costItems.reduce((sum, cost) => sum + cost.total, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="glass-card p-6 rounded-lg max-w-3xl w-full my-8">
                <h2 className="text-2xl font-bold text-silver-light mb-6">Buat Pembayaran/Purchase Baru</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Vendor *</label>
                            <input
                                type="text"
                                required
                                value={formData.vendor}
                                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                placeholder="Nama Vendor"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">Tanggal *</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-silver mb-2">Judul Pembayaran *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Pembayaran Jasa Transportasi"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Cost Items */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-silver-light">Breakdown Biaya</h3>

                        <div className="glass-card p-4 rounded-lg border border-dark-border">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-silver mb-2">Deskripsi</label>
                                    <input
                                        type="text"
                                        value={costForm.description}
                                        onChange={(e) => setCostForm({ ...costForm, description: e.target.value })}
                                        placeholder="Biaya Transportasi"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-silver mb-2">Qty</label>
                                    <input
                                        type="number"
                                        value={costForm.quantity}
                                        onChange={(e) => setCostForm({ ...costForm, quantity: e.target.value })}
                                        min="1"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-silver mb-2">Harga Satuan</label>
                                    <input
                                        type="number"
                                        value={costForm.unitPrice}
                                        onChange={(e) => setCostForm({ ...costForm, unitPrice: e.target.value })}
                                        min="0"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <Button type="button" size="sm" onClick={handleAddCost} icon={Plus}>
                                Tambah Biaya
                            </Button>
                        </div>

                        {formData.costItems.length > 0 && (
                            <div className="glass-card rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-accent-orange">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Deskripsi</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Qty</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Harga</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Total</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-border">
                                        {formData.costItems.map(cost => (
                                            <tr key={cost.id}>
                                                <td className="px-4 py-3 text-sm text-silver-light">{cost.description}</td>
                                                <td className="px-4 py-3 text-sm text-silver">{cost.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-silver">Rp {formatCurrency(cost.unitPrice)}</td>
                                                <td className="px-4 py-3 text-sm text-accent-green font-semibold">Rp {formatCurrency(cost.total)}</td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCost(cost.id)}
                                                        className="p-1 hover:bg-red-500 hover:bg-opacity-20 rounded"
                                                    >
                                                        <X className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="glass-card p-4 rounded-lg border border-dark-border space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-silver-dark">Subtotal:</span>
                            <span className="text-silver-light font-semibold">Rp {formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-silver-dark">Pajak (PPN):</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-20 text-sm py-1 px-2"
                                />
                                <span className="text-silver-dark">% = Rp {formatCurrency(taxAmount)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-lg pt-2 border-t border-dark-border">
                            <span className="text-silver-light font-bold">TOTAL:</span>
                            <span className="text-accent-green font-bold">Rp {formatCurrency(grandTotal)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">Catatan</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full"
                            placeholder="Catatan tambahan..."
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit">
                            Simpan Purchase
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BridgeFinance;
