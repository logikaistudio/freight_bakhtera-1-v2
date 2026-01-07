import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Calendar, User, FileText, Package, Clock } from 'lucide-react';

const FlowMonitor = () => {
    const [flows, setFlows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFlows();
    }, []);

    const fetchFlows = async () => {
        try {
            // Fetch directly from blink_quotations for real-time sync
            const { data, error } = await supabase
                .from('blink_quotations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform quotation data to flow monitor format
            const flowData = (data || []).map(q => ({
                id: q.id,
                quotation_number: q.quotation_number || q.job_number,
                job_number: q.job_number,
                created_at: q.created_at,
                created_by: q.sales_person,
                // Manager approval timestamp (when status changed to 'sent' from 'manager_approval')
                manager_approved_at: q.status === 'sent' || q.status === 'converted' || q.status === 'approved' ? q.updated_at : null,
                manager_approved_by: q.status === 'sent' || q.status === 'converted' || q.status === 'approved' ? 'Manager' : null,
                // Revision tracking
                revision_requested_at: q.status === 'revision_requested' ? q.updated_at : null,
                revision_reason: q.revision_reason || q.rejection_reason,
                // Sent to customer (when status is 'sent')
                sent_to_customer_at: q.status === 'sent' || q.status === 'converted' || q.status === 'approved' ? q.updated_at : null,
                sent_by: q.sales_person,
                // Customer approved
                customer_approved_at: q.status === 'approved' || q.status === 'converted' ? q.updated_at : null,
                customer_approved_by: q.customer_name,
                // SO created (when converted)
                so_created_at: q.status === 'converted' ? q.updated_at : null,
                so_number: q.status === 'converted' ? `SO-${q.job_number}` : null,
                // Current status
                current_status: q.status,
                remark: q.notes || '-'
            }));

            setFlows(flowData);
        } catch (error) {
            console.error('Error fetching flow monitor:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return (
            <div>
                <div className="text-silver-light">{date.toLocaleDateString('id-ID')}</div>
                <div className="text-xs text-silver-dark">{date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        );
    };

    const renderUserCell = (timestamp, user) => {
        if (!timestamp) return <span className="text-silver-dark">-</span>;
        return (
            <div>
                {formatDateTime(timestamp)}
                {user && <div className="text-xs text-silver-dark mt-1">{user}</div>}
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-accent-orange" />
                <div>
                    <h1 className="text-2xl font-bold text-silver-light">Quotation Flow Monitor</h1>
                    <p className="text-sm text-silver-dark">Track quotation lifecycle timestamps</p>
                </div>
            </div>

            {loading ? (
                <div className="glass-card p-12 text-center">
                    <Clock className="w-12 h-12 text-silver-dark mx-auto mb-4 animate-spin" />
                    <p className="text-silver-dark">Loading flow data...</p>
                </div>
            ) : (
                <div className="glass-card overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-border">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">Quotation No.</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">Job Number</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">Created</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">Manager Approved</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">Revision</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">Sent to Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">Customer Approved</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">SO Created</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase">Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flows.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-4 py-12 text-center text-silver-dark">
                                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No flow data available</p>
                                    </td>
                                </tr>
                            ) : (
                                flows.map((flow) => (
                                    <tr key={flow.id} className="border-b border-dark-border hover:bg-dark-surface smooth-transition">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-accent-orange">{flow.quotation_number || '-'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-silver-light">{flow.job_number}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {renderUserCell(flow.created_at, flow.created_by)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {renderUserCell(flow.manager_approved_at, flow.manager_approved_by)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {flow.revision_requested_at ? (
                                                <div>
                                                    {formatDateTime(flow.revision_requested_at)}
                                                    {flow.revision_reason && (
                                                        <div className="text-xs text-orange-400 mt-1">{flow.revision_reason}</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-silver-dark">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {renderUserCell(flow.sent_to_customer_at, flow.sent_by)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {renderUserCell(flow.customer_approved_at, flow.customer_approved_by)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {flow.so_created_at ? (
                                                <div>
                                                    {formatDateTime(flow.so_created_at)}
                                                    {flow.so_number && (
                                                        <div className="text-xs text-green-400 mt-1">{flow.so_number}</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-silver-dark">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                                {flow.current_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-silver-light">{flow.remark || '-'}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FlowMonitor;
