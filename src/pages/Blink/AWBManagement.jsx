import React, { useState } from 'react';
import Button from '../../components/Common/Button';
import { Plane } from 'lucide-react';

const AWBManagement = () => {
    const [showMAWBModal, setShowMAWBModal] = useState(false);
    const [showHAWBModal, setShowHAWBModal] = useState(false);
    
    // Empty - user akan create AWB dari shipment
    const awbs = [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">AWB Management</h1>
                    <p className="text-silver-dark mt-1">Air Waybill dengan selling/buying comparison</p>
                </div>
            </div>

            {awbs.length === 0 ? (
                <div className="glass-card rounded-lg p-12 text-center">
                    <Plane className="w-16 h-16 text-silver-dark mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-silver-light mb-2">Belum Ada AWB</h3>
                    <p className="text-silver-dark">AWB dibuat otomatis saat shipment air freight diproses</p>
                </div>
            ) : null}
        </div>
    );
};

export default AWBManagement;
