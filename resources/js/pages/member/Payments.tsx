import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    CreditCard, Banknote, PiggyBank, Receipt, Plus, X,
    Smartphone, Building2, Loader2, WifiHigh, CheckCircle2,
} from 'lucide-react';
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

interface ActiveLoan {
    id: number;
    remaining_balance: number;
    amortizations: {
        id: number;
        due_date: string;
        amount_to_pay: number;
        status: string;
    }[];
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
    activeLoans: ActiveLoan[];
    stats: {
        total_loan_paid: number;
        total_capital_paid: number;
        total_payments: number;
        last_payment: string | null;
    };
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const today = new Date().toISOString().split('T')[0];

const METHOD_BADGE: Record<string, string> = {
    cash:         'bg-zinc-100 text-zinc-600',
    gcash:        'bg-emerald-100 text-emerald-700',
    GCash:        'bg-emerald-100 text-emerald-700',
    maya:         'bg-purple-100 text-purple-700',
    Maya:         'bg-purple-100 text-purple-700',
    bpi:          'bg-red-100 text-red-700',
    BPI:          'bg-red-100 text-red-700',
    credit_card:  'bg-blue-100 text-blue-700',
    'Credit Card':'bg-blue-100 text-blue-700',
    debit_card:   'bg-amber-100 text-amber-700',
    'Debit Card': 'bg-amber-100 text-amber-700',
};

const ONLINE_METHODS = [
    {
        id: 'GCash',
        label: 'GCash',
        icon: Smartphone,
        color: 'border-emerald-400 bg-emerald-50 text-emerald-700',
        ring: 'ring-emerald-400',
        placeholder: 'e.g. 1234567890',
    },
    {
        id: 'Maya',
        label: 'Maya',
        icon: Smartphone,
        color: 'border-purple-400 bg-purple-50 text-purple-700',
        ring: 'ring-purple-400',
        placeholder: 'e.g. TXN-ABC123',
    },
    {
        id: 'BPI',
        label: 'BPI',
        icon: Building2,
        color: 'border-red-400 bg-red-50 text-red-700',
        ring: 'ring-red-400',
        placeholder: 'e.g. BPI-REF-123456',
    },
    {
        id: 'Credit Card',
        label: 'Credit Card',
        icon: CreditCard,
        color: 'border-blue-400 bg-blue-50 text-blue-700',
        ring: 'ring-blue-400',
        placeholder: 'e.g. AUTH-123456',
    },
] as const;

type MethodId = typeof ONLINE_METHODS[number]['id'];

interface OnlineForm {
    category: 'loan' | 'capital_share';
    loan_id: string;
    amortization_id: string;
    amount: string;
    payment_method: MethodId | '';
    reference_number: string;
    payment_date: string;
}

const EMPTY_ONLINE: OnlineForm = {
    category: 'loan',
    loan_id: '',
    amortization_id: '',
    amount: '',
    payment_method: '',
    reference_number: '',
    payment_date: today,
};

export default function MemberPayments({ user, member, payments, loans, activeLoans, stats }: Props) {
    // ── Existing onsite payment dialog ──
    const [showPayment, setShowPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        loan_id: '',
        amount: '',
        payment_method: 'cash',
        payment_type: 'onsite',
        reference_number: '',
        remarks: '',
    });
    const [onsiteProcessing, setOnsiteProcessing] = useState(false);
    const [onsiteErrors, setOnsiteErrors] = useState<Record<string, string>>({});

    const isOnline = ['gcash', 'maya', 'bpi', 'credit_card', 'debit_card'].includes(paymentForm.payment_method);
    const selectedLoan = loans.find((l) => l.id === Number(paymentForm.loan_id));

