import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { CreditCard, Banknote, PiggyBank, Receipt, Plus, X } from 'lucide-react';
import MemberLayout from '@/layouts/MemberLayout';

interface Payment {
    id: number;
    loan_id: number | null;
    amount_paid: number;
    payment_date: string;
    payment_method: string;
    payment_type: string;
    reference_number: string | null;
    remarks: string | null;
    recorded_by: string;
    category: 'loan' | 'capital_share';
}

interface Loan {
    id: number;
    loan_type: string;
    remaining_balance: number;
    principal_amount: number;
}

interface Props {
    user: { name: string; email: string };
    member: {
        name: string;
        savings_balance: number;
        share_capital: number;
    };
    payments: Payment[];
    loans: Loan[];
    stats: {
        total_loan_paid: number;
        total_capital_paid: number;
        total_payments: number;
        last_payment: string | null;
    };
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const METHOD_BADGE: Record<string, string> = {
    cash:        'bg-zinc-100 text-zinc-600',
    gcash:       'bg-blue-100 text-blue-700',
    maya:        'bg-purple-100 text-purple-700',
    bpi:         'bg-red-100 text-red-700',
    credit_card: 'bg-amber-100 text-amber-700',
    debit_card:  'bg-amber-100 text-amber-700',
};

export default function MemberPayments({ user, member, payments, loans, stats }: Props) {
    const [showPayment, setShowPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        loan_id: '',
        amount: '',
        payment_method: 'cash',
        payment_type: 'onsite',
        reference_number: '',
        remarks: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isOnline = ['gcash', 'maya', 'bpi', 'credit_card', 'debit_card'].includes(paymentForm.payment_method);

    const selectedLoan = loans.find(l => l.id === Number(paymentForm.loan_id));

    const submitPayment = () => {
        setErrors({});
        setProcessing(true);
        router.post('/member/payments', paymentForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowPayment(false);
                setPaymentForm({ loan_id: '', amount: '', payment_method: 'cash', payment_type: 'onsite', reference_number: '', remarks: '' });
            },
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
        <MemberLayout user={user} title="Payments">
            <Head title="My Payments — KSCFMPC" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">My Payments</h1>
                        <p className="text-zinc-500 text-sm mt-0.5">
                            View your loan payments and capital share contributions.
                        </p>
                    </div>
                    {loans.length > 0 && (
                        <button
                            onClick={() => setShowPayment(true)}
                            className="flex items-center gap-1.5 bg-[#2d5a27] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#244a20] transition shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Make Payment
                        </button>
                    )}
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-[#2d5a27]/10 flex items-center justify-center mb-2">
                            <CreditCard className="w-4 h-4 text-[#2d5a27]" />
                        </div>
                        <p className="text-xs text-zinc-400">Total Payments</p>
                        <p className="text-xl font-bold text-zinc-900">{stats.total_payments}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-[#2d5a27]/10 flex items-center justify-center mb-2">
                            <Banknote className="w-4 h-4 text-[#2d5a27]" />
                        </div>
                        <p className="text-xs text-zinc-400">Total Loan Paid</p>
                        <p className="text-xl font-bold text-[#2d5a27]">{fmt(stats.total_loan_paid)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-[#c8920a]/10 flex items-center justify-center mb-2">
                            <PiggyBank className="w-4 h-4 text-[#c8920a]" />
                        </div>
                        <p className="text-xs text-zinc-400">Capital Contributed</p>
                        <p className="text-xl font-bold text-[#c8920a]">{fmt(stats.total_capital_paid)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center mb-2">
                            <Receipt className="w-4 h-4 text-zinc-500" />
                        </div>
                        <p className="text-xs text-zinc-400">Last Payment</p>
                        <p className="text-sm font-bold text-zinc-700">{stats.last_payment ?? '—'}</p>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100">
                        <h3 className="font-semibold text-zinc-800">Payment History</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">All loan payments and capital share contributions</p>
                    </div>

                    {payments.length === 0 ? (
                        <div className="py-16 text-center">
                            <CreditCard className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                            <p className="text-sm text-zinc-400">No payments recorded yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Date</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Category</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Amount</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Method</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:table-cell">Reference</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:table-cell">Recorded By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {payments.map((p) => (
                                        <tr key={`${p.category}-${p.id}`} className="hover:bg-zinc-50/50 transition">
                                            <td className="px-5 py-3.5 text-zinc-500 text-xs whitespace-nowrap">{p.payment_date}</td>
                                            <td className="px-4 py-3.5">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                    p.category === 'capital_share'
                                                        ? 'bg-[#c8920a]/10 text-[#c8920a]'
                                                        : 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                                }`}>
                                                    {p.category === 'capital_share' ? '🏦 Capital' : '💳 Loan'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-semibold text-[#2d5a27]">
                                                {fmt(p.amount_paid)}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full capitalize ${
                                                    METHOD_BADGE[p.payment_method] ?? 'bg-zinc-100 text-zinc-600'
                                                }`}>
                                                    {p.payment_method.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-zinc-400 text-xs hidden sm:table-cell font-mono">
                                                {p.reference_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3.5 text-zinc-400 text-xs hidden sm:table-cell">
                                                {p.recorded_by}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Info note */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-500">
                    💡 Payments are recorded by cooperative staff. If you see any discrepancy,
                    please contact your cooperative administrator.
                </div>

            </div>
        </MemberLayout>

        {/* Make Payment Dialog */}
        {showPayment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                        <h2 className="font-semibold text-zinc-800">Make a Loan Payment</h2>
                        <button onClick={() => setShowPayment(false)} className="text-zinc-400 hover:text-zinc-600 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="px-6 py-5 space-y-4">

                        {/* Loan selector */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Select Loan *</label>
                            <select
                                value={paymentForm.loan_id}
                                onChange={e => setPaymentForm(f => ({ ...f, loan_id: e.target.value }))}
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            >
                                <option value="">— Choose loan —</option>
                                {loans.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.loan_type} — Balance: {fmt(l.remaining_balance)}
                                    </option>
                                ))}
                            </select>
                            {selectedLoan && (
                                <p className="text-xs text-zinc-400 mt-1">
                                    Remaining balance: <span className="font-semibold text-zinc-600">{fmt(selectedLoan.remaining_balance)}</span>
                                </p>
                            )}
                            {errors.loan_id && <p className="text-xs text-red-500 mt-1">{errors.loan_id}</p>}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Amount (₱) *</label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                max={selectedLoan?.remaining_balance}
                                value={paymentForm.amount}
                                onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                                placeholder="0.00"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            />
                            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Payment Method *</label>
                            <select
                                value={paymentForm.payment_method}
                                onChange={e => setPaymentForm(f => ({
                                    ...f,
                                    payment_method: e.target.value,
                                    payment_type: ['gcash','maya','bpi','credit_card','debit_card'].includes(e.target.value) ? 'online' : 'onsite',
                                }))}
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            >
                                <option value="cash">Cash</option>
                                <option value="gcash">GCash</option>
                                <option value="maya">Maya</option>
                                <option value="bpi">BPI</option>
                                <option value="credit_card">Credit Card</option>
                                <option value="debit_card">Debit Card</option>
                            </select>
                        </div>

                        {/* Reference Number (online only) */}
                        {isOnline && (
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Reference Number *</label>
                                <input
                                    type="text"
                                    value={paymentForm.reference_number}
                                    onChange={e => setPaymentForm(f => ({ ...f, reference_number: e.target.value }))}
                                    placeholder="Transaction reference"
                                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                                />
                            </div>
                        )}

                        {/* Remarks */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Remarks (optional)</label>
                            <input
                                type="text"
                                value={paymentForm.remarks}
                                onChange={e => setPaymentForm(f => ({ ...f, remarks: e.target.value }))}
                                placeholder="e.g. Monthly amortization"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2">
                        <button
                            onClick={() => setShowPayment(false)}
                            className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitPayment}
                            disabled={processing || !paymentForm.loan_id || !paymentForm.amount || (isOnline && !paymentForm.reference_number)}
                            className="px-4 py-2 text-sm bg-[#2d5a27] text-white rounded-xl hover:bg-[#244a20] transition disabled:opacity-50"
                        >
                            {processing ? 'Processing…' : 'Submit Payment'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}