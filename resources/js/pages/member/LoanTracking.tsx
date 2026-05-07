import { Head, Link } from '@inertiajs/react';
import { FileText, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import memberLoanService from '@/services/memberLoanService';

interface Loan {
    id: number;
    principal_amount: number;
    interest_rate: number;
    term_months: number;
    total_payable: number;
    remaining_balance: number;
    status: 'active' | 'fully_paid' | 'defaulted';
    created_at: string;
}

export default function LoanTracking() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                setLoading(true);
                const data = await memberLoanService.getLoans();
                setLoans(data);
                setError(null);
            } catch (err) {
                setError('Failed to load loans. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'fully_paid':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'defaulted':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-zinc-50 text-zinc-700 border-zinc-200';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1);
    };

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

    return (
        <>
            <Head title="Loan Tracking" />

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
                        <h1 className="text-3xl font-bold text-[#2d4734]">Loan Tracking</h1>
                        <p className="text-zinc-500 mt-1">View your loans, payments, and status</p>
                    </div>
                </div>

                {loading && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#2d4734] animate-spin mb-3" />
                        <p className="text-zinc-500">Loading your loans...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900">Error</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {!loading && !error && loans.length === 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
                        <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                        <p className="text-zinc-500">You don't have any loans yet</p>
                        <Link
                            href="/member/loan-application"
                            className="mt-4 inline-flex items-center px-4 py-2 bg-[#2d4734] text-white rounded-lg hover:bg-[#1f3227] transition-colors"
                        >
                            Request a Loan
                        </Link>
                    </div>
                )}

                {!loading && !error && loans.length > 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                            Loan ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                            Principal Amount
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                            Interest Rate
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                            Term (Months)
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                            Balance
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                                            Date Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.map((loan, index) => (
                                        <tr key={loan.id} className={index % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                                            <td className="px-6 py-4 text-sm text-zinc-900">#{loan.id}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-900 font-medium">
                                                {formatCurrency(loan.principal_amount)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-900">
                                                {loan.interest_rate}%
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-900">
                                                {loan.term_months}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-900 font-medium">
                                                {formatCurrency(loan.remaining_balance)}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                        loan.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(loan.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-500">
                                                {formatDate(loan.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
