import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import ServiceItemManager from '../../components/Common/ServiceItemManager';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
    User, DollarSign, Calendar, MapPin, Package, Ship, Plane, Truck, FileText, X,
    CheckCircle, Clock, XCircle, Send, ArrowRight, TrendingUp, Users, Eye, Edit,
    Plus, Check, Filter, Download, Search, Trash, Circle
} from 'lucide-react';

const QuotationManagement = () => {
    const navigate = useNavigate();
    const { customers } = useData();
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingQuotation, setViewingQuotation] = useState(null);
    const [isEditingQuotation, setIsEditingQuotation] = useState(false);
    const [editedQuotation, setEditedQuotation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        customerCompany: '',
        customerAddress: '',
        salesPerson: '',
        quotationType: 'RG', // Regular by default
        quotationDate: new Date().toISOString().split('T')[0], // Today's date
        origin: '',
        destination: '',
        serviceType: 'sea',
        cargoType: '',
        weight: '',
        volume: '',
        commodity: '',
        currency: 'USD',
        totalAmount: '',
        validityDays: 30,
        notes: '',
        serviceItems: []
    });

    const statusConfig = {
        draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400', icon: FileText },
        manager_approval: { label: 'Manager Approval', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
        sent: { label: 'Sent', color: 'bg-purple-500/20 text-purple-400', icon: Send },
        revision_requested: { label: 'Revision Requested', color: 'bg-orange-500/20 text-orange-400', icon: Edit },
        approved: { label: 'Approved', color: 'bg-green-500/20 text-green-400', icon: Check },
        rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400', icon: X },
        converted: { label: 'SO Created', color: 'bg-emerald-500/20 text-emerald-400', icon: Check },
    };

    const serviceTypeIcons = {
        sea: Ship,
        air: Plane,
        land: Truck
    };

    // Fetch quotations from Supabase on mount
    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blink_quotations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map snake_case to camelCase for UI
            const mapped = (data || []).map(q => ({
                ...q,
                jobNumber: q.job_number || q.jobNumber,
                quotationNumber: q.quotation_number || q.quotationNumber,
                customerName: q.customer_name || q.customerName || '',
                customerCompany: q.customer_company || q.customerCompany || '',
                customerId: q.customer_id || q.customerId,
                customerAddress: q.customer_address || q.customerAddress || '',
                salesPerson: q.sales_person || q.salesPerson || '',
                quotationType: q.quotation_type || q.quotationType || 'RG',
                quotationDate: q.quotation_date || q.quotationDate,
                validUntil: q.valid_until || q.validUntil,
                serviceType: q.service_type || q.serviceType,
                cargoType: q.cargo_type || q.cargoType,
                totalAmount: q.total_amount || q.totalAmount || 0,
                serviceItems: q.service_items || q.serviceItems || [],
                rejectionReason: q.rejection_reason || q.rejectionReason,
                createdAt: q.created_at || q.createdAt,
                updatedAt: q.updated_at || q.updatedAt,
                currency: q.currency || 'USD',
                status: q.status || 'draft'
            }));

            console.log('✅ Mapped', mapped.length, 'quotations');
            setQuotations(mapped);
        } catch (error) {
            console.error('Error fetching quotations:', error);
            alert('Failed to load quotations from database');
        } finally {
            setLoading(false);
        }
    };

    // Auto-populate customer data when customer selected
    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        const selectedCustomer = customers.find(c => c.id === customerId);

        if (selectedCustomer) {
            setFormData(prev => ({
                ...prev,
                customerId: customerId,
                customerName: selectedCustomer.name,
                customerCompany: selectedCustomer.company || '',
                customerAddress: selectedCustomer.address || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                customerId: '',
                customerName: '',
                customerCompany: '',
                customerAddress: ''
            }));
        }
    };

    const handleSubmit = async (e, status = 'draft') => {
        e.preventDefault();

        // Generate Job Number - ini akan jadi primary reference untuk semua flow
        const jobNumber = `JOB - ${new Date().getFullYear()} -${String(quotations.length + 1).padStart(4, '0')} `;

        // Calculate validity date
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + parseInt(formData.validityDays));

        const newQuotation = {
            job_number: jobNumber,
            quotation_number: jobNumber,
            customer_name: formData.customerName,
            customer_company: formData.customerCompany,
            customer_id: (formData.customerId && formData.customerId.includes('-')) ? formData.customerId : null,  // Only valid UUIDs
            customer_address: formData.customerAddress,
            sales_person: formData.salesPerson,
            quotation_type: formData.quotationType,
            quotation_date: formData.quotationDate,
            valid_until: validUntil.toISOString().split('T')[0],
            origin: formData.origin,
            destination: formData.destination,
            service_type: formData.serviceType,
            cargo_type: formData.cargoType,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            volume: formData.volume ? parseFloat(formData.volume) : null,
            commodity: formData.commodity,
            currency: formData.currency,
            total_amount: formData.totalAmount ? parseInt(formData.totalAmount.toString().replace(/\./g, '')) : 0,
            status: status,
            notes: formData.notes,
            service_items: formData.serviceItems
        };

        try {
            const { data, error } = await supabase
                .from('blink_quotations')
                .insert([newQuotation])
                .select();

            if (error) throw error;

            // Refresh quotations list
            await fetchQuotations();

            setShowModal(false);
            resetForm();

            const message = status === 'draft'
                ? `Job Number ${jobNumber} saved as draft!`
                : `Job Number ${jobNumber} created and sent for Finance approval!`;
            alert(message + '\nIni akan menjadi reference untuk SO, Shipment, dan BL/AWB.');
        } catch (error) {
            console.error('Error creating quotation:', error);
            alert('Failed to create quotation: ' + error.message);
        }
    };

    // Finance approval handlers
    const handleManagerApprove = async (quotationId) => {
        try {
            const { error } = await supabase
                .from('blink_quotations')
                .update({ status: 'sent' })
                .eq('id', quotationId);

            if (error) throw error;

            await fetchQuotations();

            // Get quotation details for message
            const quotation = quotations.find(q => q.id === quotationId);
            alert(`✅ Quotation Approved!\n\nJob Number: ${quotation?.jobNumber || 'N/A'}\n\nIni akan menjadi reference untuk:\n• Sales Order (SO)\n• Shipment\n• BL/AWB\n\nStatus: Sent to Customer`);
            setShowViewModal(false);
        } catch (error) {
            console.error('Error approving quotation:', error);
            alert('Failed to approve quotation: ' + error.message);
        }
    };

    const handleManagerReject = async (quotationId, reason) => {
        const rejectionReason = prompt('Alasan reject (optional):');
        try {
            const { error } = await supabase
                .from('blink_quotations')
                .update({
                    status: 'rejected',
                    rejection_reason: rejectionReason
                })
                .eq('id', quotationId);

            if (error) throw error;

            await fetchQuotations();
            alert('❌ Quotation ditolak. Sales perlu revisi.');
            setShowViewModal(false);
        } catch (error) {
            console.error('Error rejecting quotation:', error);
            alert('Failed to reject quotation: ' + error.message);
        }
    };

    // Handle edit quotation
    const handleEditQuotation = () => {
        setEditedQuotation({ ...viewingQuotation });
        setIsEditingQuotation(true);
    };

    const handleSaveEditedQuotation = async () => {
        try {
            // Update in Supabase
            const { error } = await supabase
                .from('blink_quotations')
                .update({
                    total_amount: editedQuotation.totalAmount,
                    origin: editedQuotation.origin,
                    destination: editedQuotation.destination,
                    notes: editedQuotation.notes
                })
                .eq('id', editedQuotation.id);

            if (error) throw error;

            // Refresh list
            await fetchQuotations();
            setViewingQuotation(editedQuotation);
            setIsEditingQuotation(false);
            alert('Quotation updated successfully!');
        } catch (error) {
            console.error('Error updating quotation:', error);
            alert('Failed to update: ' + error.message);
        }
    };

    const handleCancelEdit = () => {
        setEditedQuotation(null);
        setIsEditingQuotation(false);
    };

    const resetForm = () => {
        setFormData({
            customerId: '',
            customerName: '',
            customerCompany: '',
            customerAddress: '',
            salesPerson: '',
            quotationType: 'RG',
            quotationDate: new Date().toISOString().split('T')[0],
            origin: '',
            destination: '',
            serviceType: 'sea',
            cargoType: '',
            weight: '',
            volume: '',
            commodity: '',
            currency: 'USD',
            totalAmount: '',
            validityDays: 30,
            notes: '',
            serviceItems: []
        });
    };

    // View quotation detail
    const handleViewQuotation = (quotation) => {
        setViewingQuotation(quotation);
        setShowViewModal(true);
    };

    // Delete quotation
    const handleDeleteQuotation = async (quotationId) => {
        try {
            // First, get quotation details to show what will be deleted
            const quotation = quotations.find(q => q.id === quotationId);

            // Fetch related data counts
            const { data: relatedShipments } = await supabase
                .from('blink_shipments')
                .select('*')
                .eq('quotation_id', quotationId);

            const { data: relatedInvoices } = await supabase
                .from('blink_invoices')
                .select('*')
                .eq('quotation_id', quotationId);

            // Build confirmation message
            let confirmMessage = `Yakin hapus quotation ${quotation?.jobNumber || 'ini'}?\n\n`;
            confirmMessage += `Data yang akan dihapus:\n`;
            confirmMessage += `- 1 Quotation\n`;

            if (relatedShipments && relatedShipments.length > 0) {
                confirmMessage += `- ${relatedShipments.length} Shipment(s)\n`;
            }

            if (relatedInvoices && relatedInvoices.length > 0) {
                confirmMessage += `- ${relatedInvoices.length} Invoice(s)\n`;
            }

            confirmMessage += `\n⚠️ Aksi ini tidak dapat dibatalkan!`;

            if (!confirm(confirmMessage)) {
                return;
            }

            // Extra confirmation for converted quotations
            if (quotation?.status === 'converted' && (relatedShipments?.length > 0 || relatedInvoices?.length > 0)) {
                if (!confirm('Quotation ini sudah dikonversi ke SO dengan shipment/invoice aktif. Yakin lanjutkan?')) {
                    return;
                }
            }

            console.log('🗑️ Starting cascade delete for quotation:', quotationId);

            // Step 1: Delete related invoices
            if (relatedInvoices && relatedInvoices.length > 0) {
                console.log(`Deleting ${relatedInvoices.length} related invoice(s)...`);
                const { error: invoiceError } = await supabase
                    .from('blink_invoices')
                    .delete()
                    .eq('quotation_id', quotationId);

                if (invoiceError) {
                    throw new Error(`Failed to delete invoices: ${invoiceError.message}`);
                }
                console.log('✅ Invoices deleted');
            }

            // Step 2: Delete related shipments
            if (relatedShipments && relatedShipments.length > 0) {
                console.log(`Deleting ${relatedShipments.length} related shipment(s)...`);
                const { error: shipmentError } = await supabase
                    .from('blink_shipments')
                    .delete()
                    .eq('quotation_id', quotationId);

                if (shipmentError) {
                    throw new Error(`Failed to delete shipments: ${shipmentError.message}`);
                }
                console.log('✅ Shipments deleted');
            }

            // Step 3: Delete the quotation itself
            console.log('Deleting quotation...');
            const { error: quotationError } = await supabase
                .from('blink_quotations')
                .delete()
                .eq('id', quotationId);

            if (quotationError) throw quotationError;

            console.log('✅ Quotation deleted successfully');

            // Refresh quotations list
            await fetchQuotations();

            // Success message with details
            let successMsg = '✅ Berhasil menghapus:\n';
            successMsg += `- 1 Quotation\n`;
            if (relatedShipments?.length > 0) successMsg += `- ${relatedShipments.length} Shipment(s)\n`;
            if (relatedInvoices?.length > 0) successMsg += `- ${relatedInvoices.length} Invoice(s)\n`;

            alert(successMsg);
            setShowViewModal(false);
        } catch (error) {
            console.error('❌ Error deleting quotation:', error);
            alert('❌ Gagal menghapus quotation: ' + error.message);
        }
    };

    // Request revision from customer
    const handleRequestRevision = async (quotationId) => {
        const reason = prompt('Alasan revisi dari customer:');
        if (!reason || reason.trim() === '') {
            alert('Alasan revisi harus diisi');
            return;
        }

        try {
            const { error } = await supabase
                .from('blink_quotations')
                .update({
                    status: 'revision_requested',
                    revision_reason: reason.trim()
                })
                .eq('id', quotationId);

            if (error) throw error;

            await fetchQuotations();
            alert('✅ Revision request created. Sales can now create a revised quotation.');
            setShowViewModal(false);
        } catch (error) {
            console.error('Error requesting revision:', error);
            alert('❌ Failed to request revision: ' + error.message);
        }
    };

    // Create revision (new version) of quotation
    const handleCreateRevision = async (quotationId) => {
        try {
            const parentQuotation = quotations.find(q => q.id === quotationId);
            if (!parentQuotation) {
                alert('Quotation not found');
                return;
            }

            const nextRevisionNumber = (parentQuotation.revision_number || 1) + 1;

            const revisedQuotation = {
                job_number: parentQuotation.jobNumber,
                quotation_number: parentQuotation.quotationNumber,
                customer_id: parentQuotation.customerId,
                customer_name: parentQuotation.customerName,
                customer_company: parentQuotation.customerCompany,
                customer_address: parentQuotation.customerAddress,
                sales_person: parentQuotation.salesPerson,
                quotation_type: parentQuotation.quotationType,
                quotation_date: new Date().toISOString().split('T')[0],
                origin: parentQuotation.origin,
                destination: parentQuotation.destination,
                service_type: parentQuotation.serviceType,
                cargo_type: parentQuotation.cargoType,
                weight: parentQuotation.weight,
                volume: parentQuotation.volume,
                commodity: parentQuotation.commodity,
                currency: parentQuotation.currency,
                total_amount: parentQuotation.totalAmount,
                validity_days: parentQuotation.validityDays || 30,
                notes: parentQuotation.notes,
                service_items: parentQuotation.serviceItems,
                revision_number: nextRevisionNumber,
                parent_quotation_id: parentQuotation.parent_quotation_id || parentQuotation.id,
                revision_reason: parentQuotation.revision_reason,
                revised_at: new Date().toISOString(),
                revised_by: 'Current User',
                status: 'manager_approval',
                is_superseded: false
            };

            const { data: newRevision, error: createError } = await supabase
                .from('blink_quotations')
                .insert([revisedQuotation])
                .select()
                .single();

            if (createError) throw createError;

            const { error: updateError } = await supabase
                .from('blink_quotations')
                .update({
                    is_superseded: true,
                    superseded_by_id: newRevision.id
                })
                .eq('id', quotationId);

            if (updateError) throw updateError;

            await fetchQuotations();
            alert(`✅ Revision Rev ${nextRevisionNumber} created!\n\nStatus: Waiting manager approval\nJob Number: ${parentQuotation.jobNumber} Rev ${nextRevisionNumber}`);
            setShowViewModal(false);
        } catch (error) {
            console.error('❌ Error creating revision:', error);
            alert('❌ Failed to create revision: ' + error.message);
        }
    };

    // Update quotation status
    const handleUpdateStatus = async (quotationId, newStatus) => {
        try {
            const { error } = await supabase
                .from('blink_quotations')
                .update({ status: newStatus })
                .eq('id', quotationId);

            if (error) throw error;

            await fetchQuotations();
            alert(`Status updated to: ${newStatus}`);
            setShowViewModal(false);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    // Create SO from approved quotation
    const handleCreateSO = async (quotation) => { // Added async
        console.log('🔵 Create SO clicked for quotation:', quotation.id);
        const soNumber = `SO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        console.log('📝 Generated SO Number:', soNumber);

        // Update quotation status to converted via Supabase
        try {
            console.log('⏳ Updating quotation status to converted...');
            const { error: updateError } = await supabase
                .from('blink_quotations')
                .update({ status: 'converted' })
                .eq('id', quotation.id);

            if (updateError) throw updateError;
        } catch (error) {
            console.error('Error updating quotation status to converted:', error);
            alert('Failed to update quotation status to converted: ' + error.message);
            return; // Stop execution if status update fails
        }

        // Auto-create Shipment in Operations
        const newShipment = {
            jobNumber: quotation.jobNumber, // Already mapped to camelCase
            soNumber: soNumber,
            customer: quotation.customerName, // Already mapped
            salesPerson: quotation.salesPerson, // Already mapped
            quotationType: quotation.quotationType || 'RG',
            quotationDate: quotation.quotationDate,
            origin: quotation.origin,
            destination: quotation.destination,
            serviceType: quotation.serviceType,
            cargoType: quotation.cargoType,
            weight: quotation.weight,
            volume: quotation.volume,
            commodity: quotation.commodity,
            quotedAmount: quotation.totalAmount || 0, // Already mapped
            status: 'pending',
            createdAt: new Date().toISOString().split('T')[0],
            createdFrom: 'sales_order'
        };

        // Save shipment to Supabase
        try {
            const { error } = await supabase
                .from('blink_shipments')
                .insert([{
                    job_number: newShipment.jobNumber,
                    so_number: newShipment.soNumber,
                    quotation_id: quotation.id,
                    customer: newShipment.customer,
                    sales_person: newShipment.salesPerson,
                    quotation_type: newShipment.quotationType,
                    quotation_date: newShipment.quotationDate,
                    origin: newShipment.origin,
                    destination: newShipment.destination,
                    service_type: newShipment.serviceType,
                    cargo_type: newShipment.cargoType, // Added cargo_type
                    weight: newShipment.weight,
                    volume: newShipment.volume,
                    commodity: newShipment.commodity,
                    quoted_amount: newShipment.quotedAmount,
                    currency: quotation.currency || 'USD', // Currency mengikuti quotation ✅
                    status: newShipment.status,
                    created_from: 'sales_order',
                    // Fix: Carry over missing data fields
                    customer_id: quotation.customerId,
                    service_items: quotation.serviceItems || [],
                    notes: quotation.notes || ''
                }]);

            if (error) throw error;

            await fetchQuotations(); // Refresh quotations after status update
            setShowViewModal(false); // Close modal after successful SO creation

            alert(`✅ Sales Order ${soNumber} created!\n\n📦 Shipment auto-created with Job Number: ${quotation.jobNumber}\n\n➡️ Navigating to Operations...`);

            // Navigate to shipments page
            setTimeout(() => {
                navigate('/blink/shipments');
            }, 1000);

        } catch (error) {
            console.error('Error creating shipment:', error);
            alert('SO created but shipment failed: ' + error.message);
        }
    };

    const filteredQuotations = quotations.filter(q => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            q.jobNumber?.toLowerCase().includes(search) ||
            q.customerName?.toLowerCase().includes(search) ||
            q.customerCompany?.toLowerCase().includes(search) ||
            q.origin?.toLowerCase().includes(search) ||
            q.destination?.toLowerCase().includes(search)
        );
    });

    // Only show active customers
    const activeCustomers = customers.filter(c => c.status === 'active');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Quotation Management</h1>
                    <p className="text-silver-dark mt-1">Kelola penawaran harga untuk customer</p>
                </div>
                <Button onClick={() => setShowModal(true)} icon={Plus}>
                    Quotation Baru
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-silver-dark" />
                <input
                    type="text"
                    placeholder="Cari Job Number, Customer, atau Route..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:outline-none focus:border-accent-orange smooth-transition"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-silver-dark">Total Quotations</p>
                            <p className="text-2xl font-bold text-silver-light mt-1">{quotations.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-silver-dark">Manager Approval</p>
                            <p className="text-2xl font-bold text-yellow-400 mt-1">
                                {quotations.filter(q => q.status === 'manager_approval').length}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>
                <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-silver-dark">Sent to Customer</p>
                            <p className="text-2xl font-bold text-purple-400 mt-1">
                                {quotations.filter(q => q.status === 'sent').length}
                            </p>
                        </div>
                        <Send className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
                <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-silver-dark">Converted to SO</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">
                                {quotations.filter(q => q.status === 'converted').length}
                            </p>
                        </div>
                        <Check className="w-8 h-8 text-emerald-400" />
                    </div>
                </div>
            </div>

            {/* Quotations Table */}
            <div className="glass-card rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-accent-orange">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Job Number</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Route</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Service</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Valid Until</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center">
                                        <FileText className="w-12 h-12 text-silver-dark mx-auto mb-3" />
                                        <p className="text-silver-dark">
                                            {searchTerm
                                                ? `Tidak ada quotation yang cocok dengan pencarian "${searchTerm}"`
                                                : 'Belum ada quotation. Klik "Quotation Baru" untuk memulai.'
                                            }
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotations.map((quote) => {
                                    const StatusIcon = statusConfig[quote.status]?.icon || FileText;
                                    const ServiceIcon = serviceTypeIcons[quote.serviceType] || Ship;
                                    return (
                                        <tr
                                            key={quote.id}
                                            onClick={() => handleViewQuotation(quote)}
                                            className="hover:bg-dark-surface smooth-transition cursor-pointer"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-accent-orange">{quote.jobNumber}</span>
                                                    {quote.revision_number > 1 && (
                                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                                                            Rev {quote.revision_number}
                                                        </span>
                                                    )}
                                                    {quote.is_superseded && (
                                                        <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded">
                                                            Superseded
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-silver-dark" />
                                                    <div>
                                                        <div className="text-silver-light font-medium">{quote.customer}</div>
                                                        {quote.customerCompany && (
                                                            <div className="text-xs text-silver-dark">{quote.customerCompany}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-silver-dark" />
                                                    <span className="text-silver-light text-sm">
                                                        {quote.origin} → {quote.destination}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <ServiceIcon className="w-4 h-4 text-silver-dark" />
                                                    <span className="text-silver-light capitalize">{quote.serviceType}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-silver-light">
                                                    {quote.currency === 'USD'
                                                        ? `$${(quote.totalAmount || quote.total_amount || 0).toLocaleString('id-ID')}`
                                                        : `Rp ${(quote.totalAmount || quote.total_amount || 0).toLocaleString('id-ID')}`
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-silver-dark text-sm">{quote.validUntil || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {(() => {
                                                    const config = statusConfig[quote.status];
                                                    const StatusIcon = config?.icon || Circle;
                                                    const isPending = quote.status === 'pending_approval';

                                                    return (
                                                        <div className="relative inline-flex">
                                                            <div className={`
                                                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                                                ${config?.color}
                                                                border border-current/30
                                                                smooth-transition
                                                                hover:scale-105 hover:shadow-md hover:border-current/50
                                                                cursor-pointer
                                                            `}>
                                                                <StatusIcon className="w-3.5 h-3.5" />
                                                                <span className="text-xs font-semibold">
                                                                    {config?.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for New Quotation */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title="Quotation Baru"
                size="large"
            >
                <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
                    {/* Quick Fill Sample Data Buttons */}
                    <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm font-semibold text-blue-400 mb-3">📋 Quick Fill Sample Data:</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        customerName: 'PT Sejahtera Logistik',
                                        customerCompany: 'PT Sejahtera Logistik',
                                        customerAddress: 'Jl. Sudirman No. 123, Jakarta Pusat',
                                        salesPerson: 'John Doe',
                                        quotationType: 'RG',
                                        origin: 'Jakarta',
                                        destination: 'Singapore',
                                        serviceType: 'sea',
                                        cargoType: 'General Cargo',
                                        weight: '15000',
                                        volume: '25.5',
                                        commodity: 'Electronics Components',
                                        currency: 'IDR',
                                        totalAmount: '85000000',
                                        validityDays: 30,
                                        notes: 'Urgent shipment - Priority handling required'
                                    });
                                }}
                                className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold text-sm smooth-transition"
                            >
                                ✓ Sample 1: Sea Freight (IDR 85M)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        customerName: 'CV Maju Bersama',
                                        customerCompany: 'CV Maju Bersama',
                                        customerAddress: 'Jl. Raya Darmo No. 456, Surabaya',
                                        salesPerson: 'Jane Smith',
                                        quotationType: 'RG',
                                        origin: 'Surabaya',
                                        destination: 'Hong Kong',
                                        serviceType: 'air',
                                        cargoType: 'Documents',
                                        weight: '250',
                                        volume: '0.8',
                                        commodity: 'Legal Documents & Certificates',
                                        currency: 'IDR',
                                        totalAmount: '12500000',
                                        validityDays: 30,
                                        notes: 'Urgent express delivery required'
                                    });
                                }}
                                className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold text-sm smooth-transition"
                            >
                                ✈ Sample 2: Air Freight (IDR 12.5M)
                            </button>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">
                            Customer <span className="text-red-400">*</span>
                        </label>
                        <select
                            required
                            value={formData.customerId}
                            onChange={handleCustomerChange}
                            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                        >
                            <option value="">Pilih Customer...</option>
                            {activeCustomers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} {customer.company && `- ${customer.company} `}
                                </option>
                            ))}
                        </select>
                        {formData.customerAddress && (
                            <p className="text-xs text-silver-dark mt-1">
                                Address: {formData.customerAddress}
                            </p>
                        )}
                    </div>

                    {/* Sales Person Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">
                            Sales Person <span className="text-red-400">*</span>
                        </label>
                        <select
                            required
                            value={formData.salesPerson}
                            onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                        >
                            <option value="">Select Sales Person...</option>
                            <option value="Operations">Operations</option>
                            <option value="John Doe">John Doe</option>
                            <option value="Jane Smith">Jane Smith</option>
                            <option value="Bob Johnson">Bob Johnson</option>
                        </select>
                    </div>

                    {/* Quotation Type & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Quotation Type <span className="text-red-400">*</span>
                            </label>
                            <select
                                required
                                value={formData.quotationType}
                                onChange={(e) => setFormData({ ...formData, quotationType: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            >
                                <option value="RG">Regular (RG)</option>
                                <option value="PJ">Project (PJ)</option>
                                <option value="CM">Common (CM)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Quotation Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.quotationDate}
                                onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            />
                        </div>
                    </div>

                    {/* Route Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Origin <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.origin}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                placeholder="e.g., Jakarta"
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Destination <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                placeholder="e.g., Singapore"
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            />
                        </div>
                    </div>

                    {/* Service Type & Cargo Info */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Service Type <span className="text-red-400">*</span>
                            </label>
                            <select
                                required
                                value={formData.serviceType}
                                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            >
                                <option value="sea">Sea Freight</option>
                                <option value="air">Air Freight</option>
                                <option value="land">Land Transport</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Cargo Type
                            </label>
                            <select
                                value={formData.cargoType}
                                onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            >
                                <option value="">Select...</option>
                                <option value="FCL">FCL (Full Container)</option>
                                <option value="LCL">LCL (Less Container)</option>
                                <option value="General">General Cargo</option>
                                <option value="Dangerous">Dangerous Goods</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Commodity
                            </label>
                            <input
                                type="text"
                                value={formData.commodity}
                                onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                                placeholder="e.g., Electronic"
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            />
                        </div>
                    </div>

                    {/* Weight & Volume */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                placeholder="1000"
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Volume (CBM)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.volume}
                                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                                placeholder="5.5"
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            />
                        </div>
                    </div>

                    {/* Currency, Amount & Validity */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Currency
                            </label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            >
                                <option value="USD">USD</option>
                                <option value="IDR">IDR</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Total Amount
                            </label>
                            <input
                                type="text"
                                value={formData.totalAmount ? parseInt(formData.totalAmount.toString().replace(/\./g, '')).toLocaleString('id-ID') : ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\./g, '');
                                    if (value === '' || /^\d+$/.test(value)) {
                                        setFormData({ ...formData, totalAmount: value });
                                    }
                                }}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver mb-2">
                                Valid for (days)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.validityDays}
                                onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                            />
                        </div>
                    </div>

                    {/* Service Items / Cost Breakdown */}
                    <ServiceItemManager
                        items={formData.serviceItems}
                        onChange={(items) => {
                            setFormData({ ...formData, serviceItems: items });
                            // Auto-calculate total from service items
                            const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                            setFormData(prev => ({ ...prev, totalAmount: total.toString() }));
                        }}
                        currency={formData.currency}
                    />

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">
                            Notes / Remarks
                        </label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional information..."
                            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save as Draft
                        </Button>
                        <Button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'manager_approval')}
                        >
                            Submit for Manager Approval
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* View Quotation Detail Modal */}
            {viewingQuotation && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    title="" // Clear the title prop as the header is now custom
                    size="large"
                >
                    <div className="pb-4 border-b border-dark-border">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-silver-light">Quotation Details</h2>
                                <p className="text-sm text-silver-dark mt-1">
                                    {viewingQuotation.jobNumber} | Created: {viewingQuotation.createdAt} | Valid: {viewingQuotation.validUntil}
                                </p>
                            </div>
                            <div className="flex gap-2 items-center">
                                {!isEditingQuotation && (
                                    <>
                                        <Button size="sm" variant="secondary" icon={Edit} onClick={handleEditQuotation}>
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            icon={Trash}
                                            onClick={() => handleDeleteQuotation(viewingQuotation.id)}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                                {isEditingQuotation && (
                                    <>
                                        <Button size="sm" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                                        <Button size="sm" onClick={handleSaveEditedQuotation}>Save</Button>
                                    </>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[viewingQuotation.status]?.color}`}>
                                    {statusConfig[viewingQuotation.status]?.label}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {/* Customer & Route & Quotation Info */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-dark-surface rounded-lg">
                            <div>
                                <p className="text-xs text-silver-dark mb-1">Customer</p>
                                <select
                                    value={editedQuotation?.customerId || viewingQuotation.customerId}
                                    onChange={(e) => {
                                        const customer = customers.find(c => c.id === e.target.value);
                                        setEditedQuotation({
                                            ...editedQuotation,
                                            customerId: e.target.value,
                                            customer: customer?.name || ''
                                        });
                                    }}
                                    disabled={!isEditingQuotation}
                                    className="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-silver-light text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {customers.filter(c => c.status === 'active').map(customer => (
                                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <p className="text-xs text-silver-dark mb-1">Sales Person</p>
                                <input
                                    type="text"
                                    value={isEditingQuotation ? (editedQuotation?.salesPerson || '') : (viewingQuotation.salesPerson || '')}
                                    onChange={(e) => setEditedQuotation({ ...editedQuotation, salesPerson: e.target.value })}
                                    disabled={!isEditingQuotation}
                                    className="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-silver-light text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-silver-dark mb-1">Quotation Type</p>
                                <p className="text-silver-light font-medium">
                                    {viewingQuotation.quotationType === 'RG' && 'Regular'}
                                    {viewingQuotation.quotationType === 'PJ' && 'Project'}
                                    {viewingQuotation.quotationType === 'CM' && 'Common'}
                                    {!viewingQuotation.quotationType && 'Regular'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-silver-dark mb-1">Quotation Date</p>
                                <p className="text-silver-light font-medium">{viewingQuotation.quotationDate || viewingQuotation.createdAt}</p>
                            </div>
                            <div>
                                <p className="text-xs text-silver-dark mb-1">Route</p>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={isEditingQuotation ? (editedQuotation?.origin || '') : (viewingQuotation.origin || '')}
                                        onChange={(e) => setEditedQuotation({ ...editedQuotation, origin: e.target.value })}
                                        disabled={!isEditingQuotation}
                                        placeholder="Origin"
                                        className="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-silver-light text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    />
                                    <span>→</span>
                                    <input
                                        type="text"
                                        value={isEditingQuotation ? (editedQuotation?.destination || '') : (viewingQuotation.destination || '')}
                                        onChange={(e) => setEditedQuotation({ ...editedQuotation, destination: e.target.value })}
                                        disabled={!isEditingQuotation}
                                        placeholder="Destination"
                                        className="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-silver-light text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-silver-dark mb-1">Service Type</p>
                            <select
                                value={isEditingQuotation ? (editedQuotation?.serviceType || '') : (viewingQuotation.serviceType || '')}
                                onChange={(e) => setEditedQuotation({ ...editedQuotation, serviceType: e.target.value })}
                                disabled={!isEditingQuotation}
                                className="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-silver-light text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <option value="sea">Sea Freight</option>
                                <option value="air">Air Freight</option>
                                <option value="land">Land Transport</option>
                            </select>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-accent-orange/10 to-transparent rounded-lg border border-accent-orange/20">
                            <p className="text-sm text-silver-dark mb-1">Estimated Amount</p>
                            <div className="text-2xl font-bold text-accent-orange">
                                {viewingQuotation.currency === 'IDR' ? 'Rp ' : '$'}
                                {(isEditingQuotation
                                    ? (editedQuotation?.totalAmount || 0)
                                    : (viewingQuotation.totalAmount || viewingQuotation.total_amount || 0)
                                ).toLocaleString('id-ID')}
                            </div>
                            {isEditingQuotation && (
                                <input
                                    type="number"
                                    value={editedQuotation?.totalAmount || 0}
                                    onChange={(e) => setEditedQuotation({ ...editedQuotation, totalAmount: parseFloat(e.target.value) || 0 })}
                                    className="mt-2 w-full px-3 py-2 bg-dark-card border border-dark-border rounded text-silver-light text-sm"
                                    placeholder="Enter amount"
                                />
                            )}
                        </div>

                        {/* Cost Breakdown */}
                        {viewingQuotation.serviceItems && viewingQuotation.serviceItems.length > 0 && (
                            <div className="p-4 bg-dark-surface rounded-lg">
                                <ServiceItemManager
                                    items={viewingQuotation.serviceItems}
                                    onChange={() => { }} // Read-only, no changes
                                    currency={viewingQuotation.currency}
                                    readOnly={true}
                                />
                            </div>
                        )}

                        {/* Department-Specific Actions */}
                        <div className="flex justify-between gap-3 pt-4 border-t border-dark-border">
                            <div className="flex gap-2">
                                {/* Manager Approval */}
                                {viewingQuotation.status === 'manager_approval' && (
                                    <>
                                        <Button onClick={() => handleManagerApprove(viewingQuotation.id)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400">
                                            ✓ Approve & Send to Customer
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleManagerReject(viewingQuotation.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400">
                                            ✗ Reject
                                        </Button>
                                    </>
                                )}



                                {/* Customer Decision */}
                                {viewingQuotation.status === 'sent' && (
                                    <>
                                        <Button onClick={() => handleUpdateStatus(viewingQuotation.id, 'approved')} className="bg-green-500/20 hover:bg-green-500/30 text-green-400">
                                            ✓ Customer Approved
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleUpdateStatus(viewingQuotation.id, 'rejected')} className="bg-red-500/20 hover:bg-red-500/30 text-red-400">
                                            ✗ Customer Rejected
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleRequestRevision(viewingQuotation.id)} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400">
                                            ✏️ Request Revision
                                        </Button>
                                    </>
                                )}

                                {/* Create Revision (for revision_requested status) */}
                                {viewingQuotation.status === 'revision_requested' && (
                                    <Button onClick={() => handleCreateRevision(viewingQuotation.id)} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400">
                                        📝 Create Revision
                                    </Button>
                                )}

                                {/* Create SO */}
                                {viewingQuotation.status === 'approved' && !viewingQuotation.is_superseded && (
                                    <Button onClick={() => handleCreateSO(viewingQuotation)}>
                                        Create Sales Order
                                    </Button>
                                )}

                                {/* Warning for superseded quotations */}
                                {viewingQuotation.is_superseded && (
                                    <div className="text-orange-400 text-sm flex items-center gap-2">
                                        <span>⚠️ Cannot create SO - quotation has been superseded by newer revision</span>
                                    </div>
                                )}
                            </div>
                            <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default QuotationManagement;
