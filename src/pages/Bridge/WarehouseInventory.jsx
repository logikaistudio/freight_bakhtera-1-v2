import React, { useState } from 'react';
import { Warehouse, Search, Eye, Package, Plus, Edit2, ArrowRightLeft, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Button from '../../components/Common/Button';
import PengajuanDetailView from '../../components/Warehouse/PengajuanDetailView';
import { exportToCSV } from '../../utils/exportCSV';

const WarehouseInventory = () => {
    const { warehouseInventory, quotations, addInventoryMovement } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPengajuan, setSelectedPengajuan] = useState(null);
    const [actionMenu, setActionMenu] = useState({ show: false, item: null, position: { x: 0, y: 0 } });

    console.log('📦 warehouseInventory:', warehouseInventory);
    console.log('📋 quotations:', quotations);

    // Filter inventory
    const filteredInventory = warehouseInventory.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const itemName = item.itemName || item.assetName || '';
        const pengajuanNo = item.pengajuanNumber || item.pengajuanId || '';
        const bcNo = item.bcDocumentNumber || '';
        const packageNo = item.packageNumber || '';

        return itemName.toLowerCase().includes(searchLower) ||
            pengajuanNo.toLowerCase().includes(searchLower) ||
            bcNo.toLowerCase().includes(searchLower) ||
            packageNo.toLowerCase().includes(searchLower);
    });

    // Get unique pengajuan for display
    const uniquePengajuanIds = [...new Set(filteredInventory.map(item => item.pengajuanId))];
    const displayItems = uniquePengajuanIds.map(pengajuanId => {
        const items = warehouseInventory.filter(i => i.pengajuanId === pengajuanId);
        return items[0]; // Return first item as representative
    });

    const handleRowClick = (item, event) => {
        event.preventDefault();
        // Find the full pengajuan data
        const pengajuan = quotations.find(q => q.id === item.pengajuanId || q.quotationNumber === item.pengajuanNumber);
        if (pengajuan) {
            setSelectedPengajuan(pengajuan);
        } else {
            alert('⚠️ Pengajuan data not found');
        }
        setActionMenu({ show: false, item: null, position: { x: 0, y: 0 } });
    };

    const handleEditClick = () => {
        // TODO: Implement edit modal
        alert('✏️ Edit feature coming soon!');
        setActionMenu({ show: false, item: null, position: { x: 0, y: 0 } });
    };

    const handleSubmitMutations = (mutations) => {
        console.log('💾 Submitting mutations:', mutations);

        mutations.forEach(mut => {
            // Find the inventory item for this mutation
            const inventoryItem = warehouseInventory.find(item =>
                item.id === mut.itemId ||
                (item.serialNumber === mut.serialNumber && item.itemName === mut.itemName)
            );

            if (!inventoryItem) {
                console.error('❌ Inventory item not found for mutation:', mut);
                return;
            }

            console.log('✅ Found inventory item:', inventoryItem.id, inventoryItem.itemName);

            // Call addInventoryMovement with complete data
            addInventoryMovement(inventoryItem.id, {
                quantity: mut.quantity,
                movementType: 'out',
                position: mut.destination,
                origin: mut.origin,
                destination: mut.destination,
                date: mut.date,
                time: mut.time,
                pic: mut.pic,
                documents: mut.documents,
                notes: `Mutasi dari ${mut.origin} ke ${mut.destination}`
            });
        });

        console.log('✅ All mutations processed');
    };

    const handleUpdatePengajuan = (updates) => {
        if (!selectedPengajuan) return;

        // Update all inventory items for this pengajuan
        const updatedInventory = warehouseInventory.map(item => {
            if (item.pengajuanId === selectedPengajuan.id ||
                item.pengajuanNumber === selectedPengajuan.quotationNumber) {
                return {
                    ...item,
                    location: updates.location,
                    remarks: updates.remarks,
                    notes: updates.remarks
                };
            }
            return item;
        });

        // Update in DataContext
        const event = new CustomEvent('updateWarehouseInventory', {
            detail: updatedInventory
        });
        window.dispatchEvent(event);

        console.log('✅ Updated inventory for pengajuan:', selectedPengajuan.quotationNumber);
    };

    const handleCloseDetail = () => {
        setSelectedPengajuan(null);
    };

    const handleCloseActionMenu = () => {
        setActionMenu({ show: false, item: null, position: { x: 0, y: 0 } });
    };

    const formatLocation = (location) => {
        if (typeof location === 'string') return location;
        if (location && typeof location === 'object') {
            return `${location.room || 'N/A'} / ${location.rack || 'N/A'} / ${location.slot || 'N/A'}`;
        }
        return 'TPPB';
    };

    // Export to CSV handler
    const handleExportCSV = () => {
        const exportData = displayItems.map(item => {
            const pengajuanItems = warehouseInventory.filter(i => i.pengajuanId === item.pengajuanId);
            const uniquePackages = [...new Set(pengajuanItems.map(i => i.packageNumber))];

            // Calculate outbound quantities (items with movements or exitDate)
            const outboundItems = pengajuanItems.filter(i => i.exitDate || (i.movements && i.movements.some(m => m.movementType === 'out')));
            const outboundPackages = [...new Set(outboundItems.map(i => i.packageNumber))];

            return {
                pengajuanNumber: item.pengajuanNumber || item.pengajuanId || '-',
                itemCode: item.itemCode || '-',
                bcDocumentNumber: item.bcDocumentNumber || '-',
                packageCountIn: uniquePackages.length,
                itemCountIn: pengajuanItems.length,
                packageCountOut: outboundPackages.length,
                itemCountOut: outboundItems.length,
                entryDate: item.submissionDate || item.entryDate,
                exitDate: item.exitDate || '-',
                locationRoom: item.location?.room || '-',
                locationRack: item.location?.rack || '-',
                locationSlot: item.location?.slot || '-',
                remarks: item.remarks || item.notes || '-'
            };
        });

        const columns = [
            { key: 'pengajuanNumber', header: 'No. Pendaftaran' },
            { key: 'itemCode', header: 'Kode Barang' },
            { key: 'bcDocumentNumber', header: 'No. Dokumen' },
            { key: 'packageCountIn', header: 'Jumlah Package Masuk' },
            { key: 'itemCountIn', header: 'Jumlah Item Masuk' },
            { key: 'packageCountOut', header: 'Jumlah Package Keluar' },
            { key: 'itemCountOut', header: 'Jumlah Item Keluar' },
            { key: 'entryDate', header: 'Tanggal Masuk' },
            { key: 'exitDate', header: 'Tanggal Keluar' },
            { key: 'locationRoom', header: 'Ruang' },
            { key: 'locationRack', header: 'Rak' },
            { key: 'locationSlot', header: 'Slot' },
            { key: 'remarks', header: 'Keterangan' }
        ];

        exportToCSV(exportData, 'Inventaris_Gudang', columns);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Inventaris Gudang</h1>
                    <p className="text-silver-dark mt-1">Tracking & Movement Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-accent-blue">{filteredInventory.length}</p>
                        <p className="text-sm text-silver-dark">Total Items</p>
                    </div>
                    <Button
                        onClick={handleExportCSV}
                        variant="secondary"
                        icon={Download}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="glass-card p-4 rounded-lg">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver-dark w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama barang, no. pengajuan, no. pabean, atau no. package..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light focus:border-accent-blue focus:outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-accent-blue">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">No. Pendaftaran</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Kode Barang</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">No. Dokumen</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Jumlah Package Masuk</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Jumlah Item Masuk</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Jumlah Package Keluar</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Jumlah Item Keluar</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tanggal Masuk</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tanggal Keluar</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Lokasi</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {displayItems.map(item => {
                                // Group items by pengajuanId to count packages and items
                                const pengajuanItems = warehouseInventory.filter(i => i.pengajuanId === item.pengajuanId);
                                const uniquePackages = [...new Set(pengajuanItems.map(i => i.packageNumber))];
                                const totalItems = pengajuanItems.length;

                                return (
                                    <tr
                                        key={item.pengajuanId || item.id}
                                        className="hover:bg-dark-surface smooth-transition cursor-pointer"
                                        onClick={(e) => handleRowClick(item, e)}
                                    >
                                        <td className="px-4 py-3 text-sm text-silver-light font-medium">
                                            {item.pengajuanNumber || item.pengajuanId || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-silver-light font-mono text-xs">
                                            {item.itemCode || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-accent-blue font-medium">
                                            {item.bcDocumentNumber || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-silver text-center">
                                            {uniquePackages.length}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-silver text-center">
                                            {totalItems}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-silver-dark text-center">
                                            {(() => {
                                                const outboundItems = pengajuanItems.filter(i => i.exitDate || (i.movements && i.movements.some(m => m.movementType === 'out')));
                                                const outboundPackages = [...new Set(outboundItems.map(i => i.packageNumber))];
                                                return outboundPackages.length;
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-silver-dark text-center">
                                            {(() => {
                                                const outboundItems = pengajuanItems.filter(i => i.exitDate || (i.movements && i.movements.some(m => m.movementType === 'out')));
                                                return outboundItems.length;
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-silver text-center">
                                            {new Date(item.submissionDate || item.entryDate).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-silver text-center">
                                            {item.exitDate ? new Date(item.exitDate).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-silver">
                                            {item.location?.room || '-'} / {item.location?.rack || '-'} / {item.location?.slot || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-silver-dark max-w-xs truncate">
                                            {item.remarks || item.notes || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {displayItems.length === 0 && (
                    <div className="text-center py-12">
                        <Warehouse className="w-16 h-16 text-silver-dark mx-auto mb-4" />
                        <p className="text-silver-dark">Belum ada data inventaris</p>
                    </div>
                )}
            </div>

            {/* Pengajuan Detail View */}
            {selectedPengajuan && (
                <PengajuanDetailView
                    pengajuan={selectedPengajuan}
                    onClose={handleCloseDetail}
                    onSubmitMutations={handleSubmitMutations}
                    onUpdatePengajuan={handleUpdatePengajuan}
                />
            )}
        </div>
    );
};

export default WarehouseInventory;
