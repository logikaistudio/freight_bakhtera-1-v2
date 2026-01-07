import React from 'react';
import { Ship } from 'lucide-react';

const ShipmentAll = () => {
    const shipments = [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Semua Shipment</h1>
                <p className="text-silver-dark mt-1">Unified view of all shipments</p>
            </div>

            {shipments.length === 0 ? (
                <div className="glass-card rounded-lg p-12 text-center">
                    <Ship className="w-16 h-16 text-silver-dark mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-silver-light mb-2">Belum Ada Shipment</h3>
                    <p className="text-silver-dark">Mulai dengan membuat Quotation untuk customer Anda</p>
                </div>
            ) : null}
        </div>
    );
};

export default ShipmentAll;
