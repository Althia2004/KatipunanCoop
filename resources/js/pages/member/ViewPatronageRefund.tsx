import { Head, Link } from '@inertiajs/react';
import { HandCoins, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import patronageService from '@/services/patronageService';

interface PatronageRefund {
    id: number;
    fiscal_year: number;
    gross_patronage: number;
    tax_amount: number;
    net_refund: number;
    status: 'pending' | 'approved' | 'released' | 'cancelled';
    payment_date?: string;
    created_at: string;
}

export default function ViewPatronageRefund() {
    const [refunds, setRefunds] = useState<PatronageRefund[]>([]);
    const [summary, setSummary] = useState({
        total_earned: 0,
        total_released: 0,
        pending_amount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatronageData = async () => {
            try {
                setLoading(true);
                const [refundsData, summaryData] = await Promise.all([
                    patronageService.getPatronageRefunds(),
                    patronageService.getPatronageSummary(),
                ]);

                setRefunds(refundsData);
                setSummary(summaryData);
                setError(null);
            } catch (err) {
                setError('Failed to load patronage data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatronageData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'approved':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'released':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-zinc-50 text-zinc-700 border-zinc-200';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <>
            <Head title="Patronage Refund" />

            <div className="p-8 space-y-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link
                        href="/member/dashboard"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg
                                   hover:bg-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d4734]">Patronage Refund</h1>
                        <p className="text-zinc-500 mt-1">View your patronage refunds and contribution records</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900">Error</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[#2d4734] animate-spin" />
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[#2d4734] animate-spin" />
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[#2d4734] animate-spin" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Summary cards */}
                            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-zinc-600">Total Earned</h2>
                                    <HandCoins className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="text-3xl font-bold text-zinc-900">
                                    {formatCurrency(summary.total_earned)}
                                </p>
                                <p className="text-xs text-zinc-500 mt-2">Gross patronage earned</p>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-zinc-600">Released</h2>
                                </div>
                                <p className="text-3xl font-bold text-zinc-900">
                                    {formatCurrency(summary.total_released)}
                                </p>
                                <p className="text-xs text-zinc-500 mt-2">Already received</p>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-zinc-600">Pending</h2>
                                </div>
                                <p className="text-3xl font-bold text-zinc-900">
                                    {formatCurrency(summary.pending_amount)}
                                </p>
                                <p className="text-xs text-zinc-500 mt-2">Awaiting release</p>
                            </div>
                        </div>

                        {/* Refund history */}
                        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Refund History</h2>

                            {refunds.length === 0 ? (
                                <p className="text-zinc-500 text-center py-8">No refund records yet</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-200 bg-zinc-50">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                                    Fiscal Year
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                                    Gross Patronage
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                                    Tax Deducted
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                                    Net Refund
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                                    Payment Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {refunds.map((refund, index) => (
                                                <tr
                                                    key={refund.id}
                                                    className={index % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                                                        {refund.fiscal_year}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-zinc-900">
                                                        {formatCurrency(refund.gross_patronage)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-zinc-900">
                                                        {formatCurrency(refund.tax_amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                                                        {formatCurrency(refund.net_refund)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                                refund.status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(refund.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-zinc-500">
                                                        {refund.payment_date
                                                            ? formatDate(refund.payment_date)
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
