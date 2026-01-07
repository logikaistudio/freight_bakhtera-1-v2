import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Common/Button';
import {
    Ship,
    Container,
    Trash2,
    Download,
    Printer,
    Search
} from 'lucide-react';
import { exportBLCertificateToExcel, exportSellingBuyingReport } from '../../utils/excelExport';
import { printBLCertificate } from '../../utils/printUtils';

const BLManagement = () => {
    const [bls, setBls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBL, setSelectedBL] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // State for local editing in modal
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchBLs();
    }, []);

    // Initialize edit form when selectedBL changes
    useEffect(() => {
        if (selectedBL) {
            setEditForm({
                status: selectedBL.status,
                blNumber: selectedBL.blNumber !== '-' ? selectedBL.blNumber : '',
                blDate: selectedBL.createdAt ? new Date(selectedBL.createdAt).toISOString().split('T')[0] : ''
            });
            setIsEditing(false);
        }
    }, [selectedBL]);

    const fetchBLs = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching BL data from Supabase...');

            // ✅ Fetch SEMUA shipments (tidak filter bl_number)
            const { data: shipments, error } = await supabase
                .from('blink_shipments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }

            console.log(`📦 Fetched ${shipments?.length || 0} shipments from database`);
            console.log('Raw shipment data:', shipments);

            // Transform shipment data ke BL format
            const blData = (shipments || []).map(ship => ({
                id: ship.id,
                blType: ship.bl_type || 'MBL',
                blNumber: ship.bl_number || ship.awb_number || '-', // ✅ Show '-' jika belum ada BL
                hasBL: !!ship.bl_number, // ✅ Indicator apakah sudah punya BL
                jobNumber: ship.job_number,
                shipperName: ship.shipper || 'N/A',
                consigneeName: ship.customer || 'N/A',
                vessel: ship.vessel_name || ship.booking?.vesselName || '',
                voyage: ship.voyage || ship.booking?.voyageNumber || '',
                portOfLoading: ship.origin || ship.booking?.portOfLoading || '',
                portOfDischarge: ship.destination || ship.booking?.portOfDischarge || '',
                containerNumber: ship.container_number || (ship.containers?.[0]?.containerNumber) || 'Part Load / Bulk',
                sealNumber: ship.seal_number || (ship.containers?.[0]?.sealNumber) || '-',
                cargoDescription: ship.commodity || ship.cargo_description || 'General Cargo',
                mbl: ship.mbl || '',
                hbl: ship.hbl || '',
                mawb: ship.mawb || '',
                hawb: ship.hawb || '',
                soNumber: ship.so_number || '',
                grossWeight: ship.weight || '',
                measurement: ship.volume || '',
                currency: ship.currency || 'USD',
                status: ship.bl_status || 'draft',
                createdAt: ship.created_at,
                // Service items would come from separate table or JSON field
                serviceItems: ship.service_items || [],
                // Calculate profit
                sellingTotal: ship.quoted_amount || 0,
                buyingTotal: ship.actual_cost || 0,
                profit: (ship.quoted_amount || 0) - (ship.actual_cost || 0),
                margin: ship.quoted_amount > 0
                    ? (((ship.quoted_amount - (ship.actual_cost || 0)) / ship.quoted_amount) * 100).toFixed(1)
                    : 0
            }));

            console.log(`✅ Transformed ${blData.length} BL records`);
            console.log('BL data sample:', blData[0]);
            setBls(blData);
            setError(null);
        } catch (error) {
            console.error('❌ Error fetching BLs:', error);
            setError(error.message || 'Failed to fetch BL data');
            setBls([]);
        } finally {
            setLoading(false);
        }
    };

    const blTypeConfig = {
        'MBL': {
            color: 'bg-blue-500/20 text-blue-400',
            desc: 'Master BL - Issued by shipping line',
            icon: Ship
        },
        'HBL': {
            color: 'bg-orange-500/20 text-orange-400',
            desc: 'House BL - Issued by forwarder',
            icon: Container
        },
    };

    const statusConfig = {
        draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400' },
        issued: { label: 'Issued', color: 'bg-blue-500/20 text-blue-400' },
        in_transit: { label: 'In Transit', color: 'bg-purple-500/20 text-purple-400' },
        arrived: { label: 'Arrived', color: 'bg-green-500/20 text-green-400' },
        delivered: { label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-400' },
    };

    // Filter BLs - search only
    const filteredBLs = bls.filter(bl => {
        if (!searchTerm) return true;
        return bl.blNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bl.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bl.consigneeName?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleDeleteBL = async (blId) => {
        if (!confirm('Yakin hapus BL ini? Data BL akan dihapus dari shipment.')) return;

        try {
            const { error } = await supabase
                .from('blink_shipments')
                .update({
                    bl_number: null,
                    bl_type: null,
                    bl_status: null
                })
                .eq('id', blId);

            if (error) throw error;

            alert('✅ BL berhasil dihapus');
            fetchBLs();
        } catch (error) {
            console.error('Error deleting BL:', error);
            alert('❌ Gagal menghapus BL');
        }
    };


    const handleExportCertificate = (bl) => {
        try {
            const filename = exportBLCertificateToExcel(bl);
            alert(`Certificate exported: ${filename}`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export certificate');
        }
    };

    const handleExportAllReport = () => {
        try {
            const filename = exportSellingBuyingReport(bls, 'BL');
            alert(`Report exported: ${filename}`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export report');
        }
    };

    const handlePrintBL = (bl) => {
        try {
            printBLCertificate(bl);
        } catch (error) {
            console.error('Print error:', error);
            alert('Failed to print BL');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="glass-card p-8 rounded-lg text-center">
                    <div className="text-red-400 text-2xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-silver-light mb-2">Error Loading BL Data</h3>
                    <p className="text-silver-dark mb-4">{error}</p>
                    <Button onClick={fetchBLs}>Retry</Button>
                </div>
            </div>
        );
    }

    const handleUpdateBL = async () => {
        try {
            const { error } = await supabase
                .from('blink_shipments')
                .update({
                    bl_status: editForm.status,
                    bl_number: editForm.blNumber || null,
                    // If we had a bl_date column we would update it here
                    // For now assuming createdAt or created_at handles date, or we add bl_date if exists
                })
                .eq('id', selectedBL.id);

            if (error) throw error;

            alert('✅ Document updated successfully');
            setIsEditing(false);
            fetchBLs(); // Refresh list
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating document:', error);
            alert('❌ Failed to update document');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Document BL/AWB</h1>
                    <p className="text-silver-dark mt-1">Daftar Dokumen BL dan AWB</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        icon={Download}
                        onClick={handleExportAllReport}
                        disabled={bls.length === 0}
                    >
                        Export All
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-lg">
                    <p className="text-xs text-silver-dark">Total BLs</p>
                    <p className="text-2xl font-bold text-silver-light mt-1">{bls.length}</p>
                </div>
                <div className="glass-card p-4 rounded-lg">
                    <p className="text-xs text-silver-dark">Master BL</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">
                        {bls.filter(b => b.blType === 'MBL').length}
                    </p>
                </div>
                <div className="glass-card p-4 rounded-lg">
                    <p className="text-xs text-silver-dark">House BL</p>
                    <p className="text-2xl font-bold text-orange-400 mt-1">
                        {bls.filter(b => b.blType === 'HBL').length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-silver-dark" />
                <input
                    type="text"
                    placeholder="Search BL Number, Job Number, or Consignee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-silver-light"
                />
            </div>

            {/* BL Table */}
            <div className="glass-card rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-accent-orange">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">No. AWB/BL</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Tanggal</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">No. SO</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Consignee</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {filteredBLs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-12 text-center">
                                        <Ship className="w-12 h-12 text-silver-dark mx-auto mb-3" />
                                        <p className="text-silver-dark">
                                            {searchTerm ? 'No BLs match your search' : 'Belum ada Bill of Lading'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBLs.map((bl) => {
                                    const TypeIcon = blTypeConfig[bl.blType]?.icon || Ship;
                                    return (
                                        <tr
                                            key={bl.id}
                                            onClick={() => {
                                                setSelectedBL(bl);
                                                setShowEditModal(true);
                                            }}
                                            className="hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-accent-orange">
                                                        {bl.blNumber !== '-' ? bl.blNumber : (
                                                            bl.mbl || bl.hbl || bl.mawb || bl.hawb || '-'
                                                        )}
                                                    </span>
                                                    {(bl.mbl || bl.mawb) && (
                                                        <span className="text-xs text-silver-dark">M: {bl.mbl || bl.mawb}</span>
                                                    )}
                                                    {(bl.hbl || bl.hawb) && (
                                                        <span className="text-xs text-silver-dark">H: {bl.hbl || bl.hawb}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-silver-light">
                                                    {bl.createdAt ? new Date(bl.createdAt).toLocaleDateString('id-ID') : '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-silver-light">{bl.soNumber || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-silver-light">{bl.consigneeName}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon className="w-4 h-4" />
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${blTypeConfig[bl.blType]?.color}`}>
                                                        {bl.blType}
                                                    </span>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BL Edit/View Modal */}
            {showEditModal && selectedBL && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-silver-light">
                                    {selectedBL.hasBL ? `Document Details` : 'Shipment Details'}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-silver-dark mt-1">SO Number: {selectedBL.soNumber} | Job: {selectedBL.jobNumber}</p>
                            </div>
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button size="sm" onClick={handleUpdateBL}>Save</Button>
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedBL(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 dark:text-silver-dark dark:hover:text-silver-light text-2xl font-bold ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - BL Details */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-white dark:bg-dark-card">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">BL Type</label>
                                        <div className="text-gray-900 dark:text-silver-light font-medium mt-1">{selectedBL.blType}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">BL Number</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.blNumber}
                                                onChange={(e) => setEditForm({ ...editForm, blNumber: e.target.value })}
                                                className="w-full mt-1 px-2 py-1 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded text-gray-900 dark:text-silver-light"
                                            />
                                        ) : (
                                            <div className="text-accent-orange font-medium mt-1">
                                                {selectedBL.hasBL ? selectedBL.blNumber : 'Not Generated Yet'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">Vessel</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">{selectedBL.vessel || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">Voyage</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">{selectedBL.voyage || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">Container Number</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">{selectedBL.containerNumber || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">MBL / MAWB</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">{selectedBL.mbl || selectedBL.mawb || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">HBL / HAWB</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">{selectedBL.hbl || selectedBL.hawb || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">Seal Number</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">{selectedBL.sealNumber || '-'}</div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">Consignee</label>
                                        <div className="text-gray-900 dark:text-silver-light font-medium mt-1">{selectedBL.consigneeName}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">Route</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">
                                            {selectedBL.portOfLoading} → {selectedBL.portOfDischarge}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">Cargo Description</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">{selectedBL.cargoDescription || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">Weight</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">{selectedBL.grossWeight || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-silver-dark font-semibold uppercase">Measurement</label>
                                        <div className="text-gray-900 dark:text-silver-light mt-1">{selectedBL.measurement || '-'}</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer - Action Buttons */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                            <Button
                                variant="secondary"
                                icon={Printer}
                                onClick={() => {
                                    handlePrintBL(selectedBL);
                                    setShowEditModal(false);
                                }}
                            >
                                Print BL
                            </Button>
                            <Button
                                variant="secondary"
                                icon={Download}
                                onClick={() => {
                                    handleExportCertificate(selectedBL);
                                    setShowEditModal(false);
                                }}
                            >
                                Export
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedBL(null);
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BLManagement;
