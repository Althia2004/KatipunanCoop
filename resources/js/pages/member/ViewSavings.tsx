import { Head, Link } from '@inertiajs/react';
import { PiggyBank, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import savingsService from '@/services/savingsService';

interface SavingsTransaction {
    id: number;
    type: 'deposit' | 'withdrawal' | 'interest' | 'penalty';
    amount: number;
    description: string;
    transaction_date: string;
    reference_number?: string;
}

export default function ViewSavings() {
    const [balance, setBalance] = useState(0);
    const [totalDeposited, setTotalDeposited] = useState(0);
    const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSavingsData = async () => {
            try {
                setLoading(true);
                const [balanceData, depositedData, transactionsData] = await Promise.all([
                    savingsService.getSavingsBalance(),
                    savingsService.getTotalDeposited(),
                    savingsService.getSavingsTransactions(20),
                ]);

                setBalance(balanceData);
                setTotalDeposited(depositedData);
                setTransactions(transactionsData);
                setError(null);
            } catch (err) {
                setError('Failed to load savings data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSavingsData();
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit':
                return '↓';
            case 'withdrawal':
                return '↑';
            case 'interest':
                return '💰';
            case 'penalty':
                return '⚠️';
            default:
                return '•';
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'deposit':
                return 'text-green-600';
            case 'withdrawal':
                return 'text-red-600';
            case 'interest':
                return 'text-blue-600';
            case 'penalty':
                return 'text-yellow-600';
            default:
                return 'text-zinc-600';
        }
    };

    return (
        <>
            <Head title="View Savings" />

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
                        <h1 className="text-3xl font-bold text-[#2d4734]">View Savings</h1>
                        <p className="text-zinc-500 mt-1">Check your savings account and transaction history</p>
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
                        <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-2xl p-6 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[#2d4734] animate-spin" />
                        </div>
                        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[#2d4734] animate-spin" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Savings summary cards */}
                            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-zinc-600">Current Balance</h2>
                                    <PiggyBank className="w-5 h-5 text-emerald-600" />
                                </div>
                                <p className="text-3xl font-bold text-zinc-900">{formatCurrency(balance)}</p>
                                <p className="text-xs text-zinc-500 mt-2">Available for withdrawal</p>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-zinc-600">Total Deposited</h2>
                                </div>
                                <p className="text-3xl font-bold text-zinc-900">{formatCurrency(totalDeposited)}</p>
                                <p className="text-xs text-zinc-500 mt-2">Cumulative deposits</p>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-zinc-600">Total Transactions</h2>
                                </div>
                                <p className="text-3xl font-bold text-zinc-900">{transactions.length}</p>
                                <p className="text-xs text-zinc-500 mt-2">All transactions</p>
                            </div>
                        </div>

                        {/* Transaction history */}
                        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Recent Transactions</h2>

                            {transactions.length === 0 ? (
                                <p className="text-zinc-500 text-center py-8">No transactions yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="flex items-center justify-between p-4 border border-zinc-100 rounded-lg hover:bg-zinc-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div
                                                    className={`text-xl ${getTransactionColor(tx.type)}`}
                                                >
                                                    {getTransactionIcon(tx.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-zinc-900 capitalize">
                                                        {tx.type}
                                                    </p>
                                                    <p className="text-sm text-zinc-500">
                                                        {formatDate(tx.transaction_date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`font-semibold text-sm ${
                                                        tx.type === 'withdrawal' || tx.type === 'penalty'
                                                            ? 'text-red-600'
                                                            : 'text-green-600'
                                                    }`}
                                                >
                                                    {tx.type === 'withdrawal' || tx.type === 'penalty'
                                                        ? '-'
                                                        : '+'}{' '}
                                                    {formatCurrency(tx.amount)}
                                                </p>
                                                {tx.reference_number && (
                                                    <p className="text-xs text-zinc-400">
                                                        Ref: {tx.reference_number}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
