import React from 'react';
import { MapPin } from 'lucide-react';

const TrackingMonitoring = () => {
    const shipments = [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Tracking & Monitoring</h1>
                <p className="text-silver-dark mt-1">Real-time shipment tracking</p>
            </div>

            {shipments.length === 0 ? (
                <div className="glass-card rounded-lg p-12 text-center">
                    <MapPin className="w-16 h-16 text-silver-dark mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-silver-light mb-2">Tidak Ada Shipment Aktif</h3>
                    <p className="text-silver-dark">Tracking information akan muncul ketika ada shipment dalam perjalanan</p>
                </div>
            ) : null}
        </div>
    );
};

export default TrackingMonitoring;
