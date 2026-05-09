import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PiggyBank, TrendingUp, Plus, Minus, CheckCircle2 } from 'lucide-react';
import MemberLayout from '@/layouts/MemberLayout';
import * as savingsRoutes from '@/routes/member/savings';

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

function DepositForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        remarks: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(savingsRoutes.deposit().url, {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Amount</label>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={data.amount}
                    onChange={e => setData('amount', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                    required
                />
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
            </div>
            <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Remarks (Optional)</label>
                <input
                    type="text"
                    value={data.remarks}
                    onChange={e => setData('remarks', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Monthly savings"
                />
                {errors.remarks && <p className="text-xs text-red-600 mt-1">{errors.remarks}</p>}
            </div>
            <button
                type="submit"
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
                {processing ? 'Processing...' : 'Deposit'}
            </button>
        </form>
    );
}

function WithdrawalForm({ savingsBalance }: { savingsBalance: number }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        remarks: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(savingsRoutes.withdraw().url, {
            onSuccess: () => {
                reset();
            },
        });
    };

    const maxWithdrawal = Math.min(savingsBalance, 50000); // Reasonable daily limit

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Amount</label>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={maxWithdrawal}
                    value={data.amount}
                    onChange={e => setData('amount', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="0.00"
                    required
                />
                <p className="text-xs text-zinc-500 mt-1">Available: {fmt(savingsBalance)}</p>
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
            </div>
            <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Remarks (Optional)</label>
                <input
                    type="text"
                    value={data.remarks}
                    onChange={e => setData('remarks', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., Emergency withdrawal"
                />
                {errors.remarks && <p className="text-xs text-red-600 mt-1">{errors.remarks}</p>}
            </div>
            <button
                type="submit"
                disabled={processing || parseFloat(data.amount) > savingsBalance}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
                {processing ? 'Processing...' : 'Withdraw'}
            </button>
        </form>
    );
}

export default function MemberSavings({ user, member, savings_history, capital_history }: Props) {
    const [tab, setTab] = useState<'savings' | 'capital'>('savings');
    const list = tab === 'savings' ? savings_history : capital_history;
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;

    return (
        <MemberLayout user={user} title="Savings">
            <Head title="Savings — KSCFMPC Member Portal" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Savings & Capital</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">View your savings and capital share transactions.</p>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {flash.error}
                    </div>
                )}

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

                {/* Transaction Forms */}
                <div className="grid sm:grid-cols-2 gap-4">
                    {/* Deposit Form */}
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Plus className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">Deposit to Savings</p>
                                <p className="text-xs text-zinc-500">Add money to your savings account</p>
                            </div>
                        </div>
                        <DepositForm />
                    </div>

                    {/* Withdrawal Form */}
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <Minus className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">Withdraw from Savings</p>
                                <p className="text-xs text-zinc-500">Withdraw money from your savings account</p>
                            </div>
                        </div>
                        <WithdrawalForm savingsBalance={member.savings_balance} />
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
