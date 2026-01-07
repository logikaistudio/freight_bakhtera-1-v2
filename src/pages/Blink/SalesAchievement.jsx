import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Target, DollarSign, CheckCircle, Award, Users, X, Printer, ArrowLeft } from 'lucide-react';

const SalesAchievement = () => {
    const [soAchievement, setSoAchievement] = useState({
        totalQuotations: 0,
        soCreated: 0,
        percentage: 0
    });

    const [paymentAchievement, setPaymentAchievement] = useState({
        soCreated: 0,
        paymentClosed: 0,
        totalAmount: 0,
        paidAmount: 0,
        percentage: 0
    });

    const [salesPersonData, setSalesPersonData] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSalesPerson, setSelectedSalesPerson] = useState(null);

    useEffect(() => {
        fetchAchievementData();
    }, []);

    const fetchAchievementData = async () => {
        try {
            // Fetch all quotations
            const { data: quotations, error: quotError } = await supabase
                .from('blink_quotations')
                .select('*');

            if (quotError) throw quotError;

            // Filter non-operation quotations (exclude quotation_type 'OP')
            const nonOpQuotations = quotations?.filter(q => q.quotation_type !== 'OP') || [];
            const convertedQuotations = nonOpQuotations.filter(q => q.status === 'converted');

            const soPercentage = nonOpQuotations.length > 0
                ? (convertedQuotations.length / nonOpQuotations.length) * 100
                : 0;

            setSoAchievement({
                totalQuotations: nonOpQuotations.length,
                soCreated: convertedQuotations.length,
                percentage: soPercentage
            });

            // Fetch shipments for payment achievement
            const { data: shipments, error: shipError } = await supabase
                .from('blink_shipments')
                .select('*');

            if (shipError) throw shipError;

            const totalSO = shipments?.length || 0;
            const paidShipments = shipments?.filter(s =>
                s.status === 'delivered' || s.status === 'completed'
            ) || [];

            const totalAmount = shipments?.reduce((sum, s) => {
                const amount = s.quoted_amount || 0;
                const idrAmount = s.currency === 'USD' ? amount * 15000 : amount;
                return sum + idrAmount;
            }, 0) || 0;

            const paidAmount = paidShipments.reduce((sum, s) => {
                const amount = s.quoted_amount || 0;
                const idrAmount = s.currency === 'USD' ? amount * 15000 : amount;
                return sum + idrAmount;
            }, 0);

            const paymentPercentage = totalSO > 0 ? (paidShipments.length / totalSO) * 100 : 0;

            setPaymentAchievement({
                soCreated: totalSO,
                paymentClosed: paidShipments.length,
                totalAmount,
                paidAmount,
                percentage: paymentPercentage
            });

            // Calculate sales person performance
            const salesPersonMap = new Map();

            nonOpQuotations.forEach(q => {
                const sp = q.sales_person || 'Unknown';
                if (!salesPersonMap.has(sp)) {
                    salesPersonMap.set(sp, {
                        name: sp,
                        totalQuotations: 0,
                        convertedQuotations: 0,
                        totalValue: 0,
                        paidValue: 0,
                        details: []
                    });
                }
                const data = salesPersonMap.get(sp);
                data.totalQuotations++;
                if (q.status === 'converted') {
                    data.convertedQuotations++;
                }

                // Add quotation to details
                const correspondingShipment = shipments?.find(s =>
                    s.job_number === q.job_number || s.quotation_id === q.id
                );

                data.details.push({
                    quotationNo: q.job_number,
                    quotationDate: q.created_at,
                    customer: q.customer_name || q.customer,
                    paymentDate: correspondingShipment && (correspondingShipment.status === 'delivered' || correspondingShipment.status === 'completed')
                        ? correspondingShipment.updated_at
                        : null,
                    paidAmount: correspondingShipment && (correspondingShipment.status === 'delivered' || correspondingShipment.status === 'completed')
                        ? (correspondingShipment.currency === 'USD' ? (correspondingShipment.quoted_amount || 0) * 15000 : (correspondingShipment.quoted_amount || 0))
                        : 0
                });
            });

            // Add payment data from shipments
            shipments?.forEach(s => {
                const sp = s.sales_person || 'Unknown';
                if (!salesPersonMap.has(sp)) {
                    salesPersonMap.set(sp, {
                        name: sp,
                        totalQuotations: 0,
                        convertedQuotations: 0,
                        totalValue: 0,
                        paidValue: 0,
                        details: []
                    });
                }
                const data = salesPersonMap.get(sp);
                const amount = s.quoted_amount || 0;
                const idrAmount = s.currency === 'USD' ? amount * 15000 : amount;
                data.totalValue += idrAmount;

                if (s.status === 'delivered' || s.status === 'completed') {
                    data.paidValue += idrAmount;
                }
            });

            const salesPersonArray = Array.from(salesPersonMap.values())
                .filter(sp => sp.name !== 'Unknown')
                .sort((a, b) => b.paidValue - a.paidValue);

            setSalesPersonData(salesPersonArray);

        } catch (error) {
            console.error('Error fetching achievement data:', error);
        }
    };

    const handlePrintTXT = () => {
        if (!selectedSalesPerson) return;

        const yearlyTarget = 1000000000;
        const soAchievementPercent = yearlyTarget > 0 ? (selectedSalesPerson.totalValue / yearlyTarget) * 100 : 0;
        const paymentPercent = selectedSalesPerson.totalValue > 0 ? (selectedSalesPerson.paidValue / selectedSalesPerson.totalValue) * 100 : 0;
        const totalPercent = yearlyTarget > 0 ? (selectedSalesPerson.paidValue / yearlyTarget) * 100 : 0;

        let txtContent = `
================================================================================
                    SALES ACHIEVEMENT REPORT
                    ${selectedSalesPerson.name}
================================================================================

RINGKASAN PENCAPAIAN:
------------------------------------------------------------
Target Per Tahun        : Rp ${yearlyTarget.toLocaleString('id-ID')}
Total Quotations        : ${selectedSalesPerson.totalQuotations}
SO Created              : ${selectedSalesPerson.convertedQuotations}
SO Achievement          : ${soAchievementPercent.toFixed(1)}%
Total Value (SO)        : Rp ${selectedSalesPerson.totalValue.toLocaleString('id-ID')}
Paid Value              : Rp ${selectedSalesPerson.paidValue.toLocaleString('id-ID')}
Payment Achievement     : ${paymentPercent.toFixed(1)}%
Total Achievement       : ${totalPercent.toFixed(1)}%

================================================================================
                    DETAIL QUOTATION & PEMBAYARAN
================================================================================

`;

        if (selectedSalesPerson.details && selectedSalesPerson.details.length > 0) {
            selectedSalesPerson.details.forEach((detail, idx) => {
                const quotationDate = detail.quotationDate ? new Date(detail.quotationDate).toLocaleDateString('id-ID') : '-';
                const paymentDate = detail.paymentDate ? new Date(detail.paymentDate).toLocaleDateString('id-ID') : '-';
                const paidAmount = detail.paidAmount > 0 ? `Rp ${detail.paidAmount.toLocaleString('id-ID')}` : '-';

                txtContent += `
${idx + 1}. ${detail.quotationNo || '-'}
    Tanggal Quotation   : ${quotationDate}
    Customer            : ${detail.customer || '-'}
    Tanggal Pembayaran  : ${paymentDate}
    Jumlah Terbayar     : ${paidAmount}
------------------------------------------------------------`;
            });
        } else {
            txtContent += '\nTidak ada data quotation tersedia.\n';
        }

        txtContent += `

================================================================================
Laporan dicetak pada: ${new Date().toLocaleString('id-ID')}
================================================================================
`;

        // Create blob and download
        const blob = new Blob([txtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Sales_Achievement_${selectedSalesPerson.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const AchievementBar = ({ title, subtitle, icon: Icon, achieved, target, percentage, additionalInfo }) => {
        const getColor = () => {
            if (percentage >= 100) return 'from-green-500 to-emerald-600';
            if (percentage >= 75) return 'from-blue-500 to-cyan-600';
            if (percentage >= 50) return 'from-yellow-500 to-orange-600';
            return 'from-red-500 to-pink-600';
        };

        return (
            <div className="glass-card p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${getColor()} bg-opacity-20`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-silver-light">{title}</h3>
                        <p className="text-sm text-silver-dark">{subtitle}</p>
                        <p className="text-xs text-silver-dark mt-1">
                            {achieved} / {target} {additionalInfo}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-accent-orange">{percentage.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-dark-surface rounded-full overflow-hidden">
                    <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getColor()} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>

                {/* Achievement Status */}
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-silver-dark">
                        {percentage >= 100 ? '🎉 Target Achieved!' : `${(100 - percentage).toFixed(1)}% to target`}
                    </span>
                    {percentage >= 100 && (
                        <Award className="w-5 h-5 text-yellow-400" />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Sales Achievement</h1>
                <p className="text-silver-dark mt-1">Track performance dari Quotation hingga Payment Closing</p>
            </div>

            {/* Achievement Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AchievementBar
                    title="SO Achievement"
                    subtitle="Quotation (Non-Operation) → Sales Order"
                    icon={Target}
                    achieved={soAchievement.soCreated}
                    target={soAchievement.totalQuotations}
                    percentage={soAchievement.percentage}
                    additionalInfo="SO Created"
                />

                <AchievementBar
                    title="Payment Achievement"
                    subtitle="Sales Order → Payment Closed"
                    icon={DollarSign}
                    achieved={paymentAchievement.paymentClosed}
                    target={paymentAchievement.soCreated}
                    percentage={paymentAchievement.percentage}
                    additionalInfo="Payments Closed"
                />
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        <div>
                            <p className="text-sm text-silver-dark">Total Quotations</p>
                            <p className="text-2xl font-bold text-silver-light">{soAchievement.totalQuotations}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Target className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-sm text-silver-dark">SO Created</p>
                            <p className="text-2xl font-bold text-silver-light">{soAchievement.soCreated}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-yellow-400" />
                        <div>
                            <p className="text-sm text-silver-dark">Total SO Value</p>
                            <p className="text-lg font-bold text-silver-light">
                                Rp {paymentAchievement.totalAmount.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-green-400" />
                        <div>
                            <p className="text-sm text-silver-dark">Paid Value</p>
                            <p className="text-lg font-bold text-silver-light">
                                Rp {paymentAchievement.paidAmount.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Sales Person Performance Table */}
            <div className="glass-card rounded-lg overflow-hidden">
                <div className="p-6 border-b border-dark-border">
                    <h2 className="text-xl font-bold text-silver-light flex items-center gap-2">
                        <Users className="w-6 h-6 text-accent-orange" />
                        Sales Person Achievement
                    </h2>
                    <p className="text-sm text-silver-dark mt-1">Individual performance tracking - Click row for details</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-surface">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-silver uppercase">Nama Sales</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-silver uppercase">Target/Tahun</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-silver uppercase">SO Achievement</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-silver uppercase">Payment Achievement</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-silver uppercase">Total Pencapaian</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-silver uppercase">%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {salesPersonData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-silver-dark">
                                        No sales person data available
                                    </td>
                                </tr>
                            ) : (
                                salesPersonData.map((sp, index) => {
                                    // Set target per year (1 Billion IDR default)
                                    const yearlyTarget = 1000000000;
                                    const soAchievementPercent = yearlyTarget > 0 ? (sp.totalValue / yearlyTarget) * 100 : 0;
                                    const paymentPercent = sp.totalValue > 0 ? (sp.paidValue / sp.totalValue) * 100 : 0;
                                    const totalPercent = yearlyTarget > 0 ? (sp.paidValue / yearlyTarget) * 100 : 0;

                                    return (
                                        <tr
                                            key={index}
                                            onClick={() => {
                                                setSelectedSalesPerson(sp);
                                                setShowDetailModal(true);
                                            }}
                                            className="hover:bg-dark-surface/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-orange to-orange-600 flex items-center justify-center text-white font-bold">
                                                        {sp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <span className="text-sm font-medium text-silver-light">{sp.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-silver-light">
                                                Rp {yearlyTarget.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-silver-dark">Rp {sp.totalValue.toLocaleString('id-ID')}</span>
                                                        <span className="text-accent-orange font-semibold">{soAchievementPercent.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="relative h-2 bg-dark-surface rounded-full overflow-hidden">
                                                        <div
                                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"
                                                            style={{ width: `${Math.min(soAchievementPercent, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-silver-dark">Rp {sp.paidValue.toLocaleString('id-ID')}</span>
                                                        <span className="text-green-400 font-semibold">{paymentPercent.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="relative h-2 bg-dark-surface rounded-full overflow-hidden">
                                                        <div
                                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                                                            style={{ width: `${Math.min(paymentPercent, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-green-400">
                                                Rp {sp.paidValue.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${totalPercent >= 70 ? 'bg-green-500/20 text-green-400' :
                                                    totalPercent >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {totalPercent.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedSalesPerson && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-dark-border flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-silver-light">
                                    Detail Pencapaian - {selectedSalesPerson.name}
                                </h2>
                                <p className="text-sm text-silver-dark mt-1">
                                    Daftar quotation dan pembayaran
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintTXT}
                                    className="flex items-center gap-2 px-4 py-2 bg-accent-orange hover:bg-accent-orange/80 text-white rounded-lg transition-colors"
                                >
                                    <Printer className="w-4 h-4" />
                                    Cetak TXT
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-dark-surface hover:bg-dark-card border border-dark-border text-silver-light rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Kembali
                                </button>
                            </div>
                        </div>

                        <div className="overflow-auto max-h-[calc(90vh-120px)] p-6">
                            <table className="w-full">
                                <thead className="bg-dark-surface sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-silver uppercase">No. Quotation</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-silver uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-silver uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-silver uppercase">Tanggal Pembayaran</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-silver uppercase">Jumlah Terbayar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-border">
                                    {selectedSalesPerson.details && selectedSalesPerson.details.length > 0 ? (
                                        selectedSalesPerson.details.map((detail, idx) => (
                                            <tr key={idx} className="hover:bg-dark-surface/30">
                                                <td className="px-6 py-3 text-sm text-silver-light">{detail.quotationNo}</td>
                                                <td className="px-6 py-3 text-sm text-silver-dark">
                                                    {detail.quotationDate ? new Date(detail.quotationDate).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-silver-light">{detail.customer}</td>
                                                <td className="px-6 py-3 text-sm text-silver-dark">
                                                    {detail.paymentDate ? new Date(detail.paymentDate).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-right font-semibold text-green-400">
                                                    {detail.paidAmount > 0 ? `Rp ${detail.paidAmount.toLocaleString('id-ID')}` : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-silver-dark">
                                                No quotation data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesAchievement;
