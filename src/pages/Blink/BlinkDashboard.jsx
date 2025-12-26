import React from 'react';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/Common/StatCard';
import Button from '../../components/Common/Button';
import {
    Plane,
    Package,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus
} from 'lucide-react';

const BlinkDashboard = () => {
    const { shipments, finance } = useData();
    const navigate = useNavigate();

    const activeShipments = shipments.filter((s) => s.status !== 'completed').length;
    const completedShipments = shipments.filter((s) => s.status === 'completed').length;
    const inTransit = shipments.filter((s) => s.status === 'in-transit').length;

    const blinkRevenue = finance
        .filter((t) => t.module === 'blink' && t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const recentShipments = shipments.slice(-5).reverse();

    const statusColors = {
        'pending': 'bg-yellow-500/20 text-yellow-400',
        'in-transit': 'bg-blue-500/20 text-blue-400',
        'delivered': 'bg-green-500/20 text-green-400',
        'completed': 'bg-gray-500/20 text-gray-400',
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Plane className="w-10 h-10 text-blue-400" />
                        <h1 className="text-4xl font-bold gradient-text">BLINK</h1>
                    </div>
                    <p className="text-silver-dark">Bakhtera-1 Management</p>
                </div>
                <Button onClick={() => navigate('/blink/shipments')} icon={Plus}>
                    New Shipment
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Package}
                    label="Total Shipments"
                    value={shipments.length}
                    iconColor="text-blue-400"
                />
                <StatCard
                    icon={Clock}
                    label="Active Shipments"
                    value={activeShipments}
                    iconColor="text-yellow-400"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Completed"
                    value={completedShipments}
                    iconColor="text-green-400"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Revenue"
                    value={`Rp ${blinkRevenue.toLocaleString('id-ID')}`}
                    iconColor="text-emerald-400"
                />
            </div>

            {/* Recent Shipments */}
            <div className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-silver-light mb-4">Recent Shipments</h2>
                {recentShipments.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-silver-dark mx-auto mb-4" />
                        <p className="text-silver-dark">No shipments yet. Create your first shipment!</p>
                        <Button onClick={() => navigate('/blink/shipments')} className="mt-4">
                            Create Shipment
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentShipments.map((shipment) => (
                            <div
                                key={shipment.id}
                                className="flex items-center justify-between p-4 bg-dark-surface rounded-lg hover:bg-dark-card smooth-transition"
                            >
                                <div className="flex-1">
                                    <h3 className="font-medium text-silver-light">
                                        {shipment.origin} → {shipment.destination}
                                    </h3>
                                    <p className="text-sm text-silver-dark">
                                        Customer: {shipment.customerName || 'N/A'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status]}`}>
                                        {shipment.status}
                                    </span>
                                    <span className="text-silver-light font-semibold">
                                        Rp {parseFloat(shipment.cost || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                    onClick={() => navigate('/blink/shipments')}
                    variant="secondary"
                    className="w-full py-4"
                >
                    Manage Shipments
                </Button>
                <Button
                    onClick={() => navigate('/vendors')}
                    variant="secondary"
                    className="w-full py-4"
                >
                    Manage Vendors
                </Button>
                <Button
                    onClick={() => navigate('/finance')}
                    variant="secondary"
                    className="w-full py-4"
                >
                    View Finance
                </Button>
            </div>
        </div>
    );
};

export default BlinkDashboard;
