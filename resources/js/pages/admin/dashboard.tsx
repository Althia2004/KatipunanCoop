import { Head } from '@inertiajs/react';
import { PiggyBank, TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Transaction {
    id: number;
    member_name: string;
    type: string;
    amount: number;
    balance_after: number;
    remarks: string | null;
    created_at: string;
}

interface MonthlyData {
    month: string;
    deposits: number;
    withdrawals: number;
    net_change: number;
}

interface Props {
    stats: {
        total_savings: number;
        total_capital: number;
        total_members: number;
        monthly_interest: number;
        annual_interest: number;
    };
    recent_savings_transactions: Transaction[];
    monthly_savings_summary: MonthlyData[];
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AdminDashboard({ stats, recent_savings_transactions, monthly_savings_summary }: Props) {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard — KSCFMPC" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">Savings and capital management overview.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[#2d5a27]/10 flex items-center justify-center">
                                <PiggyBank className="w-5 h-5 text-[#2d5a27]" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-600">Total Savings</p>
                        </div>
                        <p className="text-3xl font-black text-[#2d5a27]">{fmt(stats.total_savings)}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[#c8920a]/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-[#c8920a]" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-600">Capital Shares</p>
                        </div>
                        <p className="text-3xl font-black text-[#c8920a]">{fmt(stats.total_capital)}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-600">Total Members</p>
                        </div>
                        <p className="text-3xl font-black text-blue-600">{stats.total_members}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-600">Monthly Interest</p>
                        </div>
                        <p className="text-3xl font-black text-green-600">{fmt(stats.monthly_interest)}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-600">Annual Interest</p>
                        </div>
                        <p className="text-3xl font-black text-purple-600">{fmt(stats.annual_interest)}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Savings Transactions */}
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-zinc-100">
                            <h3 className="text-lg font-semibold text-zinc-900">Recent Savings Transactions</h3>
                            <p className="text-sm text-zinc-500">Latest member deposits and withdrawals</p>
                        </div>

                        {recent_savings_transactions.length === 0 ? (
                            <div className="py-12 text-center text-sm text-zinc-400">No transactions yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-50">
                                        <tr>
                                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Member</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Type</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Amount</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {recent_savings_transactions.map(t => (
                                            <tr key={t.id} className="hover:bg-zinc-50/50">
                                                <td className="px-5 py-3 text-zinc-700 font-medium">{t.member_name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                        t.type === 'deposit'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-600'
                                                    }`}>
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className={`px-4 py-3 text-right font-semibold ${
                                                    t.type === 'deposit'
                                                        ? 'text-green-600'
                                                        : 'text-red-500'
                                                }`}>
                                                    {t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs">{t.created_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Monthly Savings Summary */}
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-zinc-100">
                            <h3 className="text-lg font-semibold text-zinc-900">Monthly Savings Summary</h3>
                            <p className="text-sm text-zinc-500">Deposits vs withdrawals by month</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Month</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Deposits</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Withdrawals</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Net Change</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {monthly_savings_summary.map((month, index) => (
                                        <tr key={index} className="hover:bg-zinc-50/50">
                                            <td className="px-5 py-3 text-zinc-700 font-medium">{month.month}</td>
                                            <td className="px-4 py-3 text-right text-green-600 font-semibold">+{fmt(month.deposits)}</td>
                                            <td className="px-4 py-3 text-right text-red-500 font-semibold">-{fmt(month.withdrawals)}</td>
                                            <td className={`px-4 py-3 text-right font-semibold ${
                                                month.net_change >= 0 ? 'text-green-600' : 'text-red-500'
                                            }`}>
                                                {month.net_change >= 0 ? '+' : ''}{fmt(month.net_change)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}