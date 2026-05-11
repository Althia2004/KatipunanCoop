import { Head } from '@inertiajs/react';
import {
    CreditCard, PiggyBank, Leaf, TrendingDown, AlertCircle, CheckCircle2,
} from 'lucide-react';
import MemberLayout from '@/layouts/MemberLayout';

interface NextDue {
    loan_id: number;
    due_date: string;
    amount: number;
    status: string;
}

interface Payment {
    id: number;
    payment_date: string;
    amount_paid: number;
    payment_method: string;
    reference_number: string | null;
}

interface Props {
    user: { name: string; email: string };
    member: {
        name: string;
        migs_score: number;
        classification: string;
        savings_balance: number;
        share_capital: number;
        copra_sales_ytd: number;
    };
    stats: {
        active_loans: number;
        total_paid: number;
        remaining_balance: number;
    };
    next_due: NextDue | null;
    recent_payments: Payment[];
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function MemberDashboard({ user, member, stats, next_due, recent_payments }: Props) {
    const isMigs = member.classification === 'migs';
    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <MemberLayout user={user} title="Dashboard">
            <Head title="Dashboard — KSCFMPC Member Portal" />

            <div className="space-y-6">
                {/* Greeting */}
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">{greeting()}, {member.name.split(' ')[0]}!</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">Here's your membership overview.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Active Loans', value: stats.active_loans.toString(), icon: CreditCard, color: '#2d5a27' },
                        { label: 'Remaining Balance', value: fmt(stats.remaining_balance), icon: TrendingDown, color: '#ef4444' },
                        { label: 'Savings Balance', value: fmt(member.savings_balance), icon: PiggyBank, color: '#2563eb' },
                        { label: 'Copra Sales YTD', value: fmt(member.copra_sales_ytd), icon: Leaf, color: '#c8920a' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-zinc-500 font-medium">{card.label}</p>
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: card.color + '15' }}
                                >
                                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-zinc-900">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-4">
                    {/* MIGS Score */}
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-zinc-700">MIGS Score</p>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                isMigs ? 'bg-[#2d5a27]/10 text-[#2d5a27]' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                                {isMigs ? 'MIGS Member' : 'Non-MIGS'}
                            </span>
                        </div>
                        <div className="flex items-end gap-1 mb-3">
                            <span className="text-4xl font-black text-zinc-900">{member.migs_score}</span>
                            <span className="text-zinc-400 text-sm mb-1">/100</span>
                        </div>
                        <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${member.migs_score}%`,
                                    backgroundColor: member.migs_score >= 50 ? '#2d5a27' : '#c8920a',
                                }}
                            />
                        </div>
                        <p className="text-xs text-zinc-400 mt-2">
                            {member.migs_score >= 50
                                ? 'You qualify for MIGS benefits.'
                                : `${50 - member.migs_score} pts needed for MIGS status.`}
                        </p>
                    </div>

                    {/* Next Due */}
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <p className="text-sm font-semibold text-zinc-700 mb-3">Next Payment Due</p>
                        {next_due ? (
                            <div>
                                <div className={`flex items-center gap-2 mb-3 ${
                                    next_due.status === 'overdue' ? 'text-red-600' : 'text-zinc-700'
                                }`}>
                                    {next_due.status === 'overdue'
                                        ? <AlertCircle className="w-5 h-5 text-red-500" />
                                        : <CreditCard className="w-5 h-5 text-[#2d5a27]" />}
                                    <div>
                                        <p className="font-bold text-lg">{fmt(next_due.amount)}</p>
                                        <p className="text-xs text-zinc-500">Due {next_due.due_date}</p>
                                    </div>
                                </div>
                                {next_due.status === 'overdue' && (
                                    <span className="inline-block text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                                        OVERDUE — Please contact your cooperative
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 py-4">
                                <CheckCircle2 className="w-8 h-8 text-[#2d5a27]/40" />
                                <div>
                                    <p className="text-sm font-medium text-zinc-600">All payments up to date</p>
                                    <p className="text-xs text-zinc-400">No pending amortizations</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Capital Share */}
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <p className="text-sm font-semibold text-zinc-700 mb-3">Capital Share</p>
                        <p className="text-3xl font-black text-[#c8920a]">{fmt(member.share_capital)}</p>
                        <p className="text-xs text-zinc-400 mt-1">Your total capital contribution</p>
                        <div className="mt-4 pt-4 border-t border-zinc-50">
                            <p className="text-xs text-zinc-500">Total Paid</p>
                            <p className="text-sm font-bold text-zinc-700 mt-0.5">{fmt(stats.total_paid)}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100">
                        <h2 className="text-sm font-semibold text-zinc-700">Recent Payments</h2>
                    </div>
                    {recent_payments.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50">
                                <tr>
                                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                                    <th className="text-right px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Method</th>
                                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Reference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {recent_payments.map(p => (
                                    <tr key={p.id} className="hover:bg-zinc-50/50">
                                        <td className="px-5 py-3 text-zinc-600">{p.payment_date}</td>
                                        <td className="px-5 py-3 text-right font-semibold text-zinc-900">{fmt(p.amount_paid)}</td>
                                        <td className="px-5 py-3 text-zinc-500 capitalize">{p.payment_method}</td>
                                        <td className="px-5 py-3 text-zinc-400 text-xs hidden sm:table-cell">{p.reference_number || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-10 text-center text-sm text-zinc-400">No payment records yet.</div>
                    )}
                </div>
            </div>
        </MemberLayout>
    );
}

