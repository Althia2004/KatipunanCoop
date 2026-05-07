import { Head, router } from '@inertiajs/react';
import { Banknote, TrendingUp, PiggyBank, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthlySummary {
    month: string;
    loans_released: number;
    collections: number;
    net: number;
}

interface RecentPayment {
    id: number;
    member_name: string;
    principal_amount: number;
    amount_paid: number;
    payment_date: string;
}

interface Props {
    totalLoansReleased: number;
    totalCollections: number;
    totalSavings: number;
    totalCapitalShares: number;
    monthlySummary: MonthlySummary[];
    loanStatusBreakdown: {
        pending: number;
        approved: number;
        rejected: number;
        bod_approval: number;
    };
    recentPayments: RecentPayment[];
    currentYear: number;
    availableYears: number[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function FinancialReports({
    totalLoansReleased,
    totalCollections,
    totalSavings,
    totalCapitalShares,
    monthlySummary,
    loanStatusBreakdown,
    recentPayments,
    currentYear,
    availableYears,
}: Props) {
    const stats = [
        { label: 'Total Loans Released', value: peso(totalLoansReleased), icon: Banknote,   color: 'text-blue-600',   bg: 'bg-blue-50' },
        { label: 'Total Collections',    value: peso(totalCollections),   icon: TrendingUp, color: 'text-green-600',  bg: 'bg-green-50' },
        { label: 'Total Savings',        value: peso(totalSavings),       icon: PiggyBank,  color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Capital Shares', value: peso(totalCapitalShares), icon: Users,      color: 'text-amber-600',  bg: 'bg-amber-50' },
    ];

    function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
        router.get('/superadmin/reports/financial', { year: e.target.value }, { preserveState: true });
    }

    return (
        <>
            <Head title="Financial Reports" />

            <div className="p-6 space-y-6 max-w-5xl mx-auto">

                {/* Page header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                            Reports
                        </p>
                        <h1 className="text-2xl font-bold text-[#2d5a27]">Financial Reports</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">
                            High-level financial overview of the cooperative.
                        </p>
                    </div>
                    {/* Year filter */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="year-filter" className="text-sm text-zinc-500 shrink-0">Year:</label>
                        <select
                            id="year-filter"
                            value={currentYear}
                            onChange={handleYearChange}
                            className="border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                        >
                            {availableYears.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s) => (
                        <Card key={s.label} className="border border-zinc-200 shadow-sm">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                                    <s.icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-zinc-900">{s.value}</p>
                                    <p className="text-xs text-zinc-500">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Loan Status Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-amber-600">{loanStatusBreakdown.pending}</p>
                        <p className="text-xs text-amber-500 mt-1">Pending</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{loanStatusBreakdown.approved}</p>
                        <p className="text-xs text-green-500 mt-1">Approved</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{loanStatusBreakdown.bod_approval}</p>
                        <p className="text-xs text-blue-500 mt-1">For BOD Review</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{loanStatusBreakdown.rejected}</p>
                        <p className="text-xs text-red-500 mt-1">Rejected</p>
                    </div>
                </div>

                {/* Bar chart */}
                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <h2 className="text-base font-semibold text-zinc-900">
                            Monthly Overview — {currentYear}
                        </h2>
                    </CardHeader>
                    <CardContent>
                        {monthlySummary.length === 0 ? (
                            <div className="flex items-center justify-center h-48 rounded-xl bg-zinc-50 border border-dashed border-zinc-200">
                                <p className="text-sm text-zinc-400">No financial data for {currentYear} yet.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlySummary} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip formatter={(value: number) => peso(value)} />
                                    <Legend />
                                    <Bar dataKey="loans_released" name="Loans Released" fill="#2d5a27" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="collections"    name="Collections"    fill="#c8920a" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Summary table */}
                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <h2 className="text-base font-semibold text-zinc-900">Monthly Summary — {currentYear}</h2>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50">
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Month</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Loans Released</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Collections</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Net</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {monthlySummary.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-zinc-400 text-sm">
                                                No financial data for {currentYear} yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        monthlySummary.map((row) => (
                                            <tr key={row.month} className="hover:bg-zinc-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{row.month}</td>
                                                <td className="px-4 py-3 text-right text-zinc-700">{peso(row.loans_released)}</td>
                                                <td className="px-4 py-3 text-right text-zinc-700">{peso(row.collections)}</td>
                                                <td className={`px-4 py-3 text-right font-semibold ${row.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {row.net >= 0 ? '+' : ''}{peso(row.net)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <h2 className="text-base font-semibold text-zinc-900">Recent Payments</h2>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50">
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Member</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Loan Amount</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Payment</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {recentPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-zinc-400 text-sm">
                                                No recent payments found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentPayments.map((p) => (
                                            <tr key={p.id} className="hover:bg-zinc-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{p.member_name}</td>
                                                <td className="px-4 py-3 text-right text-zinc-500">{peso(p.principal_amount)}</td>
                                                <td className="px-4 py-3 text-right text-green-700 font-semibold">{peso(p.amount_paid)}</td>
                                                <td className="px-4 py-3 text-right text-zinc-500">
                                                    {new Date(p.payment_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </>
    );
}


// ── Placeholder data ───────────────────────────────────────────────────────────
// TODO: wire to real financial data once model/aggregation is ready

const SUMMARY_ROWS = [
    { month: 'Jan 2026', loansReleased: 125000, collections: 42000, net:  83000 },
    { month: 'Feb 2026', loansReleased:  98000, collections: 38000, net:  60000 },
    { month: 'Mar 2026', loansReleased: 142000, collections: 55000, net:  87000 },
    { month: 'Apr 2026', loansReleased:  87000, collections: 61000, net:  26000 },
    { month: 'May 2026', loansReleased:  60000, collections: 30000, net:  30000 },
];

const STATS = [
    { label: 'Total Loans Released', value: '₱512,000', icon: Banknote,    color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Total Collections',    value: '₱226,000', icon: TrendingUp,  color: 'text-green-600',   bg: 'bg-green-50' },
    { label: 'Total Savings',        value: '₱384,000', icon: PiggyBank,   color: 'text-purple-600',  bg: 'bg-purple-50' },
    { label: 'Total Capital Shares', value: '₱210,000', icon: Users,       color: 'text-amber-600',   bg: 'bg-amber-50' },
];

