import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { CreditCard, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import MemberLayout from '@/layouts/MemberLayout';

interface Amortization {
    id: number;
    due_date: string;
    amount_to_pay: number;
    principal_part: number;
    interest_part: number;
    status: string;
    total_paid: number;
}

interface LoanRow {
    id: number;
    principal_amount: number;
    term_months: number;
    interest_rate: number;
    total_payable: number;
    remaining_balance: number;
    status: string;
    created_at: string;
    amortizations: Amortization[];
}

interface Props {
    user: { name: string; email: string };
    member: { name: string };
    loans: LoanRow[];
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        active:    'bg-green-100 text-green-700',
        paid:      'bg-zinc-100 text-zinc-500',
        overdue:   'bg-red-100 text-red-600',
        pending:   'bg-yellow-100 text-yellow-700',
        cancelled: 'bg-zinc-100 text-zinc-400',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-500';
};

const amorStatusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    if (status === 'overdue') return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    return <Clock className="w-3.5 h-3.5 text-zinc-400" />;
};

export default function MemberLoans({ user, member, loans }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(loans[0]?.id ?? null);

    return (
        <MemberLayout user={user} title="My Loans">
            <Head title="My Loans — KSCFMPC Member Portal" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">My Loans</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">View all your loan details and amortization schedules.</p>
                </div>

                {loans.length === 0 ? (
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm py-16 text-center">
                        <CreditCard className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                        <p className="text-zinc-500 font-medium">No loans on record</p>
                        <p className="text-zinc-400 text-sm mt-1">Contact the cooperative to apply for a loan.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {loans.map(loan => {
                            const paidCount = loan.amortizations.filter(a => a.status === 'paid').length;
                            const progress = loan.amortizations.length > 0
                                ? Math.round((paidCount / loan.amortizations.length) * 100)
                                : 0;

                            return (
                                <div key={loan.id} className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                                    {/* Loan header */}
                                    <button
                                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
                                        onClick={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-9 h-9 rounded-lg bg-[#2d5a27]/10 flex items-center justify-center shrink-0">
                                                <CreditCard className="w-4 h-4 text-[#2d5a27]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-zinc-900">Loan #{loan.id}</span>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusBadge(loan.status)}`}>
                                                        {loan.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    {fmt(loan.principal_amount)} principal · {loan.term_months} months · {loan.interest_rate}% interest
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-zinc-400">Remaining</p>
                                                <p className="font-bold text-zinc-900 text-sm">{fmt(loan.remaining_balance)}</p>
                                            </div>
                                            {expandedId === loan.id
                                                ? <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                                                : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />}
                                        </div>
                                    </button>

                                    {/* Loan details */}
                                    {expandedId === loan.id && (
                                        <div className="border-t border-zinc-100">
                                            {/* Summary bar */}
                                            <div className="px-5 py-4 bg-zinc-50/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                                {[
                                                    { label: 'Principal', value: fmt(loan.principal_amount) },
                                                    { label: 'Total Payable', value: fmt(loan.total_payable) },
                                                    { label: 'Remaining', value: fmt(loan.remaining_balance) },
                                                    { label: 'Date Availed', value: loan.created_at },
                                                ].map(item => (
                                                    <div key={item.label}>
                                                        <p className="text-xs text-zinc-400">{item.label}</p>
                                                        <p className="font-semibold text-zinc-800">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Progress */}
                                            <div className="px-5 py-3 border-t border-zinc-100">
                                                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                                                    <span>Repayment Progress</span>
                                                    <span>{paidCount}/{loan.amortizations.length} paid ({progress}%)</span>
                                                </div>
                                                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#2d5a27] rounded-full transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Amortization table */}
                                            <div className="border-t border-zinc-100 overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-zinc-50">
                                                        <tr>
                                                            <th className="text-left px-5 py-2.5 font-semibold text-zinc-500">#</th>
                                                            <th className="text-left px-4 py-2.5 font-semibold text-zinc-500">Due Date</th>
                                                            <th className="text-right px-4 py-2.5 font-semibold text-zinc-500">Amount Due</th>
                                                            <th className="text-right px-4 py-2.5 font-semibold text-zinc-500">Principal</th>
                                                            <th className="text-right px-4 py-2.5 font-semibold text-zinc-500">Interest</th>
                                                            <th className="text-right px-4 py-2.5 font-semibold text-zinc-500">Paid</th>
                                                            <th className="text-center px-4 py-2.5 font-semibold text-zinc-500">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-50">
                                                        {loan.amortizations.map((a, idx) => (
                                                            <tr key={a.id} className={`hover:bg-zinc-50/50 ${
                                                                a.status === 'overdue' ? 'bg-red-50/30' : ''
                                                            }`}>
                                                                <td className="px-5 py-2.5 text-zinc-400">{idx + 1}</td>
                                                                <td className="px-4 py-2.5 text-zinc-600">{a.due_date}</td>
                                                                <td className="px-4 py-2.5 text-right font-medium text-zinc-800">{fmt(a.amount_to_pay)}</td>
                                                                <td className="px-4 py-2.5 text-right text-zinc-500">{fmt(a.principal_part)}</td>
                                                                <td className="px-4 py-2.5 text-right text-zinc-500">{fmt(a.interest_part)}</td>
                                                                <td className="px-4 py-2.5 text-right font-semibold text-[#2d5a27]">{fmt(a.total_paid)}</td>
                                                                <td className="px-4 py-2.5">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        {amorStatusIcon(a.status)}
                                                                        <span className={`capitalize text-[10px] font-semibold ${
                                                                            a.status === 'paid' ? 'text-green-600'
                                                                            : a.status === 'overdue' ? 'text-red-500'
                                                                            : 'text-zinc-400'
                                                                        }`}>{a.status}</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MemberLayout>
    );
}
