import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { PiggyBank, TrendingUp } from 'lucide-react';
import MemberLayout from '@/layouts/MemberLayout';

interface Transaction {
    id: number;
    type: string;
    amount: number;
    balance_after: number;
    remarks: string | null;
    created_at: string;
}

interface Props {
    user: { name: string; email: string };
    member: {
        name: string;
        savings_balance: number;
        share_capital: number;
    };
    savings_history: Transaction[];
    capital_history: Transaction[];
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function MemberSavings({ user, member, savings_history, capital_history }: Props) {
    const [tab, setTab] = useState<'savings' | 'capital'>('savings');
    const list = tab === 'savings' ? savings_history : capital_history;

    return (
        <MemberLayout user={user} title="Savings">
            <Head title="Savings — KSCFMPC Member Portal" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Savings & Capital</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">View your savings and capital share transactions.</p>
                </div>

                {/* Balance cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[#2d5a27]/10 flex items-center justify-center">
                                <PiggyBank className="w-5 h-5 text-[#2d5a27]" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-600">Savings Balance</p>
                        </div>
                        <p className="text-3xl font-black text-[#2d5a27]">{fmt(member.savings_balance)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[#c8920a]/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-[#c8920a]" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-600">Capital Share</p>
                        </div>
                        <p className="text-3xl font-black text-[#c8920a]">{fmt(member.share_capital)}</p>
                    </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-1">
                        {(['savings', 'capital'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    tab === t
                                        ? 'bg-[#2d5a27] text-white'
                                        : 'text-zinc-500 hover:bg-zinc-100'
                                }`}
                            >
                                {t === 'savings' ? 'Savings History' : 'Capital History'}
                            </button>
                        ))}
                    </div>

                    {list.length === 0 ? (
                        <div className="py-12 text-center text-sm text-zinc-400">No transactions yet.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50">
                                <tr>
                                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Date</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Type</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Amount</th>
                                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Balance After</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase hidden sm:table-cell">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {list.map(t => (
                                    <tr key={t.id} className="hover:bg-zinc-50/50">
                                        <td className="px-5 py-3 text-zinc-500 text-xs">{t.created_at}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                t.type === 'deposit' || t.type === 'credit'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-semibold ${
                                            t.type === 'deposit' || t.type === 'credit'
                                                ? 'text-green-600'
                                                : 'text-red-500'
                                        }`}>
                                            {t.type === 'deposit' || t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-700">{fmt(t.balance_after)}</td>
                                        <td className="px-4 py-3 text-zinc-400 text-xs hidden sm:table-cell">{t.remarks || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </MemberLayout>
    );
}
