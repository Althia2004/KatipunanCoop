import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Pencil, Receipt } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoanOption {
    id: number;
    remaining_balance: number;
    status: string;
}

interface MemberOption {
    id: number;
    name: string;
    share_capital: number;
    savings_balance: number;
    loans: LoanOption[];
}

interface Payment {
    id: number;
    loan_id: number | null;
    member_name: string;
    amount_paid: number;
    payment_date: string;
    payment_method: string;
    payment_type: string;
    reference_number: string | null;
    remarks: string | null;
    recorded_by_name: string;
    updated_by_name: string | null;
    recorded_at: string;
    updated_at: string;
    category: 'loan' | 'capital_share';
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Stats {
    total: number;
    collected: number;
    onsite: number;
    online: number;
}

interface Props {
    payments: Paginated<Payment>;
    stats: Stats;
    members: MemberOption[];
    filters: { search: string; method: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const today = new Date().toISOString().slice(0, 10);

const methodBadge: Record<string, string> = {
    Cash:          'bg-zinc-100 text-zinc-700 border-zinc-200',
    GCash:         'bg-blue-100 text-blue-700 border-blue-200',
    Maya:          'bg-purple-100 text-purple-700 border-purple-200',
    BPI:           'bg-red-100 text-red-700 border-red-200',
    'Credit Card': 'bg-amber-100 text-amber-700 border-amber-200',
    'Debit Card':  'bg-amber-100 text-amber-700 border-amber-200',
};

const typeBadge: Record<string, string> = {
    onsite: 'bg-green-100 text-green-800 border-green-200',
    online: 'bg-blue-100 text-blue-800 border-blue-200',
};

const METHODS = ['Cash', 'GCash', 'Maya', 'BPI', 'Credit Card', 'Debit Card'];
const FILTER_METHODS = ['', 'Cash', 'GCash', 'Maya', 'BPI', 'Credit Card', 'Debit Card'];

// ─── Default form state ───────────────────────────────────────────────────────

const blankForm = {
    loan_id: '',
    amount_paid: '',
    payment_date: today,
    payment_method: 'Cash',
    payment_type: 'onsite',
    reference_number: '',
    remarks: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentDashboard({ payments, stats, members, filters }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const [search, setSearch] = useState(filters.search ?? '');
    const [method, setMethod] = useState(filters.method ?? '');

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Payment | null>(null);

    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [form, setForm] = useState({ ...blankForm });
    const [editForm, setEditForm] = useState({ ...blankForm });
    const [submitting, setSubmitting] = useState(false);
    const [paymentCategory, setPaymentCategory] = useState<'loan' | 'capital_share'>('loan');

    const apply = useCallback(
        (s: string, m: string) => {
            router.get('/user/payments', { search: s, method: m }, { preserveState: true, replace: true });
        },
        [],
    );

    useEffect(() => {
        const t = setTimeout(() => apply(search, method), 400);
        return () => clearTimeout(t);
    }, [search]);

    const selectedMember = members.find((m) => m.id.toString() === selectedMemberId);
    const activeLoans = selectedMember?.loans ?? [];

    // ── Add ──────────────────────────────────────────────────────────────────

    const handleAdd = () => {
        setForm({ ...blankForm });
        setSelectedMemberId('');
        setPaymentCategory('loan');
        setAddOpen(true);
    };

    const isAddValid = (): boolean => {
        if (!selectedMemberId || !form.amount_paid || !form.payment_date) return false;
        if (paymentCategory === 'loan') {
            if ((selectedMember?.share_capital ?? 0) < 20000) return false;
            if (!form.loan_id) return false;
        }
        if (form.payment_type === 'online' && !form.reference_number) return false;
        return true;
    };

    const handleSubmitAdd = () => {
        setSubmitting(true);
        if (paymentCategory === 'capital_share') {
            router.post('/user/payments/capital', {
                member_id:        selectedMemberId,
                amount_paid:      form.amount_paid,
                payment_date:     form.payment_date,
                payment_method:   form.payment_method,
                payment_type:     form.payment_type,
                reference_number: form.reference_number,
                remarks:          form.remarks,
            }, {
                onSuccess: () => { setAddOpen(false); setSubmitting(false); },
                onError:   () => setSubmitting(false),
                preserveScroll: true,
            });
        } else {
            router.post('/user/payments', form as Record<string, string>, {
                onSuccess: () => { setAddOpen(false); setSubmitting(false); },
                onError:   () => setSubmitting(false),
                preserveScroll: true,
            });
        }
    };

    // ── Edit ─────────────────────────────────────────────────────────────────

    const handleEdit = (p: Payment) => {
        setEditTarget(p);
        setEditForm({
            loan_id:          (p.loan_id ?? '').toString(),
            amount_paid:      p.amount_paid.toString(),
            payment_date:     p.payment_date,
            payment_method:   p.payment_method,
            payment_type:     p.payment_type,
            reference_number: p.reference_number ?? '',
            remarks:          p.remarks ?? '',
        });
        setEditOpen(true);
    };

    const handleSubmitEdit = () => {
        if (!editTarget) return;
        setSubmitting(true);
        router.put(`/user/payments/${editTarget.id}`, editForm as Record<string, string>, {
            onSuccess: () => { setEditOpen(false); setSubmitting(false); },
            onError:   () => setSubmitting(false),
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Payment Dashboard" />
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#2d5a27]/10 border border-[#2d5a27]/20 rounded-xl text-sm text-[#2d5a27] font-medium">
                        {flash.success}
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">User Management</p>
                        <h1 className="text-2xl font-bold text-[#2d5a27]">Payment Dashboard</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">Record and track loan payments</p>
                    </div>
                    <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#234820] transition">
                        <Plus className="w-4 h-4" />
                        Add Payment
                    </button>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Payments',  value: stats.total.toString() },
                        { label: 'Total Collected', value: fmt(stats.collected) },
                        { label: 'Onsite Payments', value: stats.onsite.toString() },
                        { label: 'Online Payments', value: stats.online.toString() },
                    ].map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                            <p className="text-xs font-medium text-zinc-500 mb-1">{s.label}</p>
                            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search member name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 sm:w-64 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {FILTER_METHODS.map((m) => (
                            <button
                                key={m || 'all'}
                                onClick={() => { setMethod(m); apply(search, m); }}
                                className={`h-9 px-3 text-sm font-medium rounded-xl transition ${
                                    method === m
                                        ? 'bg-[#2d5a27] text-white'
                                        : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                }`}
                            >
                                {m || 'All'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                                {['Member', 'Loan #', 'Amount', 'Method', 'Type', 'Date', 'Recorded By', 'Actions'].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {payments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-zinc-400">
                                            <CreditCard className="w-8 h-8" />
                                            <p className="text-sm">No payments found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : payments.data.map((p) => (
                                <tr key={p.id} className="hover:bg-zinc-50 transition">
                                    <td className="px-5 py-3.5 font-medium text-zinc-800">{p.member_name}</td>
                                    <td className="px-5 py-3.5 text-zinc-500">
                                        {p.loan_id ? `#${p.loan_id}` : (
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#c8920a]/10 text-[#c8920a]">
                                                Capital
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-zinc-800">{fmt(p.amount_paid)}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border ${methodBadge[p.payment_method] ?? 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
                                            {p.payment_method}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border capitalize ${typeBadge[p.payment_type] ?? ''}`}>
                                            {p.payment_type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-zinc-700">{p.payment_date}</td>
                                    <td className="px-5 py-3.5 text-zinc-500">{p.recorded_by_name}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex gap-1">
                                            <a href={`/user/payments/${p.id}/receipt?type=${p.category === 'capital_share' ? 'capital_share' : 'loan'}`} target="_blank" rel="noopener noreferrer">
                                                <button className="flex items-center gap-1 h-7 px-2 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition">
                                                    <Receipt className="w-3 h-3" />
                                                    Receipt
                                                </button>
                                            </a>
                                            <button
                                                className="flex items-center gap-1 h-7 px-2 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition"
                                                onClick={() => handleEdit(p)}
                                            >
                                                <Pencil className="w-3 h-3" />
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {payments.last_page > 1 && (
                    <div className="flex gap-1 justify-center flex-wrap">
                        {payments.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, { search, method }, { preserveState: true })}
                                className={`px-3 py-1.5 rounded-xl text-sm border transition ${
                                    link.active
                                        ? 'bg-[#2d5a27] text-white border-[#2d5a27]'
                                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                                } disabled:opacity-40`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Add Payment Dialog ── */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Payment Category Toggle */}
                        <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => { setPaymentCategory('loan'); setForm(f => ({ ...f, loan_id: '' })); }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                                    paymentCategory === 'loan'
                                        ? 'bg-white text-[#2d5a27] shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                            >
                                🏦 Loan Payment
                            </button>
                            <button
                                type="button"
                                onClick={() => { setPaymentCategory('capital_share'); setForm(f => ({ ...f, loan_id: '' })); }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                                    paymentCategory === 'capital_share'
                                        ? 'bg-white text-[#c8920a] shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                            >
                                💰 Capital Share
                            </button>
                        </div>

                        {/* Member selector */}
                        <div className="space-y-1.5">
                            <Label>Member</Label>
                            <select
                                value={selectedMemberId}
                                onChange={(e) => {
                                    setSelectedMemberId(e.target.value);
                                    setForm((f) => ({ ...f, loan_id: '' }));
                                }}
                                className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                            >
                                <option value="">— Select Member —</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* ── LOAN PAYMENT BRANCH ── */}
                        {paymentCategory === 'loan' && (
                            <>
                                {/* Capital share warning — block if < 20,000 */}
                                {selectedMember && (selectedMember.share_capital ?? 0) < 20000 && (
                                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                        <span className="text-red-500 shrink-0 mt-0.5">⛔</span>
                                        <div>
                                            <p className="text-sm font-semibold text-red-700">Cannot Record Loan Payment</p>
                                            <p className="text-xs text-red-600 mt-0.5">
                                                {selectedMember.name}'s capital share is{' '}
                                                <strong>₱{(selectedMember.share_capital ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                                                , which is below the required <strong>₱20,000.00</strong> minimum.
                                            </p>
                                            <p className="text-xs text-red-500 mt-1">
                                                Record a capital share payment first to reach the ₱20,000 minimum.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Capital share met — green check */}
                                {selectedMember && (selectedMember.share_capital ?? 0) >= 20000 && (
                                    <div className="flex items-center gap-2 bg-[#2d5a27]/5 border border-[#2d5a27]/20 rounded-xl px-4 py-2">
                                        <span className="text-[#2d5a27]">✓</span>
                                        <p className="text-xs text-[#2d5a27] font-medium">
                                            Capital share ₱{(selectedMember.share_capital ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })} — meets ₱20,000 requirement
                                        </p>
                                    </div>
                                )}

                                {/* Loan selector */}
                                <div className="space-y-1.5">
                                    <Label>Loan</Label>
                                    <select
                                        value={form.loan_id}
                                        onChange={(e) => setForm((f) => ({ ...f, loan_id: e.target.value }))}
                                        className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={!selectedMemberId || (selectedMember?.share_capital ?? 0) < 20000}
                                    >
                                        <option value="">— Select Loan —</option>
                                        {activeLoans.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                Loan #{l.id} — Balance: ₱{l.remaining_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedMemberId && activeLoans.length === 0 && (selectedMember?.share_capital ?? 0) >= 20000 && (
                                        <p className="text-xs text-amber-600">⚠ This member has no active loans.</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ── CAPITAL SHARE BRANCH ── */}
                        {paymentCategory === 'capital_share' && selectedMember && (
                            <div className="bg-[#c8920a]/10 border border-[#c8920a]/20 rounded-xl p-3 space-y-1">
                                <p className="text-xs text-zinc-500">Current Capital Share</p>
                                <p className="font-bold text-[#c8920a] text-lg">
                                    ₱{(selectedMember.share_capital ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </p>
                                {form.amount_paid && Number(form.amount_paid) > 0 && (
                                    <p className="text-xs text-zinc-400">
                                        After payment: ₱{((selectedMember.share_capital ?? 0) + Number(form.amount_paid))
                                            .toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </p>
                                )}
                                {(selectedMember.share_capital ?? 0) < 20000 && (
                                    <p className="text-xs text-[#c8920a] font-medium">
                                        ₱{(20000 - (selectedMember.share_capital ?? 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 })} more needed to reach loan eligibility
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Amount + Date */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Amount (₱)</Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.amount_paid}
                                    onChange={(e) => setForm((f) => ({ ...f, amount_paid: e.target.value }))}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Payment Date</Label>
                                <Input
                                    type="date"
                                    value={form.payment_date}
                                    onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Method */}
                        <div className="space-y-1.5">
                            <Label>Payment Method</Label>
                            <select
                                value={form.payment_method}
                                onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                                className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                            >
                                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        {/* Type */}
                        <div className="space-y-1.5">
                            <Label>Payment Type</Label>
                            <div className="flex gap-4">
                                {['onsite', 'online'].map((t) => (
                                    <label key={t} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                                        <input
                                            type="radio"
                                            name="add_payment_type"
                                            value={t}
                                            checked={form.payment_type === t}
                                            onChange={() => setForm((f) => ({ ...f, payment_type: t }))}
                                        />
                                        {t}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Reference (required if online) */}
                        <div className="space-y-1.5">
                            <Label>
                                Reference Number
                                {form.payment_type === 'online' && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                                value={form.reference_number}
                                onChange={(e) => setForm((f) => ({ ...f, reference_number: e.target.value }))}
                                placeholder={form.payment_type === 'online' ? 'Required for online payments' : 'Optional'}
                            />
                        </div>

                        {/* Remarks */}
                        <div className="space-y-1.5">
                            <Label>Remarks (optional)</Label>
                            <Input
                                value={form.remarks}
                                onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                                placeholder="Optional notes"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <button onClick={() => setAddOpen(false)} disabled={submitting} className="px-4 py-2 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitAdd}
                            disabled={submitting || !isAddValid()}
                            className="px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#234820] transition disabled:opacity-50"
                        >
                            {submitting ? 'Saving…' : paymentCategory === 'capital_share' ? 'Record Capital Share' : 'Record Payment'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Edit Payment Dialog ── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Payment #{editTarget?.id}</DialogTitle>
                    </DialogHeader>

                    {editTarget && (
                        <>
                            {/* Audit info */}
                            <div className="text-xs text-zinc-400 space-y-1 border-b border-zinc-100 pb-3 mb-1">
                                <p>Recorded by <strong className="text-zinc-600">{editTarget.recorded_by_name}</strong> on {editTarget.recorded_at}</p>
                                {editTarget.updated_by_name && (
                                    <p>Last edited by <strong className="text-zinc-600">{editTarget.updated_by_name}</strong> on {editTarget.updated_at}</p>
                                )}
                            </div>

                            <div className="space-y-4 py-2">
                                {/* Amount + Date */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label>Amount (₱)</Label>
                                        <Input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={editForm.amount_paid}
                                            onChange={(e) => setEditForm((f) => ({ ...f, amount_paid: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Payment Date</Label>
                                        <Input
                                            type="date"
                                            value={editForm.payment_date}
                                            onChange={(e) => setEditForm((f) => ({ ...f, payment_date: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Method */}
                                <div className="space-y-1.5">
                                    <Label>Payment Method</Label>
                                    <select
                                        value={editForm.payment_method}
                                        onChange={(e) => setEditForm((f) => ({ ...f, payment_method: e.target.value }))}
                                        className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                                    >
                                        {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>

                                {/* Type */}
                                <div className="space-y-1.5">
                                    <Label>Payment Type</Label>
                                    <div className="flex gap-4">
                                        {['onsite', 'online'].map((t) => (
                                            <label key={t} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                                                <input
                                                    type="radio"
                                                    name="edit_payment_type"
                                                    value={t}
                                                    checked={editForm.payment_type === t}
                                                    onChange={() => setEditForm((f) => ({ ...f, payment_type: t }))}
                                                />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Reference */}
                                <div className="space-y-1.5">
                                    <Label>Reference Number</Label>
                                    <Input
                                        value={editForm.reference_number}
                                        onChange={(e) => setEditForm((f) => ({ ...f, reference_number: e.target.value }))}
                                    />
                                </div>

                                {/* Remarks */}
                                <div className="space-y-1.5">
                                    <Label>Remarks</Label>
                                    <Input
                                        value={editForm.remarks}
                                        onChange={(e) => setEditForm((f) => ({ ...f, remarks: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <button onClick={() => setEditOpen(false)} disabled={submitting} className="px-4 py-2 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitEdit}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#234820] transition disabled:opacity-50"
                                >
                                    {submitting ? 'Saving…' : 'Save Changes'}
                                </button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
