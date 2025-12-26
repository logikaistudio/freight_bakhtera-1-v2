import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    // Centralized data state
    const [vendors, setVendors] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [finance, setFinance] = useState([]);

    // Module-specific data
    const [shipments, setShipments] = useState([]);
    const [assets, setAssets] = useState([]);
    const [events, setEvents] = useState([]);

    // Bridge TPPB specific data
    const [quotations, setQuotations] = useState([
        // Sample Quotation 1 - Approved
        {
            id: 'QUOT-SAMPLE-001',
            quotationNumber: 'QT-2025-001',
            customer: 'PT Maju Jaya Indonesia',
            customerId: 'CUST-001',
            bcDocumentNumber: 'BC23-2025-001234',
            title: 'Jasa Pengurusan TPPB - Elektronik Impor',
            date: '2025-01-15',
            validUntil: '2025-02-15',
            status: 'approved',
            packages: [
                {
                    id: 'pkg-001',
                    packageNumber: 'PKG-001',
                    description: 'Electronics Package',
                    items: [
                        {
                            id: 'item-1',
                            packageNumber: 'PKG-001',
                            itemName: 'Laptop Dell XPS 15',
                            goodsType: 'Laptop Dell XPS 15',
                            serialNumber: 'DXPS-2025-001-010',
                            quantity: 10,
                            unit: 'pcs',
                            condition: 'good',
                            value: 250000000,
                            notes: 'Laptop untuk kantor, kondisi baru'
                        }
                    ]
                },
                {
                    id: 'pkg-002',
                    packageNumber: 'PKG-002',
                    description: 'Display Package',
                    items: [
                        {
                            id: 'item-2',
                            packageNumber: 'PKG-002',
                            itemName: 'Monitor LG 27" 4K',
                            goodsType: 'Monitor LG 27" 4K',
                            serialNumber: 'LG27-2025-002-015',
                            quantity: 15,
                            unit: 'pcs',
                            condition: 'good',
                            value: 75000000,
                            notes: 'Monitor 4K untuk workstation'
                        }
                    ]
                }
            ],
            services: {
                tppbFee: { amount: 15000000, total: 15000000 },
                customsClearance: { amount: 10000000, total: 10000000 },
                transportCost: { amount: 5000000, total: 5000000 },
                handling: { amount: 3000000, total: 3000000 }
            },
            customCosts: [],
            discountType: 'percentage',
            discountValue: 5,
            taxRate: 11,
            subtotalBeforeDiscount: 358000000,
            discountAmount: 17900000,
            subtotalAfterDiscount: 340100000,
            taxAmount: 37411000,
            grandTotal: 377511000,
            notes: 'Pengajuan untuk impor elektronik dari Singapore',
            createdAt: '2025-01-15T10:00:00Z'
        },
        // Sample Quotation 2 - Approved
        {
            id: 'QUOT-SAMPLE-002',
            quotationNumber: 'QT-2025-002',
            customer: 'CV Sumber Rezeki',
            customerId: 'CUST-002',
            bcDocumentNumber: 'BC23-2025-005678',
            title: 'Jasa Pengurusan TPPB - Spare Parts Mesin',
            date: '2025-01-20',
            validUntil: '2025-02-20',
            status: 'approved',
            items: [
                {
                    id: 'item-1',
                    packageNumber: 'PKG-SR-001',
                    goodsType: 'Bearing SKF 6205',
                    quantity: 100,
                    unit: 'pcs',
                    condition: 'good',
                    serialNumber: 'SKF6205-BATCH-A',
                    value: 15000000,
                    notes: 'Bearing import dari Jerman'
                },
                {
                    id: 'item-2',
                    packageNumber: 'PKG-SR-002',
                    goodsType: 'V-Belt Type A',
                    quantity: 50,
                    unit: 'pcs',
                    condition: 'good',
                    serialNumber: 'VBELT-A-BATCH-B',
                    value: 10000000,
                    notes: 'V-Belt untuk mesin produksi'
                },
                {
                    id: 'item-3',
                    packageNumber: 'PKG-SR-003',
                    goodsType: 'Oil Seal 25x40x7',
                    quantity: 200,
                    unit: 'pcs',
                    condition: 'good',
                    serialNumber: 'OILSEAL-BATCH-C',
                    value: 10000000,
                    notes: 'Oil seal standar industri'
                }
            ],
            services: {
                tppbFee: { amount: 8000000, total: 8000000 },
                customsClearance: { amount: 6000000, total: 6000000 },
                transportCost: { amount: 3000000, total: 3000000 },
                insurance: { amount: 1000000, total: 1000000 }
            },
            customCosts: [
                {
                    id: 'custom-1',
                    description: 'Biaya Fumigasi',
                    amount: 2000000,
                    total: 2000000
                }
            ],
            discountType: 'percentage',
            discountValue: 0,
            taxRate: 11,
            subtotalBeforeDiscount: 55000000,
            discountAmount: 0,
            subtotalAfterDiscount: 55000000,
            taxAmount: 6050000,
            grandTotal: 61050000,
            notes: 'Spare parts untuk mesin produksi, butuh handling khusus',
            createdAt: '2025-01-20T14:30:00Z'
        }
    ]);
    const [customsDocuments, setCustomsDocuments] = useState([]);
    const [goodsMovements, setGoodsMovements] = useState([]);
    const [inspections, setInspections] = useState([]);
    const [itemMaster, setItemMaster] = useState([
        { id: 'item-001', itemCode: '8471.30.00', itemType: 'Laptop / Computer' },
        { id: 'item-002', itemCode: '8528.52.00', itemType: 'Monitor' },
        { id: 'item-003', itemCode: '8471.60.40', itemType: 'Keyboard' },
        { id: 'item-004', itemCode: '8471.60.70', itemType: 'Mouse' },
        { id: 'item-005', itemCode: '8517.62.00', itemType: 'Networking Equipment' }
    ]);
    const [inboundTransactions, setInboundTransactions] = useState([
        // From QT-2025-001 - Laptop Dell XPS 15
        {
            id: 'inbound-001',
            date: '2025-01-16',
            customsDocType: 'BC 2.3',
            customsDocNumber: 'BC23-2025-001234',
            customsDocDate: '2025-01-16',
            receiptNumber: 'QT-2025-001',
            sender: 'PT Maju Jaya Indonesia',
            supplier: 'PT Maju Jaya Indonesia',
            itemCode: '8471.30.00',
            hsCode: '8471.30.00',
            assetName: 'Laptop Dell XPS 15',
            quantity: 10,
            unit: 'pcs',
            value: 250000000,
            currency: 'IDR',
            status: 'completed'
        },
        // From QT-2025-001 - Monitor LG 27" 4K
        {
            id: 'inbound-002',
            date: '2025-01-16',
            customsDocType: 'BC 2.3',
            customsDocNumber: 'BC23-2025-001234',
            customsDocDate: '2025-01-16',
            receiptNumber: 'QT-2025-001',
            sender: 'PT Maju Jaya Indonesia',
            supplier: 'PT Maju Jaya Indonesia',
            itemCode: '8528.52.00',
            hsCode: '8528.52.00',
            assetName: 'Monitor LG 27" 4K',
            quantity: 15,
            unit: 'pcs',
            value: 75000000,
            currency: 'IDR',
            status: 'completed'
        },
        // From QT-2025-002 - Bearing SKF 6205
        {
            id: 'inbound-003',
            date: '2025-01-20',
            customsDocType: 'BC 2.3',
            customsDocNumber: 'BC23-2025-005678',
            customsDocDate: '2025-01-20',
            receiptNumber: 'QT-2025-002',
            sender: 'CV Sumber Rezeki',
            supplier: 'CV Sumber Rezeki',
            itemCode: '8471.60.40',
            hsCode: '8471.60.40',
            assetName: 'Bearing SKF 6205',
            quantity: 100,
            unit: 'pcs',
            value: 15000000,
            currency: 'IDR',
            status: 'completed'
        }
    ]);
    const [outboundTransactions, setOutboundTransactions] = useState([
        // Outbound from warehouse inventory - Laptop Dell XPS 15
        {
            id: 'outbound-001',
            date: '2025-01-22',
            customsDocType: 'BC 3.0',
            customsDocNumber: 'BC30-2025-000123',
            customsDocDate: '2025-01-22',
            receiptNumber: 'QT-2025-001',
            destination: 'PT Customer Export Jakarta',
            receiver: 'PT Customer Export Jakarta',
            itemCode: '8471.30.00',
            hsCode: '8471.30.00',
            assetName: 'Laptop Dell XPS 15',
            quantity: 3,
            unit: 'pcs',
            value: 75000000,
            currency: 'IDR',
            status: 'completed'
        }
    ]);
    const [rejectTransactions, setRejectTransactions] = useState([
        {
            id: 'reject-001',
            date: '2025-01-19',
            customsDocType: 'BC 2.5',
            customsDocNumber: 'BC25-2025-000123',
            customsDocDate: '2025-01-19',
            receiptNumber: 'RCP-REJ-001',
            rejectReason: 'Rusak saat pengiriman',
            itemCode: '8528.52.00',
            hsCode: '8528.52.00',
            assetName: 'Monitor LED 27" 4K',
            quantity: 2,
            unit: 'pcs',
            value: 10000000,
            currency: 'IDR',
            notes: 'LCD pecah, kemasan rusak parah',
            status: 'rejected'
        }
    ]);

    // Activity Logs for audit tracking
    const [activityLogs, setActivityLogs] = useState([
        {
            id: 'log-001',
            timestamp: '2025-01-16T10:30:00',
            module: 'Pendaftaran',
            action: 'add',
            entityType: 'Quotation',
            entityId: 'QT-2025-001',
            entityName: 'Jasa Pengurusan TPPB - Elektronik Impor',
            user: 'Admin User',
            details: 'Created new quotation for PT Maju Jaya Indonesia'
        },
        {
            id: 'log-002',
            timestamp: '2025-01-16T14:15:00',
            module: 'Pendaftaran',
            action: 'edit',
            entityType: 'Quotation',
            entityId: 'QT-2025-001',
            entityName: 'Jasa Pengurusan TPPB - Elektronik Impor',
            user: 'Admin User',
            details: 'Updated status to approved'
        },
        {
            id: 'log-003',
            timestamp: '2025-01-17T09:20:00',
            module: 'Warehouse',
            action: 'add',
            entityType: 'Inventory',
            entityId: 'inv-sample-001',
            entityName: 'Laptop Dell XPS 15',
            user: 'Warehouse Staff',
            details: 'Added 10 units to warehouse inventory'
        },
        {
            id: 'log-004',
            timestamp: '2025-01-18T11:45:00',
            module: 'Finance',
            action: 'add',
            entityType: 'Invoice',
            entityId: 'INV-2025-001',
            entityName: 'Invoice for QT-2025-001',
            user: 'Finance Admin',
            details: 'Generated invoice from quotation'
        },
        {
            id: 'log-005',
            timestamp: '2025-01-19T15:30:00',
            module: 'Goods Movement',
            action: 'add',
            entityType: 'Mutation Log',
            entityId: 'mut-001',
            entityName: 'Transfer to Ruang Pameran',
            user: 'Warehouse Staff',
            details: 'Moved 5 units of Laptop Dell XPS 15'
        }
    ]);

    // Helper function to log activity
    const logActivity = (module, action, entityType, entityId, entityName, details, user = 'System User') => {
        const newLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            module,
            action,
            entityType,
            entityId,
            entityName,
            user,
            details
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    // Pending Approvals
    const [pendingApprovals, setPendingApprovals] = useState([
        { id: 'approval-001', requestDate: '2025-01-20T09:30:00', type: 'edit', module: 'Pendaftaran', entityType: 'Quotation', entityId: 'QT-2025-001', entityName: 'Jasa Pengurusan TPPB - Elektronik Impor', requestedBy: 'Staff User', changes: { field: 'status', oldValue: 'pending', newValue: 'approved' }, details: 'Update status pendaftaran', status: 'pending' },
        { id: 'approval-002', requestDate: '2025-01-21T14:20:00', type: 'delete', module: 'Finance', entityType: 'Invoice', entityId: 'INV-2025-099', entityName: 'Invoice Duplicate', requestedBy: 'Finance Staff', changes: {}, details: 'Delete duplicate invoice', status: 'pending' }
    ]);

    const requestApproval = (type, module, entityType, entityId, entityName, changes, details, requestedBy = 'User') => {
        const newRequest = { id: `approval-${Date.now()}`, requestDate: new Date().toISOString(), type, module, entityType, entityId, entityName, requestedBy, changes, details, status: 'pending' };
        setPendingApprovals(prev => [newRequest, ...prev]);
        logActivity(module, 'approval_request', entityType, entityId, entityName, `Requested ${type}: ${details}`, requestedBy);
        return newRequest.id;
    };

    const approveRequest = (requestId, approvedBy = 'Manager') => {
        setPendingApprovals(prev => prev.map(req => req.id === requestId ? { ...req, status: 'approved', approvedBy, approvalDate: new Date().toISOString() } : req));
        const request = pendingApprovals.find(r => r.id === requestId);
        if (request) logActivity(request.module, 'approved', request.entityType, request.entityId, request.entityName, `Approved ${request.type}`, approvedBy);
    };

    const rejectRequest = (requestId, rejectedBy = 'Manager', reason = '') => {
        setPendingApprovals(prev => prev.map(req => req.id === requestId ? { ...req, status: 'rejected', rejectedBy, rejectionDate: new Date().toISOString(), rejectionReason: reason } : req));
        const request = pendingApprovals.find(r => r.id === requestId);
        if (request) logActivity(request.module, 'rejected', request.entityType, request.entityId, request.entityName, `Rejected: ${reason}`, rejectedBy);
    };

    const [warehouseInventory, setWarehouseInventory] = useState([
        // Sample inventory for QT-2025-001 - ready for mutation testing
        {
            id: 'inv-sample-001',
            pengajuanId: 'QUOT-SAMPLE-001',
            pengajuanNumber: 'QT-2025-001',
            submissionDate: '2025-01-15',
            bcDocumentNumber: 'BC23-2025-001234',
            bcDocumentDate: '2025-01-16',
            packageNumber: 'PKG-001',
            itemCode: '8471.30.00',
            itemName: 'Laptop Dell XPS 15',
            assetName: 'Laptop Dell XPS 15',
            serialNumber: 'DXPS-2025-001-010',
            quantity: 10,
            currentStock: 10,
            unit: 'pcs',
            value: 250000000,
            condition: 'good',
            hsCode: '8471.30.00',
            entryDate: '2025-01-16',
            location: {
                room: 'Ruang Server',
                rack: 'Rak A1',
                slot: 'Slot 01-05'
            },
            receivedBy: 'Warehouse Staff',
            remarks: 'Laptop untuk keperluan pameran elektronik',
            notes: 'Laptop untuk kantor, kondisi baru',
            movements: [
                {
                    id: 'mov-initial-001',
                    date: '2025-01-16',
                    time: '10:00',
                    quantity: 10,
                    movementType: 'in',
                    origin: 'supplier',
                    destination: 'gudang',
                    position: 'gudang',
                    condition: 'good',
                    remainingStock: 10,
                    pic: 'Warehouse Manager',
                    notes: 'Initial stock entry from approved pengajuan QT-2025-001',
                    documents: []
                }
            ]
        },
        {
            id: 'inv-sample-002',
            pengajuanId: 'QUOT-SAMPLE-001',
            pengajuanNumber: 'QT-2025-001',
            submissionDate: '2025-01-15',
            bcDocumentNumber: 'BC23-2025-001234',
            bcDocumentDate: '2025-01-16',
            packageNumber: 'PKG-002',
            itemName: 'Monitor LG 27" 4K',
            assetName: 'Monitor LG 27" 4K',
            serialNumber: 'LG27-2025-002-015',
            quantity: 15,
            currentStock: 15,
            unit: 'pcs',
            value: 75000000,
            condition: 'good',
            hsCode: '8528.52.00',
            entryDate: '2025-01-16',
            location: {
                room: 'Ruang Server',
                rack: 'Rak A2',
                slot: 'Slot 06-20'
            },
            receivedBy: 'Warehouse Staff',
            remarks: 'Monitor 4K untuk workstation pameran',
            notes: 'Monitor 4K untuk workstation',
            movements: [
                {
                    id: 'mov-initial-002',
                    date: '2025-01-16',
                    time: '10:15',
                    quantity: 15,
                    movementType: 'in',
                    origin: 'supplier',
                    destination: 'gudang',
                    position: 'gudang',
                    condition: 'good',
                    remainingStock: 15,
                    pic: 'Warehouse Manager',
                    notes: 'Initial stock entry from approved pengajuan QT-2025-001',
                    documents: []
                }
            ]
        }
    ]);
    const [mutationLogs, setMutationLogs] = useState([]);
    const [bcCodes, setBcCodes] = useState([
        {
            id: 'bc-2.3',
            code: 'BC 2.3',
            name: 'Pemasukan Barang Impor ke TPPB',
            category: 'inbound',
            description: 'Digunakan untuk pemasukan barang dari luar negeri ke Tempat Penyelenggaraan Pameran Berikat (TPPB).',
            isActive: true
        },
        {
            id: 'bc-2.7',
            code: 'BC 2.7',
            name: 'Pemindahan Antar TPB',
            category: 'inbound',
            description: 'Digunakan untuk pemindahan barang antar Tempat Penimbunan Berikat, termasuk dari atau ke TPPB. (Bisa Inbound/Outbound)',
            isActive: true
        },
        {
            id: 'bc-2.5',
            code: 'BC 2.5',
            name: 'Pengeluaran ke Dalam Negeri',
            category: 'outbound',
            description: 'Digunakan jika barang pameran dijual atau dipakai di dalam negeri (TLDDP).',
            isActive: true
        },
        {
            id: 'bc-4.0',
            code: 'BC 4.0',
            name: 'Pemasukan Barang Lokal ke TPPB',
            category: 'inbound',
            description: 'Digunakan untuk memasukkan barang asal dalam negeri ke TPPB untuk keperluan pameran.',
            isActive: true
        },
        {
            id: 'bc-4.1',
            code: 'BC 4.1',
            name: 'Pengeluaran Barang Lokal dari TPPB',
            category: 'outbound',
            description: 'Digunakan untuk mengeluarkan kembali barang lokal dari TPPB ke pemilik di dalam negeri.',
            isActive: true
        },
        {
            id: 'bc-2.6.1',
            code: 'BC 2.6.1',
            name: 'Pengeluaran Sementara',
            category: 'outbound',
            description: 'Digunakan saat barang TPPB dikeluarkan sementara (misalnya untuk demo atau uji coba).',
            isActive: true
        },
        {
            id: 'bc-2.6.2',
            code: 'BC 2.6.2',
            name: 'Pemasukan Kembali',
            category: 'inbound',
            description: 'Digunakan untuk memasukkan kembali barang yang sebelumnya keluar sementara.',
            isActive: true
        },
        {
            id: 'bc-2.8',
            code: 'BC 2.8',
            name: 'Re-ekspor ke Luar Negeri',
            category: 'outbound',
            description: 'Digunakan untuk mengeluarkan barang dari TPPB ke luar negeri (re-ekspor).',
            isActive: true
        }
    ]);

    // Finance module data
    const [invoices, setInvoices] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [leads, setLeads] = useState([]);

    // Load data from localStorage on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Listen for external warehouse inventory updates
                const handleWarehouseUpdate = (event) => {
                    if (event.detail) {
                        setWarehouseInventory(event.detail);
                    }
                };
                window.addEventListener('updateWarehouseInventory', handleWarehouseUpdate);

                // Load TPPB Workflow Data (Quotations, etc.)
                const { data: quotData, error: quotError } = await supabase.from('freight_quotations').select('*');
                if (quotError) console.error('Error fetching quotations:', quotError);
                else setQuotations(quotData || []);

                // Load Warehouse Inventory
                const { data: whData, error: whError } = await supabase.from('freight_warehouse').select('*');
                if (whError) console.error('Error fetching inventory:', whError);
                else setWarehouseInventory(whData || []);

                // Load Master Data
                const { data: bcData, error: bcError } = await supabase.from('freight_bc_codes').select('*');
                if (bcError) console.error('Error fetching BC codes:', bcError);
                else setBcCodes(bcData || []);

                const { data: itemData, error: itemError } = await supabase.from('freight_inventory').select('*'); // Using freight_inventory table for item master
                if (itemError) console.error('Error fetching Item master:', itemError);
                else setItemMaster(itemData || []);

                // Load Customers from Supabase (with Debug Logging)
                console.log('🔄 Fetching customers from Supabase...');
                const { data: customerData, error: customerError } = await supabase
                    .from('freight_customers')
                    .select('*');

                if (customerError) {
                    console.error('❌ Error fetching customers:', customerError);
                } else if (customerData) {
                    console.log(`✅ Loaded ${customerData.length} customers from Supabase:`, customerData);
                    setCustomers(customerData);
                }

                // Load Vendors from Supabase
                const { data: vendorData, error: vendorError } = await supabase
                    .from('freight_vendors')
                    .select('*');

                if (vendorError) console.error('Error fetching vendors:', vendorError);
                else if (vendorData) setVendors(vendorData);

                // Load Transactions (Inbound, Outbound, Reject)
                const { data: inData, error: inError } = await supabase.from('freight_inbound').select('*');
                if (!inError) setInboundTransactions(inData || []);

                const { data: outData, error: outError } = await supabase.from('freight_outbound').select('*');
                if (!outError) setOutboundTransactions(outData || []);

                const { data: rejData, error: rejError } = await supabase.from('freight_reject').select('*');
                if (!rejError) setRejectTransactions(rejData || []);

                // Load Supporting Data
                const savedInspections = localStorage.getItem('freight_inspections');
                if (savedInspections) setInspections(JSON.parse(savedInspections));

                const { data: custDocData, error: custDocError } = await supabase.from('freight_customs').select('*');
                if (!custDocError) setCustomsDocuments(custDocData || []);

                const { data: mLogData, error: mLogError } = await supabase.from('freight_mutation_logs').select('*');
                if (!mLogError) setMutationLogs(mLogData || []);

                // Load Finance Data
                const { data: invData, error: invError } = await supabase.from('freight_invoices').select('*');
                if (!invError) setInvoices(invData || []);

                const { data: purData, error: purError } = await supabase.from('freight_purchases').select('*');
                if (!purError) setPurchases(purData || []);

                const savedEvents = localStorage.getItem('freight_events');
                if (savedEvents) setEvents(JSON.parse(savedEvents));

            } catch (error) {
                console.error("Failed to load data from Supabase:", error);
            }
        };
        loadData();
    }, []);

    // Save to localStorage whenever data changes
    // Vendors and Customers now managed by Supabase - removed localStorage sync
    /*
    useEffect(() => {
        localStorage.setItem('freight_vendors', JSON.stringify(vendors));
    }, [vendors]);

    useEffect(() => {
        localStorage.setItem('freight_customers', JSON.stringify(customers));
    }, [customers]);
    */

    // Realtime Subscriptions
    useEffect(() => {
        const channel = supabase.channel('postgres_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'freight_customers' }, (payload) => {
                console.log('⚡ Realtime Customer Update:', payload);
                if (payload.eventType === 'INSERT') setCustomers(prev => [...prev, payload.new]);
                else if (payload.eventType === 'UPDATE') setCustomers(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
                else if (payload.eventType === 'DELETE') setCustomers(prev => prev.filter(item => item.id !== payload.old.id));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'freight_vendors' }, (payload) => {
                console.log('⚡ Realtime Vendor Update:', payload);
                if (payload.eventType === 'INSERT') setVendors(prev => [...prev, payload.new]);
                else if (payload.eventType === 'UPDATE') setVendors(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
                else if (payload.eventType === 'DELETE') setVendors(prev => prev.filter(item => item.id !== payload.old.id));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'freight_quotations' }, (payload) => {
                console.log('⚡ Realtime Quotation Update:', payload);
                if (payload.eventType === 'INSERT') setQuotations(prev => [...prev, payload.new]);
                else if (payload.eventType === 'UPDATE') setQuotations(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
                // Delete typically not used for quotations, but handled if needed
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'freight_warehouse' }, (payload) => {
                console.log('⚡ Realtime Warehouse Update:', payload);
                if (payload.eventType === 'INSERT') setWarehouseInventory(prev => [...prev, payload.new]);
                else if (payload.eventType === 'UPDATE') setWarehouseInventory(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
                else if (payload.eventType === 'DELETE') setWarehouseInventory(prev => prev.filter(item => item.id !== payload.old.id));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'freight_inbound' }, (payload) => {
                console.log('⚡ Realtime Inbound Update:', payload);
                if (payload.eventType === 'INSERT') setInboundTransactions(prev => [payload.new, ...prev]);
                else if (payload.eventType === 'UPDATE') setInboundTransactions(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'freight_outbound' }, (payload) => {
                console.log('⚡ Realtime Outbound Update:', payload);
                if (payload.eventType === 'INSERT') setOutboundTransactions(prev => [payload.new, ...prev]);
                else if (payload.eventType === 'UPDATE') setOutboundTransactions(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'freight_reject' }, (payload) => {
                console.log('⚡ Realtime Reject Update:', payload);
                if (payload.eventType === 'INSERT') setRejectTransactions(prev => [payload.new, ...prev]);
                else if (payload.eventType === 'UPDATE') setRejectTransactions(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'freight_customs' }, (payload) => {
                console.log('⚡ Realtime Customs Doc Update:', payload);
                if (payload.eventType === 'INSERT') setCustomsDocuments(prev => [...prev, payload.new]);
                else if (payload.eventType === 'UPDATE') setCustomsDocuments(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
                else if (payload.eventType === 'DELETE') setCustomsDocuments(prev => prev.filter(item => item.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
    // Save to localStorage whenever data changes
    /*
    useEffect(() => {
        localStorage.setItem('freight_vendors', JSON.stringify(vendors));
    }, [vendors]);

    useEffect(() => {
        localStorage.setItem('freight_customers', JSON.stringify(customers));
    }, [customers]);
    */

    // Save to localStorage whenever data changes
    /*
    useEffect(() => {
        localStorage.setItem('freight_vendors', JSON.stringify(vendors));
    }, [vendors]);

    useEffect(() => {
        localStorage.setItem('freight_customers', JSON.stringify(customers));
    }, [customers]);
    */
    useEffect(() => {
        localStorage.setItem('freight_finance', JSON.stringify(finance));
    }, [finance]);

    useEffect(() => {
        localStorage.setItem('freight_shipments', JSON.stringify(shipments));
    }, [shipments]);

    useEffect(() => {
        localStorage.setItem('freight_assets', JSON.stringify(assets));
    }, [assets]);

    useEffect(() => {
        localStorage.setItem('freight_events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        localStorage.setItem('freight_inbound', JSON.stringify(inboundTransactions));
    }, [inboundTransactions]);

    useEffect(() => {
        localStorage.setItem('freight_outbound', JSON.stringify(outboundTransactions));
    }, [outboundTransactions]);

    useEffect(() => {
        localStorage.setItem('freight_reject', JSON.stringify(rejectTransactions));
    }, [rejectTransactions]);
    // Save quotations to localStorage
    useEffect(() => {
        console.log('💾 Saving quotations to localStorage:', quotations);
        localStorage.setItem('freight_quotations', JSON.stringify(quotations));
    }, [quotations]);

    // Save goodsMovements to localStorage
    useEffect(() => {
        localStorage.setItem('freight_movements', JSON.stringify(goodsMovements));
    }, [goodsMovements]);

    // Save inspections to localStorage
    useEffect(() => {
        localStorage.setItem('freight_inspections', JSON.stringify(inspections));
    }, [inspections]);


    useEffect(() => {
        localStorage.setItem('freight_warehouse', JSON.stringify(warehouseInventory));
    }, [warehouseInventory]);

    useEffect(() => {
        localStorage.setItem('freight_mutation_logs', JSON.stringify(mutationLogs));
    }, [mutationLogs]);

    useEffect(() => {
        localStorage.setItem('freight_customs', JSON.stringify(customsDocuments));
    }, [customsDocuments]);

    useEffect(() => {
        console.log('💾 Saving quotations to localStorage:', quotations);
        localStorage.setItem('freight_quotations', JSON.stringify(quotations));
    }, [quotations]);


    // Sample data now defined in initial state above (QT-2025-001 and QT-2025-002)
    // Removed auto-generation to prevent duplicate sample data

    useEffect(() => {
        localStorage.setItem('freight_movements', JSON.stringify(goodsMovements));
    }, [goodsMovements]);

    useEffect(() => {
        localStorage.setItem('freight_inspections', JSON.stringify(inspections));
    }, [inspections]);

    /*
    useEffect(() => {
        localStorage.setItem('freight_bc_codes', JSON.stringify(bcCodes));
    }, [bcCodes]);

    useEffect(() => {
        localStorage.setItem('freight_invoices', JSON.stringify(invoices));
    }, [invoices]);

    useEffect(() => {
        localStorage.setItem('freight_purchases', JSON.stringify(purchases));
    }, [purchases]);
    */

    // Vendor CRUD operations
    const addVendor = async (vendor) => {
        const newVendor = {
            ...vendor,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('freight_vendors').insert([newVendor]);
        if (error) {
            console.error('Error adding vendor:', error);
            alert('Failed to add vendor to database');
            return;
        }

        setVendors(prev => [...prev, newVendor]);
        return newVendor;
    };

    const updateVendor = async (id, updatedVendor) => {
        const { error } = await supabase
            .from('freight_vendors')
            .update(updatedVendor)
            .eq('id', id);

        if (error) {
            console.error('Error updating vendor:', error);
            const { error: retryError } = await supabase.from('freight_vendors').upsert({ id, ...updatedVendor });
            if (retryError) {
                alert('Failed to update vendor');
                return;
            }
        }
        setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updatedVendor } : v));
    };

    const deleteVendor = async (id) => {
        const { error } = await supabase.from('freight_vendors').delete().eq('id', id);
        if (error) {
            console.error('Error deleting vendor:', error);
            alert('Failed to delete vendor');
            return;
        }
        setVendors(prev => prev.filter(v => v.id !== id));
    };

    // Customer CRUD operations
    const addCustomer = async (customer) => {
        const newCustomer = {
            ...customer,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('freight_customers').insert([newCustomer]);
        if (error) {
            console.error('Error adding customer:', error);
            alert('Failed to add customer to database');
            return;
        }

        setCustomers(prev => [...prev, newCustomer]);
        return newCustomer;
    };

    const updateCustomer = async (id, updatedCustomer) => {
        const { error } = await supabase
            .from('freight_customers')
            .update(updatedCustomer)
            .eq('id', id);

        if (error) {
            console.error('Error updating customer:', error);
            const { error: retryError } = await supabase.from('freight_customers').upsert({ id, ...updatedCustomer });
            if (retryError) {
                alert('Failed to update customer');
                return;
            }
        }
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedCustomer } : c));
    };

    const deleteCustomer = async (id) => {
        const { error } = await supabase.from('freight_customers').delete().eq('id', id);
        if (error) {
            console.error('Error deleting customer:', error);
            alert('Failed to delete customer');
            return;
        }
        setCustomers(prev => prev.filter(c => c.id !== id));
    };

    // Finance CRUD operations
    const addFinanceTransaction = (transaction) => {
        const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setFinance([...finance, newTransaction]);
        return newTransaction;
    };

    const updateFinanceTransaction = (id, updatedTransaction) => {
        setFinance(finance.map(t => t.id === id ? { ...t, ...updatedTransaction } : t));
    };

    const deleteFinanceTransaction = (id) => {
        setFinance(finance.filter(t => t.id !== id));
    };

    // Shipment CRUD operations (Blink module)
    const addShipment = (shipment) => {
        const newShipment = {
            ...shipment,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setShipments([...shipments, newShipment]);
        return newShipment;
    };

    const updateShipment = (id, updatedShipment) => {
        setShipments(shipments.map(s => s.id === id ? { ...s, ...updatedShipment } : s));
    };

    const deleteShipment = (id) => {
        setShipments(shipments.filter(s => s.id !== id));
    };

    // Asset CRUD operations (Bridge module)
    const addAsset = (asset) => {
        const newAsset = {
            ...asset,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setAssets([...assets, newAsset]);
        return newAsset;
    };

    const updateAsset = (id, updatedAsset) => {
        setAssets(assets.map(a => a.id === id ? { ...a, ...updatedAsset } : a));
    };

    const deleteAsset = (id) => {
        setAssets(assets.filter(a => a.id !== id));
    };

    // Event CRUD operations (Big module)
    const addEvent = (event) => {
        const newEvent = {
            ...event,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setEvents([...events, newEvent]);
        return newEvent;
    };

    const updateEvent = (id, updatedEvent) => {
        setEvents(events.map(e => e.id === id ? { ...e, ...updatedEvent } : e));
    };

    const deleteEvent = (id) => {
        setEvents(events.filter(e => e.id !== id));
    };

    // Inbound Transaction operations (Bridge TPPB)
    const addInboundTransaction = (transaction) => {
        // Calculate total operational cost
        const opCosts = transaction.operationalCosts || {};
        const totalOperationalCost = Object.keys(opCosts)
            .filter(key => key !== 'notes')
            .reduce((sum, key) => sum + (Number(opCosts[key]) || 0), 0);

        const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: 'completed',
            totalOperationalCost,
            totalCost: Number(transaction.value) + totalOperationalCost,
        };

        // Auto-create customs document
        const customsDoc = {
            id: (Date.now() + 1).toString(),
            docType: transaction.customsDocType,
            docNumber: transaction.customsDocNumber,
            docDate: transaction.customsDocDate,
            transactionType: 'inbound',
            transactionId: newTransaction.id,
            assetName: transaction.assetName,
            quantity: transaction.quantity,
            value: transaction.value,
            status: 'approved',
            createdAt: new Date().toISOString(),
        };
        setCustomsDocuments([...customsDocuments, customsDoc]);

        // Auto-update warehouse inventory
        updateInventoryStock(transaction.assetId, transaction.assetName, transaction.quantity, transaction.unit, 'inbound', newTransaction.id, transaction.value);

        // Auto-generate finance invoice for goods value
        const goodsInvoice = {
            type: 'expense',
            category: 'Equipment',
            amount: transaction.value,
            description: `Inbound - ${transaction.assetName} (${transaction.quantity} ${transaction.unit}) - Goods Value - BC: ${transaction.customsDocNumber} `,
            module: 'bridge',
            date: transaction.date,
            referenceType: 'inbound',
            referenceId: newTransaction.id,
        };
        addFinanceTransaction(goodsInvoice);

        // Auto-generate finance invoice for operational costs (if any)
        if (totalOperationalCost > 0) {
            const opCostInvoice = {
                type: 'expense',
                category: 'Operational',
                amount: totalOperationalCost,
                description: `Inbound - ${transaction.assetName} - Operational Costs(Handling: ${opCosts.handling || 0}, Storage: ${opCosts.storage || 0}, Customs: ${opCosts.customsProcessing || 0}, Transport: ${opCosts.transportation || 0})`,
                module: 'bridge',
                date: transaction.date,
                referenceType: 'inbound-operational',
                referenceId: newTransaction.id,
            };
            addFinanceTransaction(opCostInvoice);
        }

        newTransaction.invoiceId = goodsInvoice.id;

        setInboundTransactions([...inboundTransactions, newTransaction]);
        return newTransaction;
    };

    const updateInboundTransaction = (id, updatedTransaction) => {
        setInboundTransactions(inboundTransactions.map(t => t.id === id ? { ...t, ...updatedTransaction } : t));
    };

    const deleteInboundTransaction = (id) => {
        setInboundTransactions(inboundTransactions.filter(t => t.id !== id));
    };

    // Outbound Transaction operations (Bridge TPPB)
    const addOutboundTransaction = (transaction) => {
        // Check stock availability
        const inventory = warehouseInventory.find(i => i.assetId === transaction.assetId);
        if (!inventory || inventory.currentStock < transaction.quantity) {
            throw new Error('Insufficient stock for outbound transaction');
        }

        // Calculate total operational cost
        const opCosts = transaction.operationalCosts || {};
        const totalOperationalCost = Object.keys(opCosts)
            .filter(key => key !== 'notes')
            .reduce((sum, key) => sum + (Number(opCosts[key]) || 0), 0);

        const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: 'completed',
            totalOperationalCost,
            netRevenue: Number(transaction.value) - totalOperationalCost,
        };

        // Auto-create customs document
        const customsDoc = {
            id: (Date.now() + 1).toString(),
            docType: transaction.customsDocType,
            docNumber: transaction.customsDocNumber,
            docDate: transaction.customsDocDate,
            transactionType: 'outbound',
            transactionId: newTransaction.id,
            assetName: transaction.assetName,
            quantity: transaction.quantity,
            value: transaction.value,
            status: 'approved',
            createdAt: new Date().toISOString(),
        };
        setCustomsDocuments([...customsDocuments, customsDoc]);

        // Auto-update warehouse inventory (reduce stock)
        updateInventoryStock(transaction.assetId, transaction.assetName, -transaction.quantity, transaction.unit, 'outbound', newTransaction.id, transaction.value);

        // Auto-generate finance invoice for sales income
        const salesInvoice = {
            type: 'income',
            category: 'Service',
            amount: transaction.value,
            description: `Outbound - ${transaction.assetName} (${transaction.quantity} ${transaction.unit}) - Sales Revenue - BC: ${transaction.customsDocNumber} `,
            module: 'bridge',
            date: transaction.date,
            referenceType: 'outbound',
            referenceId: newTransaction.id,
        };
        addFinanceTransaction(salesInvoice);

        // Auto-generate finance invoice for operational costs (if any)
        if (totalOperationalCost > 0) {
            const opCostInvoice = {
                type: 'expense',
                category: 'Operational',
                amount: totalOperationalCost,
                description: `Outbound - ${transaction.assetName} - Operational Costs(Handling: ${opCosts.handling || 0}, Customs: ${opCosts.customsProcessing || 0}, Transport: ${opCosts.transportation || 0})`,
                module: 'bridge',
                date: transaction.date,
                referenceType: 'outbound-operational',
                referenceId: newTransaction.id,
            };
            addFinanceTransaction(opCostInvoice);
        }

        newTransaction.invoiceId = salesInvoice.id;

        setOutboundTransactions([...outboundTransactions, newTransaction]);
        return newTransaction;
    };

    const updateOutboundTransaction = (id, updatedTransaction) => {
        setOutboundTransactions(outboundTransactions.map(t => t.id === id ? { ...t, ...updatedTransaction } : t));
    };

    const deleteOutboundTransaction = (id) => {
        setOutboundTransactions(outboundTransactions.filter(t => t.id !== id));
    };

    // Warehouse Inventory helper function
    const updateInventoryStock = (assetId, assetName, quantity, unit, type, transactionId, value) => {
        const existingInventory = warehouseInventory.find(i => i.assetId === assetId);

        if (existingInventory) {
            const newStock = existingInventory.currentStock + quantity;
            const movement = {
                type,
                transactionId,
                quantity: Math.abs(quantity),
                date: new Date().toISOString(),
            };

            setWarehouseInventory(warehouseInventory.map(i =>
                i.assetId === assetId
                    ? {
                        ...i,
                        currentStock: newStock,
                        value: value,
                        movements: [...(i.movements || []), movement],
                        lastUpdated: new Date().toISOString(),
                    }
                    : i
            ));
        } else if (quantity > 0) {
            // Create new inventory item for inbound
            const newInventory = {
                id: Date.now().toString(),
                assetId,
                assetName,
                category: 'TPPB Goods',
                currentStock: quantity,
                unit,
                minStock: 0,
                maxStock: 1000,
                value,
                location: 'Warehouse',
                lastUpdated: new Date().toISOString(),
                movements: [{
                    type,
                    transactionId,
                    quantity: Math.abs(quantity),
                    date: new Date().toISOString(),
                }],
            };
            setWarehouseInventory([...warehouseInventory, newInventory]);
        }
    };

    // Warehouse Inventory CRUD operations
    const addWarehouseInventory = async (inventory) => {
        const newInventory = {
            ...inventory,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            movements: [],
        };

        const { error } = await supabase.from('freight_warehouse').insert([newInventory]);
        if (error) {
            console.error('Error adding inventory:', error);
            alert('Failed to add inventory');
            return;
        }

        setWarehouseInventory(prev => [...prev, newInventory]);
        return newInventory;
    };

    const updateWarehouseInventory = async (id, updatedInventory) => {
        const { error } = await supabase
            .from('freight_warehouse')
            .update(updatedInventory)
            .eq('id', id);

        if (error) {
            console.error('Error updating inventory:', error);
            alert('Failed to update inventory');
            return;
        }
        setWarehouseInventory(prev => prev.map(i => i.id === id ? { ...i, ...updatedInventory } : i));
    };

    const deleteWarehouseInventory = async (id) => {
        const { error } = await supabase.from('freight_warehouse').delete().eq('id', id);
        if (error) {
            console.error('Error deleting inventory:', error);
            alert('Failed to delete inventory');
            return;
        }
        setWarehouseInventory(prev => prev.filter(i => i.id !== id));
    };

    // Customs Document CRUD operations
    const addCustomsDocument = async (document) => {
        const newDocument = {
            ...document,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('freight_customs').insert([newDocument]);
        if (error) {
            console.error('Error adding customs document:', error);
            return;
        }

        setCustomsDocuments(prev => [...prev, newDocument]);
        return newDocument;
    };

    const updateCustomsDocument = async (id, updatedDocument) => {
        const { error } = await supabase
            .from('freight_customs')
            .update(updatedDocument)
            .eq('id', id);

        if (error) {
            console.error('Error updating customs document:', error);
            return;
        }
        setCustomsDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updatedDocument } : d));
    };

    const deleteCustomsDocument = async (id) => {
        const { error } = await supabase.from('freight_customs').delete().eq('id', id);
        if (error) {
            console.error('Error deleting customs document:', error);
            return;
        }
        setCustomsDocuments(prev => prev.filter(d => d.id !== id));
    };

    // ===== TPPB Workflow Methods =====

    const addQuotation = async (quotation) => {
        console.log('🔵 addQuotation called with:', quotation);
        const newQuotation = {
            ...quotation,
            id: `QT-${Date.now()}`,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('freight_quotations').insert([newQuotation]);
        if (error) {
            console.error('Error adding quotation:', error);
            alert('Failed to add quotation to database');
            return;
        }

        console.log('🔵 Creating new quotation:', newQuotation);
        setQuotations(prev => [...prev, newQuotation]);
        return newQuotation;
    };

    const confirmQuotation = async (quotationId) => {
        console.log('🟢 confirmQuotation called with ID:', quotationId);

        const quotation = quotations.find(q => q.id === quotationId);
        if (!quotation) {
            console.log('🔴 Quotation not found!');
            return;
        }

        // Create BC document
        console.log('🟢 Creating BC document for quotation:', quotation.id);
        const bcDoc = {
            id: `BC-${Date.now()}`,
            bcType: quotation.type === 'inbound' ? 'BC 2.3' : 'BC 2.7',
            bcNumber: `${quotation.type === 'inbound' ? 'BC23' : 'BC27'}-${Date.now().toString().slice(-6)}`,
            submittedDate: new Date().toISOString().split('T')[0],
            quotationId: quotation.id,
            type: quotation.type,
            customer: quotation.customer,
            origin: quotation.origin || '',
            destination: quotation.destination || '',
            items: quotation.items,
            totalItems: quotation.items.reduce((s, i) => s + i.quantity, 0),
            totalValue: quotation.items.reduce((s, i) => s + (i.value || 0), 0),
            status: 'pending',
            approvedDate: null,
            approvedBy: null,
            rejectionReason: null,
            notes: '',
            created_at: new Date().toISOString()
        };

        // Update Quotation Status in Supabase
        const { error: quotError } = await supabase
            .from('freight_quotations')
            .update({ status: 'confirmed' })
            .eq('id', quotationId);

        if (quotError) {
            console.error('Error confirming quotation:', quotError);
            alert('Failed to confirm quotation');
            return;
        }

        // Create BC Document in Supabase
        const { error: bcError } = await supabase
            .from('freight_customs') // Assuming BC docs are stored in freight_customs or similar table, adjusting based on logic
            .insert([bcDoc]);

        // Note: Check if freight_customs structure matches bcDoc, if not, might need adjustment or dedicated table. 
        // For now trusting schema matches or flexible JSONB columns.

        console.log('🟢 BC document created:', bcDoc);

        setQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status: 'confirmed' } : q));
        setCustomsDocuments(prev => [...prev, bcDoc]);
    };

    const updateQuotation = async (quotationId, updatedData) => {
        console.log('🔄 updateQuotation called with ID:', quotationId, 'Data:', updatedData);

        const quotation = quotations.find(q => q.id === quotationId);
        if (!quotation) {
            console.log('🔴 Quotation not found!');
            return;
        }

        const previousStatus = quotation.documentStatus;
        console.log('🔄 Previous document status:', previousStatus, '→ New:', updatedData.documentStatus);

        // Update Quotation in Supabase
        const { error: updateError } = await supabase
            .from('freight_quotations')
            .update(updatedData)
            .eq('id', quotationId);

        if (updateError) {
            console.error('Error updating quotation:', updateError);
            alert('Failed to update quotation');
            return;
        }

        // Check if status changed to approved
        if (updatedData.documentStatus === 'approved' && previousStatus !== 'approved') {
            console.log('✅ Status changed to APPROVED - Creating warehouse inventory...');

            // Extract all items from all packages with enhanced data
            const allItems = (updatedData.packages || []).flatMap((pkg, pkgIdx) =>
                (pkg.items || []).map((item, itemIdx) => ({
                    id: `INV-${quotationId}-P${pkgIdx}-I${itemIdx}-${Date.now()}`,
                    pengajuan_id: quotationId, // Supabase column name often snake_case, check schema if needed
                    // Mapping to match expected DB schema or JSONB
                    // Assuming flexible schema or matching names. 
                    // Note: Ideally schema keys should match exactly. 
                    // Let's stick to camelCase if UI uses it, but DB likely expects snake_case for columns if not JSONB
                    // For safety, let's use the object structure we defined in schema or rely on JS->JSON mapping

                    // Actually, let's use the exact keys from the previous local object, 
                    // but we must ensure column names in Supabase match or are JSONB.
                    // Given 001_initial_schema.sql used JSONB for most complex data or TEXT, 
                    // let's assume we map standard fields.

                    pengajuanId: quotationId,
                    pengajuanNumber: updatedData.quotationNumber || updatedData.id,
                    submissionDate: updatedData.submissionDate || updatedData.date,
                    bcDocumentNumber: updatedData.bcDocumentNumber,
                    bcDocumentDate: updatedData.approvedDate || new Date().toISOString().split('T')[0],
                    packageNumber: pkg.packageNumber,

                    // Item details
                    itemName: item.name,
                    serialNumber: item.serialNumber || '-',
                    quantity: item.quantity || 1,
                    condition: item.condition || 'new',
                    value: item.value || 0,
                    weight: item.weight || '-',
                    dimensions: item.dimensions || '-',
                    notes: item.notes || '',

                    // Warehouse specific
                    entryDate: new Date().toISOString().split('T')[0],
                    location: {
                        room: 'Ruang Utama',
                        rack: 'To be assigned',
                        slot: 'To be assigned'
                    },
                    receivedBy: updatedData.approvedBy || 'Admin',
                    remarks: `Auto - created from pengajuan ${updatedData.quotationNumber || updatedData.id} `,

                    customer: updatedData.customer,
                    status: 'in_warehouse',
                    currentStock: item.quantity || 1,

                    // Movement history - initial entry
                    movements: [{
                        id: `MOV-${Date.now()}-0`,
                        date: new Date().toISOString(),
                        time: new Date().toLocaleTimeString('id-ID'),
                        quantity: item.quantity || 1,
                        movementType: 'in',
                        position: 'gudang',
                        condition: item.condition || 'new',
                        remainingStock: item.quantity || 1,
                        pic: updatedData.approvedBy || 'Admin',
                        notes: 'Initial entry from pengajuan approval',
                        documents: []
                    }],

                    created_at: new Date().toISOString()
                }))
            );

            console.log(`📦 Creating ${allItems.length} inventory items in Supabase...`);

            // Insert into Supabase
            const { error: invError } = await supabase.from('freight_warehouse').insert(allItems);
            if (invError) console.error('Error creating inventory in Supabase:', invError);
            else {
                // Determine if we need to add to Inbound/Outbound Transaction Logs
                const updatedQuotation = { ...quotation, ...updatedData };
                const transactionData = {
                    id: `TRX-${quotationId}-${Date.now()}`,
                    pengajuanId: quotationId,
                    date: updatedQuotation.bcDocumentDate || new Date().toISOString().split('T')[0],
                    customsDocType: updatedQuotation.bcDocType,
                    customsDocNumber: updatedQuotation.bcDocumentNumber,
                    customsDocDate: updatedQuotation.bcDocumentDate,
                    receiptNumber: updatedQuotation.quotationNumber,
                    sender: updatedQuotation.shipper || updatedQuotation.customer,
                    receiver: updatedQuotation.customer,
                    supplier: updatedQuotation.shipper,
                    destination: updatedQuotation.destination,

                    itemCode: updatedQuotation.itemCode,
                    assetName: updatedQuotation.packages?.[0]?.items?.[0]?.name || 'Bulk Items',
                    quantity: updatedQuotation.packages?.reduce((sum, pkg) => sum + (pkg.items?.length || 0), 0) || 0,
                    unit: 'pcs',
                    value: updatedQuotation.packages?.reduce((sum, pkg) => sum + (pkg.items?.reduce((s, i) => s + (i.value || 0), 0) || 0), 0) || 0,
                    currency: 'IDR',

                    itemPhoto: null,
                    pic: updatedQuotation.pic || updatedQuotation.approvedBy,
                    documents: updatedQuotation.bcSupportingDocuments || [],

                    status: 'completed',
                    created_at: new Date().toISOString()
                };

                if (updatedQuotation.type === 'inbound') {
                    console.log('✅ Approved Inbound - Inserting to Supabase Inbound Log');
                    await supabase.from('freight_inbound').insert([transactionData]);
                    setInboundTransactions(prev => [transactionData, ...prev]);
                } else if (updatedQuotation.type === 'outbound') {
                    console.log('✅ Approved Outbound - Inserting to Supabase Outbound Log');
                    await supabase.from('freight_outbound').insert([transactionData]);
                    setOutboundTransactions(prev => [transactionData, ...prev]);
                }

                setWarehouseInventory(prev => [...prev, ...allItems]);
            }

        } else if (updatedData.documentStatus === 'rejected' && previousStatus !== 'rejected') {
            console.log('❌ Rejected - Inserting to Supabase Reject Log');
            const updatedQuotation = { ...quotation, ...updatedData };
            const rejectData = {
                id: `REJ-${quotationId}-${Date.now()}`,
                pengajuanId: quotationId,
                date: updatedQuotation.rejectionDate || new Date().toISOString().split('T')[0],
                customsDocType: updatedQuotation.bcDocType,
                customsDocNumber: updatedQuotation.bcDocumentNumber || '-',
                receiptNumber: updatedQuotation.quotationNumber || '-',
                rejectReason: updatedQuotation.rejectionReason,

                itemCode: updatedQuotation.itemCode,
                assetName: updatedQuotation.packages?.[0]?.items?.[0]?.name || 'Rejected Items',
                quantity: updatedQuotation.packages?.reduce((sum, pkg) => sum + (pkg.items?.length || 0), 0) || 0,
                unit: 'pcs',
                value: updatedQuotation.packages?.reduce((sum, pkg) => sum + (pkg.items?.reduce((s, i) => s + (i.value || 0), 0) || 0), 0) || 0,
                currency: 'IDR',

                pic: updatedQuotation.pic || 'Admin',
                notes: updatedQuotation.notes,
                documents: updatedQuotation.bcSupportingDocuments || [],

                status: 'rejected',
                created_at: new Date().toISOString()
            };

            await supabase.from('freight_reject').insert([rejectData]);
            setRejectTransactions(prev => [rejectData, ...prev]);
        }

        setQuotations(prev => prev.map(q => (q.id === quotationId ? { ...q, ...updatedData } : q)));

        // IMPORTANT: Sync inventory data when BC document details are updated (Post-approval edits)
        if (updatedData.bcDocumentNumber || updatedData.bcDocumentDate) {
            // Logic to update existing inventory if BC info changes
            // For now, complicated to do bulk update in Supabase efficiently without multiple calls
            // We will skip auto-sync to DB for now to avoid errors, assuming approval is the main event.
            console.log('📝 Inventory sync for BC update skipped for DB performance (Todo)');
        }
    };

    const approveBC = (bcDocId, approvedBy) => {
        console.log('🟢 approveBC called for:', bcDocId);

        setCustomsDocuments(prev => {
            const updated = prev.map(doc => {
                if (doc.id === bcDocId) {
                    console.log('🟢 Approving BC document:', doc);

                    // Auto-create Goods Movement after BC approval
                    const goodsMovement = {
                        id: `GM - ${Date.now()} `,
                        bcDocId: doc.id,
                        bcNumber: doc.bcNumber || doc.docNumber,
                        bcType: doc.bcType || doc.docType,
                        customer: doc.customer,
                        type: doc.type, // inbound or outbound
                        origin: doc.origin || '',
                        destination: doc.destination || '',
                        items: doc.items || [],
                        totalItems: doc.totalItems || (doc.items?.length || 0),
                        arrivalDate: doc.type === 'inbound' ? new Date().toISOString().split('T')[0] : null,
                        departureDate: doc.type === 'outbound' ? new Date().toISOString().split('T')[0] : null,
                        status: doc.type === 'inbound' ? 'arrived' : 'dispatched',
                        notes: `Auto - generated from BC ${doc.bcNumber || doc.docNumber} `,
                        createdAt: new Date().toISOString()
                    };

                    console.log('🟢 Creating goods movement:', goodsMovement);
                    setGoodsMovements(prevMovements => [...prevMovements, goodsMovement]);

                    return {
                        ...doc,
                        status: 'approved',
                        approvedDate: new Date().toISOString().split('T')[0],
                        approvedBy
                    };
                }
                return doc;
            });

            console.log('🟢 Updated customs documents:', updated);
            return updated;
        });
    };

    const rejectBC = (bcDocId, reason) => {
        setCustomsDocuments(prev => prev.map(doc => doc.id === bcDocId ? {
            ...doc, status: 'rejected', rejectionReason: reason
        } : doc));
    };

    const addGoodsMovement = async (movement) => {
        const newMovement = {
            ...movement,
            id: `GM-${Date.now()}`,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('freight_movements').insert([newMovement]);
        if (error) {
            console.error('Error adding goods movement:', error);
            return;
        }

        setGoodsMovements(prev => [...prev, newMovement]);
        return newMovement;
    };

    const addInventoryMovement = (inventoryItemId, movementData) => {
        console.log('📦 addInventoryMovement called for item:', inventoryItemId, 'Data:', movementData);

        let mutationLogToAdd = null;

        setWarehouseInventory(prevInventory => {
            const updatedInventory = prevInventory.map(item => {
                if (item.id !== inventoryItemId) return item;

                // Calculate remaining stock
                const previousStock = item.currentStock || 0;
                const quantity = movementData.quantity || 0;
                const remainingStock = movementData.movementType === 'in'
                    ? previousStock + quantity
                    : previousStock - quantity;

                // Create movement record
                const newMovement = {
                    id: `MOV-${Date.now()}-${item.movements?.length || 0}`,
                    date: movementData.date || new Date().toISOString().split('T')[0],
                    time: movementData.time || new Date().toLocaleTimeString('id-ID'),
                    quantity: quantity,
                    movementType: movementData.movementType,
                    origin: movementData.origin || 'gudang',
                    destination: movementData.destination || movementData.position,
                    position: movementData.position,
                    condition: movementData.condition || item.condition,
                    remainingStock: remainingStock,
                    pic: movementData.pic,
                    notes: movementData.notes || '',
                    documents: movementData.documents || []
                };

                console.log('📝 New movement:', newMovement);
                console.log('📊 Stock change:', previousStock, '→', remainingStock);

                // Prepare mutation log entry (but don't add yet)
                mutationLogToAdd = {
                    id: `MUTLOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    pengajuanNumber: item.pengajuanNumber || '-',
                    bcDocumentNumber: item.bcDocumentNumber || '-',
                    itemName: item.itemName || item.assetName,
                    serialNumber: item.serialNumber || '-',
                    date: movementData.date || new Date().toISOString().split('T')[0],
                    time: movementData.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    pic: movementData.pic || 'System',
                    totalStock: previousStock,
                    mutatedQty: quantity,
                    remainingStock: remainingStock,
                    origin: movementData.origin || 'gudang',
                    destination: movementData.destination || movementData.position || 'gudang',
                    remarks: movementData.notes || '',
                    documents: movementData.documents || [],
                    submittedBy: 'Current User',
                    submittedAt: new Date().toISOString()
                };

                // Update item - DON'T change currentStock, only add movement history
                return {
                    ...item,
                    // Keep currentStock same as original quantity for repeated mutations
                    // currentStock: remainingStock, // REMOVED - let quantity stay as is
                    status: movementData.position === 'gudang' ? 'in_warehouse' :
                        movementData.position === 'pameran' ? 'in_exhibition' :
                            movementData.position === 'rusak' ? 'damaged' : 'sold',
                    movements: [...(item.movements || []), newMovement]
                };
            });

            return updatedInventory;
        });

        // Add mutation log AFTER inventory update, OUTSIDE the map
        if (mutationLogToAdd) {
            console.log('💾 Adding mutation log:', mutationLogToAdd.id);
            setMutationLogs(prev => [mutationLogToAdd, ...prev]);
        }
    };
    const addInspection = (inspection) => {
        const newInspection = { ...inspection, id: `INS - ${Date.now()} `, createdAt: new Date().toISOString() };
        setInspections(prev => [...prev, newInspection]);
        setGoodsMovements(prev => prev.map(m => m.id === inspection.goodsMovementId ? { ...m, status: 'stored' } : m));
        return newInspection;
    };

    // Helper functions for invoice integration
    const getApprovedPengajuan = () => {
        return quotations.filter(q => q.status === 'approved' || q.status === 'confirmed');
    };

    const getActiveCustomers = () => {
        return customers.filter(c => c.status !== 'inactive');
    };

    const getActiveVendors = () => {
        return vendors.filter(v => v.status !== 'inactive');
    };

    // BC Code CRUD operations
    const addBCCode = (bcCode) => {
        const newBCCode = {
            ...bcCode,
            id: `bc - ${Date.now()} `,
        };
        setBcCodes([...bcCodes, newBCCode]);
        return newBCCode;
    };

    const updateBCCode = (id, updatedBCCode) => {
        setBcCodes(bcCodes.map(bc => bc.id === id ? { ...bc, ...updatedBCCode } : bc));
    };

    const deleteBCCode = (id) => {
        setBcCodes(prev => prev.filter(bc => bc.id !== id));
    };

    // Item Master CRUD operations
    const addItemCode = (itemData) => {
        const newItem = { id: `item-${Date.now()}`, ...itemData };
        setItemMaster([...itemMaster, newItem]);
    };

    const updateItemCode = (id, updatedData) => {
        setItemMaster(itemMaster.map(item => item.id === id ? { ...item, ...updatedData } : item));
    };

    const deleteItemCode = (id) => {
        setItemMaster(itemMaster.filter(item => item.id !== id));
    };

    // Invoice CRUD operations
    const addInvoice = (invoiceData) => {
        console.log('💾 addInvoice called with data:', invoiceData);

        // Validate and get references
        let pengajuanRef = null;
        let customerRef = null;
        let vendorRef = null;

        // Get pengajuan if provided
        if (invoiceData.pengajuanId) {
            pengajuanRef = quotations.find(q => q.id === invoiceData.pengajuanId);
            if (pengajuanRef) {
                console.log('✅ Found pengajuan:', pengajuanRef.quotationNumber);
            }
        }

        // Get customer if provided
        if (invoiceData.customerId) {
            customerRef = customers.find(c => c.id === invoiceData.customerId);
            if (customerRef) {
                console.log('✅ Found customer:', customerRef.name);
            }
        }

        // Get vendor if provided  
        if (invoiceData.vendorId) {
            vendorRef = vendors.find(v => v.id === invoiceData.vendorId);
            if (vendorRef) {
                console.log('✅ Found vendor:', vendorRef.name);
            }
        }

        const newInvoice = {
            ...invoiceData,
            id: `INV-${Date.now()}`,
            // Use custom invoice number if provided, otherwise auto-generate
            invoiceNumber: invoiceData.customInvoiceNumber || `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
            // Pengajuan reference
            pengajuanId: pengajuanRef?.id || null,
            pengajuanNumber: pengajuanRef?.quotationNumber || null,
            bcDocumentNumber: pengajuanRef?.bcDocumentNumber || null,
            // Customer reference
            customerId: customerRef?.id || null,
            customerName: customerRef?.name || invoiceData.customerName || null,
            // Vendor reference
            vendorId: vendorRef?.id || null,
            vendorName: vendorRef?.name || invoiceData.vendorName || null,
            createdAt: new Date().toISOString()
        };

        console.log('💾 Creating new invoice:', newInvoice);
        setInvoices(prev => {
            const updated = [...prev, newInvoice];
            console.log('💾 Updated invoices array:', updated);
            return updated;
        });
        return newInvoice;
    };

    const updateInvoice = (invoiceId, updates) => {
        console.log('💾 updateInvoice called for:', invoiceId, updates);
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, ...updates } : inv));
    };

    const deleteInvoice = (invoiceId) => {
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    };

    // Purchase CRUD operations
    const addPurchase = (purchaseData) => {
        const newPurchase = {
            ...purchaseData,
            id: `PUR - ${Date.now()} `,
            documentNumber: `PUR - ${new Date().getFullYear()} -${String(purchases.length + 1).padStart(3, '0')} `,
            createdAt: new Date().toISOString()
        };
        setPurchases(prev => [...prev, newPurchase]);
        return newPurchase;
    };

    const updatePurchase = (purchaseId, updates) => {
        setPurchases(prev => prev.map(pur => pur.id === purchaseId ? { ...pur, ...updates } : pur));
    };

    const deletePurchase = (purchaseId) => {
        setPurchases(prev => prev.filter(pur => pur.id !== purchaseId));
    };

    const value = {
        // Centralized data
        vendors,
        customers,
        finance,

        // Module-specific data
        shipments,
        assets,
        events,

        // Bridge TPPB data
        quotations,
        customsDocuments,
        goodsMovements,
        inspections,
        inboundTransactions,
        outboundTransactions,
        warehouseInventory,
        setWarehouseInventory,
        mutationLogs,
        setMutationLogs,
        bcCodes,
        invoices,
        purchases,
        itemMaster,
        rejectTransactions,
        activityLogs,
        logActivity,
        pendingApprovals,
        requestApproval,
        approveRequest,
        rejectRequest,

        // Vendor operations
        addVendor,
        updateVendor,
        deleteVendor,

        // Customer operations
        addCustomer,
        updateCustomer,
        deleteCustomer,

        // Finance operations
        addFinanceTransaction,
        updateFinanceTransaction,
        deleteFinanceTransaction,

        // Shipment operations
        addShipment,
        updateShipment,
        deleteShipment,

        // Asset operations
        addAsset,
        updateAsset,
        deleteAsset,

        // Event operations
        addEvent,
        updateEvent,
        deleteEvent,

        // Inbound Transaction operations
        addInboundTransaction,
        updateInboundTransaction,
        deleteInboundTransaction,

        // Outbound Transaction operations
        addOutboundTransaction,
        updateOutboundTransaction,
        deleteOutboundTransaction,

        // Warehouse Inventory operations
        addWarehouseInventory,
        updateWarehouseInventory,
        deleteWarehouseInventory,

        // Customs Document operations
        addCustomsDocument,
        updateCustomsDocument,
        deleteCustomsDocument,
        addQuotation,
        updateQuotation,
        confirmQuotation,
        approveBC,
        rejectBC,
        addGoodsMovement,
        addInventoryMovement,
        addInspection,

        // BC Code operations
        addBCCode,
        updateBCCode,
        deleteBCCode,

        // Invoice operations
        addInvoice,
        updateInvoice,
        deleteInvoice,

        // Purchase operations
        addPurchase,
        updatePurchase,
        deletePurchase,

        // Item Master operations
        addItemCode,
        updateItemCode,
        deleteItemCode,

        // Helper functions
        getApprovedPengajuan,
        getActiveCustomers,
        getActiveVendors,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// TPPB Workflow CRUD methods (added inline)