    const submitPayment = () => {
        setOnsiteErrors({});
        setOnsiteProcessing(true);
        router.post('/member/payments', paymentForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowPayment(false);
                setPaymentForm({ loan_id: '', amount: '', payment_method: 'cash', payment_type: 'onsite', reference_number: '', remarks: '' });
            },
            onError: (errs) => setOnsiteErrors(errs),
            onFinish: () => setOnsiteProcessing(false),
        });
    };

    // ── Online payment dialog ──
    const [showOnline, setShowOnline] = useState(false);
    const [onlineForm, setOnlineForm] = useState<OnlineForm>(EMPTY_ONLINE);
    const [onlineErrors, setOnlineErrors] = useState<Record<string, string>>({});
    const [onlineProcessing, setOnlineProcessing] = useState(false);
    const [simulatingGateway, setSimulatingGateway] = useState(false);

    const selectedActiveLoan = activeLoans.find((l) => l.id === Number(onlineForm.loan_id));
    const selectedAmortization = selectedActiveLoan?.amortizations.find(
        (a) => a.id === Number(onlineForm.amortization_id),
    );
    const selectedMethod = ONLINE_METHODS.find((m) => m.id === onlineForm.payment_method);

    const submitOnlinePayment = () => {
        setOnlineErrors({});
        setSimulatingGateway(true);

        // Brief gateway simulation before actual submit
        setTimeout(() => {
            setSimulatingGateway(false);
            setOnlineProcessing(true);
            router.post('/member/payments/online', {
                category:         onlineForm.category,
                loan_id:          onlineForm.loan_id || null,
                amortization_id:  onlineForm.amortization_id || null,
                amount:           onlineForm.amount,
                payment_method:   onlineForm.payment_method,
                reference_number: onlineForm.reference_number,
                payment_date:     onlineForm.payment_date,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowOnline(false);
                    setOnlineForm(EMPTY_ONLINE);
                },
                onError: (errs) => setOnlineErrors(errs),
                onFinish: () => setOnlineProcessing(false),
            });
        }, 1400);
    };

    const canSubmitOnline =
        onlineForm.payment_method !== '' &&
        onlineForm.reference_number.trim() !== '' &&
        onlineForm.amount !== '' &&
        Number(onlineForm.amount) >= 100 &&
        (onlineForm.category === 'capital_share' || onlineForm.loan_id !== '') &&
        !onlineProcessing &&
        !simulatingGateway;

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
                    <div className="flex items-center gap-2 shrink-0">
                        {loans.length > 0 && (
                            <button
                                onClick={() => setShowPayment(true)}
                                className="flex items-center gap-1.5 border border-zinc-200 text-zinc-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-zinc-50 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Make Payment
                            </button>
                        )}
                        <button
                            onClick={() => setShowOnline(true)}
                            className="flex items-center gap-1.5 bg-[#2d5a27] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#244a20] transition"
                        >
                            <WifiHigh className="w-4 h-4" />
                            Pay Online
                        </button>
                    </div>
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
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
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

        {/* ── Existing onsite Make Payment Dialog ── */}
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
                            {onsiteErrors.loan_id && <p className="text-xs text-red-500 mt-1">{onsiteErrors.loan_id}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Amount (₱) *</label>
                            <input
                                type="number" min="1" step="0.01" max={selectedLoan?.remaining_balance}
                                value={paymentForm.amount}
                                onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                                placeholder="0.00"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            />
                            {onsiteErrors.amount && <p className="text-xs text-red-500 mt-1">{onsiteErrors.amount}</p>}
                        </div>
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
                            disabled={onsiteProcessing || !paymentForm.loan_id || !paymentForm.amount || (isOnline && !paymentForm.reference_number)}
                            className="px-4 py-2 text-sm bg-[#2d5a27] text-white rounded-xl hover:bg-[#244a20] transition disabled:opacity-50"
                        >
                            {onsiteProcessing ? 'Processing…' : 'Submit Payment'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* ── Online Payment Dialog ── */}
        {showOnline && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[92vh] flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <WifiHigh className="w-4 h-4 text-[#2d5a27]" />
                            <h2 className="font-semibold text-zinc-800">Online Payment</h2>
                        </div>
                        <button
                            onClick={() => { setShowOnline(false); setOnlineForm(EMPTY_ONLINE); setOnlineErrors({}); }}
                            className="text-zinc-400 hover:text-zinc-600 transition"
                            disabled={onlineProcessing || simulatingGateway}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto px-6 py-5 space-y-5">

                        {/* Demo Notice */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                            🧪 <span className="font-semibold">Demo Mode</span> — This simulates an online payment.
                            PayMongo integration coming soon.
                        </div>

                        {/* Category Toggle */}
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 mb-2">Payment Type</p>
                            <div className="flex rounded-xl border border-zinc-200 overflow-hidden text-sm font-medium">
                                <button
                                    onClick={() => setOnlineForm(f => ({ ...f, category: 'loan', loan_id: '', amortization_id: '', amount: '' }))}
                                    className={`flex-1 py-2.5 transition ${onlineForm.category === 'loan' ? 'bg-[#2d5a27] text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                >
                                    💳 Loan Payment
                                </button>
                                <button
                                    onClick={() => setOnlineForm(f => ({ ...f, category: 'capital_share', loan_id: '', amortization_id: '', amount: '' }))}
                                    className={`flex-1 py-2.5 transition ${onlineForm.category === 'capital_share' ? 'bg-[#2d5a27] text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                >
                                    🏦 Capital Share
                                </button>
                            </div>
                        </div>

                        {/* Loan selector */}
                        {onlineForm.category === 'loan' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Select Loan *</label>
                                    {activeLoans.length === 0 ? (
                                        <p className="text-sm text-zinc-400 py-2">No active loans found.</p>
                                    ) : (
                                        <select
                                            value={onlineForm.loan_id}
                                            onChange={e => setOnlineForm(f => ({ ...f, loan_id: e.target.value, amortization_id: '', amount: '' }))}
                                            className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                                        >
                                            <option value="">— Choose loan —</option>
                                            {activeLoans.map(l => (
                                                <option key={l.id} value={l.id}>
                                                    Loan #{l.id} — Balance: {fmt(l.remaining_balance)}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {onlineErrors.loan_id && <p className="text-xs text-red-500 mt-1">{onlineErrors.loan_id}</p>}
                                </div>

                                {/* Amortization selector */}
                                {selectedActiveLoan && selectedActiveLoan.amortizations.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Select Due Schedule</label>
                                        <select
                                            value={onlineForm.amortization_id}
                                            onChange={e => {
                                                const a = selectedActiveLoan.amortizations.find(x => x.id === Number(e.target.value));
                                                setOnlineForm(f => ({
                                                    ...f,
                                                    amortization_id: e.target.value,
                                                    amount: a ? String(a.amount_to_pay) : f.amount,
                                                }));
                                            }}
                                            className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                                        >
                                            <option value="">— Choose schedule (optional) —</option>
                                            {selectedActiveLoan.amortizations.map(a => (
                                                <option key={a.id} value={a.id}>
                                                    Due {a.due_date} — {fmt(a.amount_to_pay)} ({a.status})
                                                </option>
                                            ))}
                                        </select>
                                        {selectedAmortization && (
                                            <p className="text-xs text-zinc-400 mt-1">
                                                Amount pre-filled from selected schedule.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Method Cards */}
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 mb-2">Payment Method *</p>
                            <div className="grid grid-cols-2 gap-2">
                                {ONLINE_METHODS.map((m) => {
                                    const Icon = m.icon;
                                    const selected = onlineForm.payment_method === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => setOnlineForm(f => ({ ...f, payment_method: m.id, reference_number: '' }))}
                                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition ${
                                                selected
                                                    ? `${m.color} ${m.ring} ring-2`
                                                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            {m.label}
                                            {selected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                            {onlineErrors.payment_method && <p className="text-xs text-red-500 mt-1">{onlineErrors.payment_method}</p>}
                        </div>

                        {/* Amount + Date + Reference */}
                        {onlineForm.payment_method && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Amount (₱) *</label>
                                    <input
                                        type="number" min="100" step="0.01"
                                        value={onlineForm.amount}
                                        onChange={e => setOnlineForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                                    />
                                    <p className="text-[10px] text-zinc-400 mt-0.5">Minimum ₱100.00</p>
                                    {onlineErrors.amount && <p className="text-xs text-red-500 mt-1">{onlineErrors.amount}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Payment Date *</label>
                                    <input
                                        type="date" max={today}
                                        value={onlineForm.payment_date}
                                        onChange={e => setOnlineForm(f => ({ ...f, payment_date: e.target.value }))}
                                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1">
                                        {onlineForm.payment_method} Reference Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={onlineForm.reference_number}
                                        onChange={e => setOnlineForm(f => ({ ...f, reference_number: e.target.value }))}
                                        placeholder={selectedMethod?.placeholder ?? 'Enter reference number'}
                                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                                    />
                                    {onlineErrors.reference_number && <p className="text-xs text-red-500 mt-1">{onlineErrors.reference_number}</p>}
                                </div>
                            </div>
                        )}

                        {/* Gateway animation overlay (shown briefly when simulating) */}
                        {simulatingGateway && (
                            <div className="flex flex-col items-center gap-3 py-4">
                                <Loader2 className="w-8 h-8 text-[#2d5a27] animate-spin" />
                                <p className="text-sm font-medium text-zinc-600">
                                    Connecting to {onlineForm.payment_method}…
                                </p>
                                <p className="text-xs text-zinc-400">Please wait, verifying reference number</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2 shrink-0">
                        <button
                            onClick={() => { setShowOnline(false); setOnlineForm(EMPTY_ONLINE); setOnlineErrors({}); }}
                            disabled={onlineProcessing || simulatingGateway}
                            className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-xl transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitOnlinePayment}
                            disabled={!canSubmitOnline}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[#2d5a27] text-white rounded-xl hover:bg-[#244a20] transition disabled:opacity-50"
                        >
                            {(onlineProcessing || simulatingGateway) ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing…
                                </>
                            ) : (
                                <>
                                    Pay {onlineForm.amount ? fmt(Number(onlineForm.amount)) : ''}
                                    {onlineForm.payment_method ? ` via ${onlineForm.payment_method}` : ''}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
