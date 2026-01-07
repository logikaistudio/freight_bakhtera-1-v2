import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import { Printer, Download, Edit, Save, X } from 'lucide-react';
import { printBLCertificate } from '../../utils/printUtils';
import { exportBLCertificateToExcel } from '../../utils/excelExport';

const BLPreviewModal = ({ isOpen, onClose, blData: initialData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(initialData);

    // Update edited data when initialData changes
    React.useEffect(() => {
        setEditedData(initialData);
        setIsEditing(false);
    }, [initialData]);

    if (!initialData) return null;

    const handleFieldChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleServiceItemChange = (index, field, value) => {
        const newItems = [...editedData.serviceItems];
        newItems[index] = {
            ...newItems[index],
            [field]: parseFloat(value) || 0
        };

        // Recalculate selling/buying total and profit
        const item = newItems[index];
        item.sellingTotal = item.qty * item.sellingRate;
        item.buyingTotal = item.qty * item.buyingRate;
        item.profit = item.sellingTotal - item.buyingTotal;
        item.margin = item.sellingTotal > 0 ? (item.profit / item.sellingTotal) * 100 : 0;

        // Recalculate grand total
        const grandTotal = newItems.reduce((acc, itm) => ({
            selling: acc.selling + itm.sellingTotal,
            buying: acc.buying + itm.buyingTotal,
            profit: acc.profit + itm.profit
        }), { selling: 0, buying: 0, profit: 0 });

        grandTotal.margin = grandTotal.selling > 0
            ? (grandTotal.profit / grandTotal.selling) * 100
            : 0;

        setEditedData(prev => ({
            ...prev,
            serviceItems: newItems,
            grandTotal
        }));
    };

    const handlePrint = () => {
        printBLCertificate(editedData);
    };

    const handleExport = () => {
        try {
            const filename = exportBLCertificateToExcel(editedData);
            alert(`Exported: ${filename}`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`BL Preview & Edit - ${editedData.blNumber}`}
            size="full"
        >
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex justify-between items-center pb-4 border-b border-dark-border">
                    <div className="flex gap-3">
                        <Button
                            icon={isEditing ? Save : Edit}
                            variant={isEditing ? 'primary' : 'secondary'}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Done Editing' : 'Edit Data'}
                        </Button>
                    </div>
                    <div className="flex gap-3">
                        <Button icon={Printer} onClick={handlePrint}>
                            Print Certificate
                        </Button>
                        <Button icon={Download} variant="secondary" onClick={handleExport}>
                            Export Excel
                        </Button>
                    </div>
                </div>

                {/* BL Information */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-silver-light border-b border-dark-border pb-2">
                            BL Information
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-silver-dark">Job Number</label>
                                <input
                                    type="text"
                                    value={editedData.jobNumber || ''}
                                    onChange={(e) => handleFieldChange('jobNumber', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-silver-dark">BL Number</label>
                                <input
                                    type="text"
                                    value={editedData.blNumber}
                                    onChange={(e) => handleFieldChange('blNumber', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-silver-dark">Bill To (Customer)</label>
                            <input
                                type="text"
                                value={editedData.customer || ''}
                                onChange={(e) => handleFieldChange('customer', e.target.value)}
                                disabled={!isEditing}
                                className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-silver-dark">Address</label>
                            <textarea
                                value={editedData.customerAddress || ''}
                                onChange={(e) => handleFieldChange('customerAddress', e.target.value)}
                                disabled={!isEditing}
                                rows={2}
                                className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-silver-dark">Consignee</label>
                            <input
                                type="text"
                                value={editedData.consignee || ''}
                                onChange={(e) => handleFieldChange('consignee', e.target.value)}
                                disabled={!isEditing}
                                className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-silver-dark">Consignee Address</label>
                            <textarea
                                value={editedData.consigneeAddress || ''}
                                onChange={(e) => handleFieldChange('consigneeAddress', e.target.value)}
                                disabled={!isEditing}
                                rows={2}
                                className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-silver-light border-b border-dark-border pb-2">
                            Shipping Details
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-silver-dark">Shipping Line</label>
                                <input
                                    type="text"
                                    value={editedData.shippingLine}
                                    onChange={(e) => handleFieldChange('shippingLine', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-silver-dark">Vessel/Voyage</label>
                                <input
                                    type="text"
                                    value={editedData.vesselVoyage}
                                    onChange={(e) => handleFieldChange('vesselVoyage', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-silver-dark">Port of Loading</label>
                                <input
                                    type="text"
                                    value={editedData.origin}
                                    onChange={(e) => handleFieldChange('origin', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-silver-dark">Port of Discharge</label>
                                <input
                                    type="text"
                                    value={editedData.destination}
                                    onChange={(e) => handleFieldChange('destination', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-silver-dark">Container Number</label>
                                <input
                                    type="text"
                                    value={editedData.containerNumber || ''}
                                    onChange={(e) => handleFieldChange('containerNumber', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-silver-dark">Container Type</label>
                                <input
                                    type="text"
                                    value={editedData.containerType || ''}
                                    onChange={(e) => handleFieldChange('containerType', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-silver-dark">Seal Number</label>
                                <input
                                    type="text"
                                    value={editedData.sealNumber || ''}
                                    onChange={(e) => handleFieldChange('sealNumber', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-silver-dark">Measurement</label>
                                <input
                                    type="text"
                                    value={editedData.measurement || ''}
                                    onChange={(e) => handleFieldChange('measurement', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-silver-dark">Gross Weight</label>
                                <input
                                    type="text"
                                    value={editedData.grossWeight || ''}
                                    onChange={(e) => handleFieldChange('grossWeight', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full mt-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-silver-light disabled:opacity-60"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Items Table */}
                <div>
                    <h3 className="text-lg font-semibold text-silver-light border-b border-dark-border pb-2 mb-4">
                        Service Items Breakdown
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-dark-surface">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-silver-dark">Description</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-silver-dark">Qty</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-silver-dark">Unit</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-green-400">Selling Rate</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-orange-400">Buying Rate</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-emerald-400">Profit</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-purple-400">Margin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {editedData.serviceItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-dark-surface">
                                        <td className="px-3 py-2 text-silver-light">{item.description}</td>
                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.qty}
                                                onChange={(e) => handleServiceItemChange(idx, 'qty', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-16 px-2 py-1 bg-dark-card border border-dark-border rounded text-center text-silver-light disabled:opacity-60"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center text-silver-dark text-xs">{item.unit}</td>
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={item.sellingRate}
                                                onChange={(e) => handleServiceItemChange(idx, 'sellingRate', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-24 px-2 py-1 bg-dark-card border border-dark-border rounded text-right text-green-400 disabled:opacity-60"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={item.buyingRate}
                                                onChange={(e) => handleServiceItemChange(idx, 'buyingRate', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-24 px-2 py-1 bg-dark-card border border-dark-border rounded text-right text-orange-400 disabled:opacity-60"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right font-semibold text-emerald-400">
                                            ${item.profit.toFixed(0)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.margin >= 30 ? 'bg-green-500/20 text-green-400' :
                                                    item.margin >= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {item.margin.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-dark-card border-t-2 border-accent-orange">
                                <tr>
                                    <td colSpan="3" className="px-3 py-3 text-left font-bold text-silver-light">
                                        GRAND TOTAL
                                    </td>
                                    <td className="px-3 py-3 text-right font-bold text-green-400 text-lg">
                                        ${editedData.grandTotal.selling.toFixed(0)}
                                    </td>
                                    <td className="px-3 py-3 text-right font-bold text-orange-400 text-lg">
                                        ${editedData.grandTotal.buying.toFixed(0)}
                                    </td>
                                    <td className="px-3 py-3 text-right font-bold text-emerald-400 text-lg">
                                        ${editedData.grandTotal.profit.toFixed(0)}
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <span className="px-3 py-1 rounded font-bold text-sm bg-purple-500/30 text-purple-300">
                                            {editedData.grandTotal.margin.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default BLPreviewModal;
