import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PiggyBank, TrendingUp, Plus, Minus, CheckCircle2, X } from 'lucide-react';
import MemberLayout from '@/layouts/MemberLayout';
import * as savingsRoutes from '@/routes/member/savings';

interface Transaction {
    id: number;
    type: string;
    amount: number;
    balance_after: number;
    transaction_date: string;
    notes: string | null;
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
    savings_transactions?: Transaction[];
    capital_transactions?: Transaction[];
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TYPE_COLORS: Record<string, string> = {
    deposit:      'bg-green-100 text-green-700',
    credit:       'bg-green-100 text-green-700',
    from_copra:   'bg-[#c8920a]/10 text-[#c8920a]',
    contribution: 'bg-[#c8920a]/10 text-[#c8920a]',
    dividend:     'bg-blue-100 text-blue-700',
    interest:     'bg-blue-100 text-blue-700',
    adjustment:   'bg-purple-100 text-purple-700',
    withdrawal:   'bg-red-100 text-red-600',
    debit:        'bg-red-100 text-red-600',
};

const isCredit = (type: string) =>
    ['deposit', 'credit', 'from_copra', 'contribution', 'dividend', 'interest', 'adjustment'].includes(type);

function DepositForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        remarks: '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(savingsRoutes.deposit().url, {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <form onSubmit={submit} action={savingsRoutes.deposit().url} method="post" className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Amount</label>
                <input
                    name="amount"
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
        <form onSubmit={submit} action={savingsRoutes.withdraw().url} method="post" className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Amount</label>
                <input
                    name="amount"
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
                    name="remarks"
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

    const [showDeposit, setShowDeposit] = useState(false);
    const [depositForm, setDepositForm] = useState({ amount: '', remarks: '' });
    const [processing, setProcessing] = useState(false);

    const submitDeposit = () => {
        if (!depositForm.amount || Number(depositForm.amount) < 1) return;
        setProcessing(true);
        router.post('/member/savings/deposit', depositForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeposit(false);
                setDepositForm({ amount: '', remarks: '' });
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
        <MemberLayout user={user} title="Savings">
            <Head title="Savings — KSCFMPC Member Portal" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Savings & Capital</h1>
                        <p className="text-zinc-500 text-sm mt-0.5">
                            View your savings balance and capital share transactions.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDeposit(true)}
                        className="flex items-center gap-1.5 bg-[#2d5a27] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#244a20] transition shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add Deposit
                    </button>
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

                    {/* Savings Balance */}
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-[#2d5a27]/10 flex items-center justify-center">
                                <PiggyBank className="w-5 h-5 text-[#2d5a27]" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-400">Savings Balance</p>
                                <p className="text-xs text-zinc-500">Earns 2% CA interest annually</p>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-[#2d5a27]">
                            {fmt(member.savings_balance)}
                        </p>
                        <div className="mt-3 pt-3 border-t border-zinc-100">
                            <p className="text-xs text-zinc-400">
                                Estimated interest this year:
                                <span className="font-semibold text-[#2d5a27] ml-1">
                                    {fmt(member.savings_balance * 0.02)}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Capital Share */}
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-[#c8920a]/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-[#c8920a]" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-400">Capital Share</p>
                                <p className="text-xs text-zinc-500">Earns annual dividends (70/30)</p>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-[#c8920a]">
                            {fmt(member.share_capital)}
                        </p>
                        <div className="mt-3 pt-3 border-t border-zinc-100">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-zinc-400">Loan eligibility minimum:</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    member.share_capital >= 20000
                                        ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                        : 'bg-red-100 text-red-600'
                                }`}>
                                    {member.share_capital >= 20000
                                        ? '✓ Meets ₱20,000 minimum'
                                        : `₱${(20000 - member.share_capital).toLocaleString()} more needed`}
                                </span>
                            </div>
                        </div>
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
                                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                                    tab === t
                                        ? t === 'savings'
                                            ? 'bg-[#2d5a27] text-white'
                                            : 'bg-[#c8920a] text-white'
                                        : 'text-zinc-500 hover:bg-zinc-100'
                                }`}
                            >
                                {t === 'savings' ? 'Savings History' : 'Capital History'}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-zinc-400">
                            {list.length} transaction{list.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Table */}
                    {list.length === 0 ? (
                        <div className="py-16 text-center">
                            <PiggyBank className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                            <p className="text-sm text-zinc-400">No transactions yet.</p>
                            <p className="text-xs text-zinc-300 mt-1">
                                {tab === 'savings'
                                    ? 'Your savings deposits will appear here.'
                                    : 'Your capital share contributions will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                            Date
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                            Type
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                            Amount
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                            Balance After
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:table-cell">
                                            Notes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {list.map(t => (
                                        <tr key={t.id} className="hover:bg-zinc-50/50 transition">
                                            <td className="px-5 py-3.5 text-zinc-500 text-xs whitespace-nowrap">
                                                {t.transaction_date || t.created_at}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                    TYPE_COLORS[t.type] ?? 'bg-zinc-100 text-zinc-600'
                                                }`}>
                                                    {t.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3.5 text-right font-semibold ${
                                                isCredit(t.type) ? 'text-[#2d5a27]' : 'text-red-500'
                                            }`}>
                                                {isCredit(t.type) ? '+' : '-'}{fmt(t.amount)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-zinc-700 font-medium">
                                                {fmt(t.balance_after)}
                                            </td>
                                            <td className="px-4 py-3.5 text-zinc-400 text-xs hidden sm:table-cell">
                                                {t.notes || t.remarks || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </MemberLayout>

        {/* Deposit Dialog */}
        {showDeposit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                        <h2 className="font-semibold text-zinc-800">Add Savings Deposit</h2>
                        <button onClick={() => setShowDeposit(false)} className="text-zinc-400 hover:text-zinc-600 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="px-6 py-5 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Amount (₱) *</label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={depositForm.amount}
                                onChange={e => setDepositForm(f => ({ ...f, amount: e.target.value }))}
                                placeholder="0.00"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Remarks (optional)</label>
                            <input
                                type="text"
                                value={depositForm.remarks}
                                onChange={e => setDepositForm(f => ({ ...f, remarks: e.target.value }))}
                                placeholder="e.g. Monthly savings"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2">
                        <button
                            onClick={() => setShowDeposit(false)}
                            className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitDeposit}
                            disabled={processing || !depositForm.amount}
                            className="px-4 py-2 text-sm bg-[#2d5a27] text-white rounded-xl hover:bg-[#244a20] transition disabled:opacity-50"
                        >
                            {processing ? 'Processing…' : 'Submit Deposit'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}