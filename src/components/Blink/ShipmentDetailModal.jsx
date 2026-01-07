import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import {
    Ship,
    Edit,
    Truck,
    Package,
    MapPin,
    Calendar,
    User,
    FileText,
    Container,
    Save,
    X,
    Plane
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShipmentDetailModal = ({ isOpen, onClose, shipment, onUpdate }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editedShipment, setEditedShipment] = useState(shipment || {});
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [showContainerModal, setShowContainerModal] = useState(false);
    const [containers, setContainers] = useState(shipment?.containers || []);
    const [newContainer, setNewContainer] = useState({
        containerNumber: '',
        containerType: '20ft',
        sealNumber: '',
        vgm: ''
    });

    if (!shipment) return null;

    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', next: 'confirmed' },
        confirmed: { label: 'Confirmed', color: 'bg-blue-500/20 text-blue-400', next: 'booked' },
        booked: { label: 'Booked', color: 'bg-indigo-500/20 text-indigo-400', next: 'in_transit' },
        in_transit: { label: 'In Transit', color: 'bg-purple-500/20 text-purple-400', next: 'arrived' },
        arrived: { label: 'Arrived', color: 'bg-green-500/20 text-green-400', next: 'customs_clearance' },
        customs_clearance: { label: 'Customs Clearance', color: 'bg-orange-500/20 text-orange-400', next: 'delivered' },
        delivered: { label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-400', next: 'completed' },
        completed: { label: 'Completed', color: 'bg-teal-500/20 text-teal-400', next: null }
    };

    const containerTypes = ['20ft', '40ft', '40ft HC', '45ft HC'];

    const handleSaveEdit = () => {
        onUpdate(editedShipment);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedShipment(shipment);
        setIsEditing(false);
    };

    const handleStatusUpdate = () => {
        const updatedShipment = {
            ...shipment,
            status: newStatus,
            statusHistory: [
                ...(shipment.statusHistory || []),
                {
                    status: newStatus,
                    timestamp: new Date().toISOString(),
                    notes: statusNotes
                }
            ]
        };
        onUpdate(updatedShipment);
        setShowStatusModal(false);
        setStatusNotes('');
    };

    const handleAddContainer = () => {
        if (!newContainer.containerNumber) {
            alert('Container number is required');
            return;
        }

        const updatedContainers = [...containers, { ...newContainer, id: Date.now() }];
        setContainers(updatedContainers);

        const updatedShipment = {
            ...shipment,
            containers: updatedContainers
        };
        onUpdate(updatedShipment);

        // Reset form
        setNewContainer({
            containerNumber: '',
            containerType: '20ft',
            sealNumber: '',
            vgm: ''
        });
        setShowContainerModal(false);
    };

    const handleDeleteContainer = (containerId) => {
        const updatedContainers = containers.filter(c => c.id !== containerId);
        setContainers(updatedContainers);

        const updatedShipment = {
            ...shipment,
            containers: updatedContainers
        };
        onUpdate(updatedShipment);
    };

    const handleCreateBL = () => {
        // Navigate to BL Management with pre-filled data
        localStorage.setItem('bl_prefill_data', JSON.stringify({
            jobNumber: shipment.jobNumber,
            customer: shipment.customer,
            customerId: shipment.customerId,
            origin: shipment.origin,
            destination: shipment.destination,
            cargoType: shipment.cargoType,
            weight: shipment.weight,
            volume: shipment.volume,
            commodity: shipment.commodity,
            containers: containers,
            serviceType: shipment.serviceType
        }));
        navigate('/blink/bl');
        onClose();
    };

    const handleCreateAWB = () => {
        // Navigate to AWB Management with pre-filled data
        localStorage.setItem('awb_prefill_data', JSON.stringify({
            jobNumber: shipment.jobNumber,
            customer: shipment.customer,
            customerId: shipment.customerId,
            origin: shipment.origin,
            destination: shipment.destination,
            weight: shipment.weight,
            volume: shipment.volume,
            commodity: shipment.commodity,
            serviceType: shipment.serviceType
        }));
        navigate('/blink/awb');
        onClose();
    };

    const getShipmentType = () => {
        if (shipment.quotationType) {
            return shipment.quotationType === 'RG' ? 'Regular' : 'Non-Regular';
        }
        return shipment.type === 'regular' ? 'Regular' : 'Non-Regular';
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Shipment Detail - ${shipment.jobNumber}`}
                size="large"
            >
                <div className="space-y-6">
                    {/* Header with Status and Actions */}
                    <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                        <div className="flex items-center gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-accent-orange">{shipment.jobNumber}</h3>
                                {shipment.soNumber && (
                                    <p className="text-sm text-silver-dark mt-1">SO: {shipment.soNumber}</p>
                                )}
                            </div>
                            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusConfig[shipment.status]?.color}`}>
                                {statusConfig[shipment.status]?.label || shipment.status}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    icon={Edit}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        icon={X}
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        icon={Save}
                                        onClick={handleSaveEdit}
                                    >
                                        Save
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Basic Info */}
                        <div className="space-y-4">
                            {/* Customer Information */}
                            <div className="glass-card p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <User className="w-4 h-4 text-accent-orange" />
                                    <h4 className="font-semibold text-silver-light">Customer Information</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-silver-dark">Customer:</span>
                                        <span className="text-silver-light font-medium">{shipment.customer}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver-dark">Sales Person:</span>
                                        <span className="text-silver-light">{shipment.salesPerson || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver-dark">Type:</span>
                                        <span className="text-silver-light">{getShipmentType()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Route & Service */}
                            <div className="glass-card p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4 text-accent-orange" />
                                    <h4 className="font-semibold text-silver-light">Route & Service</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {isEditing ? (
                                        <>
                                            <div>
                                                <label className="text-silver-dark text-xs">Origin</label>
                                                <input
                                                    type="text"
                                                    value={editedShipment.origin}
                                                    onChange={(e) => setEditedShipment({ ...editedShipment, origin: e.target.value })}
                                                    className="w-full mt-1 px-2 py-1 bg-dark-surface border border-dark-border rounded text-silver-light"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-silver-dark text-xs">Destination</label>
                                                <input
                                                    type="text"
                                                    value={editedShipment.destination}
                                                    onChange={(e) => setEditedShipment({ ...editedShipment, destination: e.target.value })}
                                                    className="w-full mt-1 px-2 py-1 bg-dark-surface border border-dark-border rounded text-silver-light"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-silver-dark">Origin:</span>
                                                <span className="text-silver-light font-medium">{shipment.origin}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-silver-dark">Destination:</span>
                                                <span className="text-silver-light font-medium">{shipment.destination}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-silver-dark">Service Type:</span>
                                        <span className="text-silver-light capitalize">{shipment.serviceType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver-dark">Cargo Type:</span>
                                        <span className="text-silver-light">{shipment.cargoType || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cargo Details */}
                            <div className="glass-card p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Package className="w-4 h-4 text-accent-orange" />
                                    <h4 className="font-semibold text-silver-light">Cargo Details</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {isEditing ? (
                                        <>
                                            <div>
                                                <label className="text-silver-dark text-xs">Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    value={editedShipment.weight}
                                                    onChange={(e) => setEditedShipment({ ...editedShipment, weight: e.target.value })}
                                                    className="w-full mt-1 px-2 py-1 bg-dark-surface border border-dark-border rounded text-silver-light"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-silver-dark text-xs">Volume (CBM)</label>
                                                <input
                                                    type="number"
                                                    value={editedShipment.volume}
                                                    onChange={(e) => setEditedShipment({ ...editedShipment, volume: e.target.value })}
                                                    className="w-full mt-1 px-2 py-1 bg-dark-surface border border-dark-border rounded text-silver-light"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-silver-dark text-xs">Commodity</label>
                                                <input
                                                    type="text"
                                                    value={editedShipment.commodity}
                                                    onChange={(e) => setEditedShipment({ ...editedShipment, commodity: e.target.value })}
                                                    className="w-full mt-1 px-2 py-1 bg-dark-surface border border-dark-border rounded text-silver-light"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-silver-dark">Weight:</span>
                                                <span className="text-silver-light">{shipment.weight ? `${shipment.weight} kg` : '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-silver-dark">Volume:</span>
                                                <span className="text-silver-light">{shipment.volume ? `${shipment.volume} CBM` : '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-silver-dark">Commodity:</span>
                                                <span className="text-silver-light">{shipment.commodity || '-'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Containers & Dates */}
                        <div className="space-y-4">
                            {/* Containers */}
                            {shipment.serviceType === 'sea' && (
                                <div className="glass-card p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Container className="w-4 h-4 text-accent-orange" />
                                            <h4 className="font-semibold text-silver-light">Containers</h4>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setShowContainerModal(true)}
                                        >
                                            Add Container
                                        </Button>
                                    </div>
                                    {containers.length === 0 ? (
                                        <p className="text-sm text-silver-dark text-center py-4">No containers added</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {containers.map((container) => (
                                                <div key={container.id} className="bg-dark-surface p-3 rounded border border-dark-border">
                                                    <div className="flex justify-between items-start">
                                                        <div className="text-sm space-y-1">
                                                            <div className="font-medium text-accent-orange">{container.containerNumber}</div>
                                                            <div className="text-silver-dark">Type: {container.containerType}</div>
                                                            {container.sealNumber && (
                                                                <div className="text-silver-dark">Seal: {container.sealNumber}</div>
                                                            )}
                                                            {container.vgm && (
                                                                <div className="text-silver-dark">VGM: {container.vgm} kg</div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteContainer(container.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Dates */}
                            <div className="glass-card p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4 text-accent-orange" />
                                    <h4 className="font-semibold text-silver-light">Important Dates</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-silver-dark">Created:</span>
                                        <span className="text-silver-light">{shipment.createdAt || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver-dark">Quotation Date:</span>
                                        <span className="text-silver-light">{shipment.quotationDate || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Documents / Actions */}
                            <div className="glass-card p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4 text-accent-orange" />
                                    <h4 className="font-semibold text-silver-light">Documents</h4>
                                </div>
                                <div className="space-y-2">
                                    {shipment.serviceType === 'sea' && (
                                        <Button
                                            variant="secondary"
                                            icon={Ship}
                                            onClick={handleCreateBL}
                                            className="w-full"
                                        >
                                            Create Bill of Lading (BL)
                                        </Button>
                                    )}
                                    {shipment.serviceType === 'air' && (
                                        <Button
                                            variant="secondary"
                                            icon={Plane}
                                            onClick={handleCreateAWB}
                                            className="w-full"
                                        >
                                            Create Air Waybill (AWB)
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between pt-4 border-t border-dark-border">
                        <Button
                            variant="secondary"
                            onClick={() => setShowStatusModal(true)}
                            disabled={!statusConfig[shipment.status]?.next}
                        >
                            Update Status
                        </Button>
                        <Button variant="secondary" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Status Update Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Update Shipment Status"
                size="small"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">New Status</label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                        >
                            <option value="">Select status...</option>
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">Notes (optional)</label>
                        <textarea
                            rows={3}
                            value={statusNotes}
                            onChange={(e) => setStatusNotes(e.target.value)}
                            placeholder="Add notes about this status change..."
                            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleStatusUpdate} disabled={!newStatus}>
                            Update Status
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Container Modal */}
            <Modal
                isOpen={showContainerModal}
                onClose={() => setShowContainerModal(false)}
                title="Add Container"
                size="small"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">
                            Container Number <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={newContainer.containerNumber}
                            onChange={(e) => setNewContainer({ ...newContainer, containerNumber: e.target.value.toUpperCase() })}
                            placeholder="e.g., ABCD1234567"
                            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">Container Type</label>
                        <select
                            value={newContainer.containerType}
                            onChange={(e) => setNewContainer({ ...newContainer, containerType: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                        >
                            {containerTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">Seal Number</label>
                        <input
                            type="text"
                            value={newContainer.sealNumber}
                            onChange={(e) => setNewContainer({ ...newContainer, sealNumber: e.target.value.toUpperCase() })}
                            placeholder="e.g., SEAL12345"
                            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-silver mb-2">VGM (kg)</label>
                        <input
                            type="number"
                            value={newContainer.vgm}
                            onChange={(e) => setNewContainer({ ...newContainer, vgm: e.target.value })}
                            placeholder="e.g., 28500"
                            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-silver-light"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setShowContainerModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddContainer}>
                            Add Container
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ShipmentDetailModal;
