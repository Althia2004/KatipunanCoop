import { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Banknote, Clock, CheckCircle2, XCircle, Eye, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface LoanItem {
    id: number;
    member_name: string;
    member_id: number;
    amount: number;
    purpose: string;
    loan_type: string | null;
    status: 'active' | 'fully_paid' | 'defaulted';
    interest_rate: number;
    term_months: number;
    balance: number;
    released_at: string;
}

interface AmortizationItem {
    id: number;
    due_date: string;
    amount_to_pay: number;
    principal_part: number;
    interest_part: number;
    status: 'pending' | 'paid' | 'overdue';
}

interface PaymentItem {
    id: number;
    amount_paid: number;
    payment_date: string;
    payment_method: string;
    reference_number: string | null;
    remarks: string | null;
}

interface LoanDetail {
    id: number;
    member_name: string;
    purpose: string;
    amount: number;
    term_months: number;
    interest_rate: number;
    total_payable: number;
    balance: number;
    status: 'active' | 'fully_paid' | 'defaulted';
    released_at: string;
    total_paid: number;
    amortizations: AmortizationItem[];
    payments: PaymentItem[];
}

interface PaginatedLoans {
    data: LoanItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Stats {
    total: number;
    active: number;
    pending: number;
    closed: number;
    total_released: number;
}

interface Props {
    loans: PaginatedLoans;
    stats: Stats;
    filters: { search?: string; status?: string };
}

type LoanStatus = LoanItem['status'];

const STATUS_LABEL: Record<LoanStatus, string> = {
    active:     'Active',
    fully_paid: 'Fully Paid',
    defaulted:  'Defaulted',
};

const STATUS_BADGE: Record<LoanStatus, string> = {
    active:     'bg-green-100 text-green-700',
    fully_paid: 'bg-zinc-100 text-zinc-500',
    defaulted:  'bg-red-100 text-red-700',
};

const AMORT_BADGE: Record<AmortizationItem['status'], string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid:    'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
};

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Loans({ loans, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/superadmin/loans',
                { search: search || undefined, status: statusFilter !== 'all' ? statusFilter : undefined },
                { preserveState: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    const [viewOpen, setViewOpen] = useState(false);
    const [viewDetail, setViewDetail] = useState<LoanDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [viewError, setViewError] = useState<string | null>(null);

    const openView = async (id: number) => {
        setViewDetail(null);
        setViewError(null);
        setViewOpen(true);
        setLoadingDetail(true);
        try {
            const res = await fetch(`/superadmin/loans/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            const text = await res.text();
            const data = JSON.parse(text);
            setViewDetail(data);
        } catch (err) {
            console.error('Loan fetch error:', err);
            setViewError('Failed to load loan details. Please try again.');
        } finally {
            setLoadingDetail(false);
        }
    };

    const [sheetEditMode, setSheetEditMode] = useState(false);
    const sheetEditForm = useForm({
        status:        'active' as LoanStatus,
        interest_rate: '',
        term_months:   '',
    });

    const openSheetEdit = () => {
        if (!viewDetail) return;
        sheetEditForm.setData({
            status:        viewDetail.status,
            interest_rate: String(viewDetail.interest_rate),
            term_months:   String(viewDetail.term_months),
        });
        setSheetEditMode(true);
    };

    const submitSheetEdit = () => {
        if (!viewDetail) return;
        sheetEditForm.put(`/superadmin/loans/${viewDetail.id}`, {
            onSuccess: () => {
                setSheetEditMode(false);
                openView(viewDetail.id);
            },
        });
    };

    const [editOpen, setEditOpen] = useState(false);
    const [editLoan, setEditLoan] = useState<LoanItem | null>(null);

    const { data: editData, setData: setEditData, put, processing: editProcessing, reset: resetEdit, errors: editErrors } = useForm({
        status:        'active' as LoanStatus,
        interest_rate: '',
        term_months:   '',
    });

    const openEdit = (loan: LoanItem) => {
        setEditLoan(loan);
        setEditData({
            status:        loan.status,
            interest_rate: String(loan.interest_rate),
            term_months:   String(loan.term_months),
        });
        setEditOpen(true);
    };

    const submitEdit = () => {
        if (!editLoan) return;
        put(`/superadmin/loans/${editLoan.id}`, {
            onSuccess: () => { setEditOpen(false); resetEdit(); setEditLoan(null); },
        });
    };

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState('');
    const [deleting, setDeleting] = useState(false);

    const openDelete = (loan: LoanItem) => {
        setDeleteId(loan.id);
        setDeleteName(loan.member_name);
        setDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/superadmin/loans/${deleteId}`, {
            onSuccess: () => { setDeleteOpen(false); setDeleteId(null); },
            onFinish: () => setDeleting(false),
        });
    };

    const statCards = [
        { label: 'Total Loans',      value: stats.total,          icon: Banknote,     color: 'text-[#2d5a27]', bg: 'bg-[#2d5a27]/10', isCurrency: false },
        { label: 'Active',           value: stats.active,         icon: CheckCircle2, color: 'text-[#2d5a27]', bg: 'bg-[#2d5a27]/10', isCurrency: false },
        { label: 'Pending Requests', value: stats.pending,        icon: Clock,        color: 'text-[#c8920a]', bg: 'bg-[#c8920a]/10', isCurrency: false },
        { label: 'Fully Paid',       value: stats.closed,         icon: XCircle,      color: 'text-zinc-500',  bg: 'bg-zinc-100',     isCurrency: false },
        { label: 'Total Released',   value: stats.total_released, icon: Banknote,     color: 'text-[#2d5a27]', bg: 'bg-[#2d5a27]/10', isCurrency: true  },
    ];

    return (
        <>
            <Head title="All Loans" />
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Cooperative</p>
                    <h1 className="text-2xl font-bold text-[#2d5a27]">All Loans</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">Overview of all cooperative loan records.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {statCards.map((s) => (
                        <Card key={s.label} className="border border-zinc-200 shadow-sm">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} shrink-0`}>
                                    <s.icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-zinc-900">
                                        {s.isCurrency ? fmt(s.value) : s.value}
                                    </p>
                                    <p className="text-xs text-zinc-500">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex gap-2 flex-wrap">
                            <div className="relative flex-1 min-w-52">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                <Input className="pl-8 h-8 text-sm" placeholder="Search by member name…"
                                    value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-700">
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="fully_paid">Fully Paid</option>
                                <option value="defaulted">Defaulted</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50">
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Member</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Amount</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Purpose</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Term</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Balance</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Released</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {loans.data.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="text-center py-12 text-zinc-400 text-sm">No loans found.</td>
                                        </tr>
                                    )}
                                    {loans.data.map((l) => (
                                        <tr key={l.id} className="hover:bg-zinc-50 transition">
                                            <td className="px-4 py-3 font-medium text-zinc-800">{l.member_name}</td>
                                            <td className="px-4 py-3 text-zinc-700">{fmt(l.amount)}</td>
                                            <td className="px-4 py-3">
                                                {l.loan_type ? (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 capitalize">
                                                        {l.loan_type}
                                                    </span>
                                                ) : <span className="text-zinc-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-500">{l.purpose}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[l.status]}`}>
                                                    {STATUS_LABEL[l.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-zinc-500">{l.term_months} mo @ {l.interest_rate}%</td>
                                            <td className="px-4 py-3 text-zinc-700">{l.balance > 0 ? fmt(l.balance) : '—'}</td>
                                            <td className="px-4 py-3 text-zinc-400 text-xs">{l.released_at}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openView(l.id)}
                                                        className="h-7 px-2 text-zinc-400 hover:text-[#2d5a27] gap-1 text-xs">
                                                        <Eye className="w-3.5 h-3.5" /> View
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(l)}
                                                        className="h-7 px-2 text-zinc-400 hover:text-[#c8920a] gap-1 text-xs">
                                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => openDelete(l)}
                                                        className="h-7 px-2 text-zinc-400 hover:text-red-500 gap-1 text-xs">
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {loans.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
                                <p className="text-xs text-zinc-400">
                                    Showing {(loans.current_page - 1) * loans.per_page + 1}–{Math.min(loans.current_page * loans.per_page, loans.total)} of {loans.total}
                                </p>
                                <div className="flex gap-1">
                                    {loans.links.map((link, i) => {
                                        if (link.label === '&laquo; Previous') return (
                                            <Button key={i} variant="ghost" size="sm" disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                className="h-7 w-7 p-0 text-zinc-500">
                                                <ChevronLeft className="w-3.5 h-3.5" />
                                            </Button>
                                        );
                                        if (link.label === 'Next &raquo;') return (
                                            <Button key={i} variant="ghost" size="sm" disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                className="h-7 w-7 p-0 text-zinc-500">
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Button>
                                        );
                                        return (
                                            <Button key={i} variant={link.active ? 'default' : 'ghost'} size="sm"
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                className={`h-7 w-7 p-0 text-xs ${link.active ? 'bg-[#2d5a27] text-white' : 'text-zinc-500'}`}>
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Sheet open={viewOpen} onOpenChange={(o) => { setViewOpen(o); if (!o) { setViewDetail(null); setViewError(null); setSheetEditMode(false); } }}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 border-l border-zinc-200 shadow-xl">
                    <SheetHeader className="px-6 py-5 border-b border-zinc-100">
                        <SheetTitle className="text-[#2d5a27]">Loan Details</SheetTitle>
                        {viewDetail && (
                            <div className="flex items-center gap-2 mt-1">
                                {!sheetEditMode ? (
                                    <button onClick={openSheetEdit}
                                        className="flex items-center gap-1 text-xs text-[#2d5a27] font-semibold hover:underline">
                                        <Pencil className="w-3 h-3" /> Edit Loan
                                    </button>
                                ) : (
                                    <button onClick={() => setSheetEditMode(false)}
                                        className="text-xs text-zinc-400 hover:underline">
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        )}
                    </SheetHeader>

                    {loadingDetail && (
                        <div className="flex items-center justify-center py-20 text-zinc-400 text-sm">Loading…</div>
                    )}
                    {!loadingDetail && viewError && (
                        <p className="text-sm text-red-500 text-center py-10 px-6">{viewError}</p>
                    )}

                    {!loadingDetail && viewDetail && (
                        <div>
                            {/* Loan identity */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <h2 className="text-lg font-bold text-zinc-900">{viewDetail.member_name}</h2>
                                <p className="text-sm text-zinc-400 mt-0.5">Loan #{viewDetail.id}</p>
                                <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[viewDetail.status]}`}>
                                    {STATUS_LABEL[viewDetail.status]}
                                </span>
                            </div>

                            {/* Loan Summary */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Loan Summary</p>
                                {sheetEditMode ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-zinc-500 block mb-1">Interest Rate (%)</label>
                                                <Input type="number" step="0.01" min="0"
                                                    value={sheetEditForm.data.interest_rate}
                                                    onChange={(e) => sheetEditForm.setData('interest_rate', e.target.value)}
                                                    className="h-8 text-sm" />
                                                {sheetEditForm.errors.interest_rate && <p className="text-xs text-red-500 mt-0.5">{sheetEditForm.errors.interest_rate}</p>}
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-500 block mb-1">Term (months)</label>
                                                <Input type="number" min="1"
                                                    value={sheetEditForm.data.term_months}
                                                    onChange={(e) => sheetEditForm.setData('term_months', e.target.value)}
                                                    className="h-8 text-sm" />
                                                {sheetEditForm.errors.term_months && <p className="text-xs text-red-500 mt-0.5">{sheetEditForm.errors.term_months}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500 block mb-1">Status</label>
                                            <select value={sheetEditForm.data.status}
                                                onChange={(e) => sheetEditForm.setData('status', e.target.value as LoanStatus)}
                                                className="w-full h-8 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
                                                <option value="active">Active</option>
                                                <option value="fully_paid">Fully Paid</option>
                                                <option value="defaulted">Defaulted</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={submitSheetEdit}
                                                disabled={sheetEditForm.processing}
                                                className="flex-1 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#1e3e1a] disabled:opacity-50 transition">
                                                {sheetEditForm.processing ? 'Saving…' : 'Save Changes'}
                                            </button>
                                            <button onClick={() => setSheetEditMode(false)}
                                                className="flex-1 py-2 border border-zinc-200 text-sm font-semibold rounded-xl text-zinc-600 hover:bg-zinc-50 transition">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {([
                                            ['Purpose',       viewDetail.purpose],
                                            ['Principal',     fmt(viewDetail.amount)],
                                            ['Interest Rate', viewDetail.interest_rate + '%'],
                                            ['Term',          viewDetail.term_months + ' months'],
                                            ['Total Payable', fmt(viewDetail.total_payable)],
                                            ['Total Paid',    fmt(viewDetail.total_paid)],
                                            ['Balance',       fmt(viewDetail.balance)],
                                            ['Released',      viewDetail.released_at],
                                        ] as [string, string][]).map(([label, val]) => (
                                            <div key={label} className="py-2 border-b border-zinc-50">
                                                <p className="text-xs text-zinc-400">{label}</p>
                                                <p className="text-sm font-medium text-zinc-800 mt-0.5">{val}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Amortization Schedule */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Amortization Schedule</p>
                                {viewDetail.amortizations.length === 0 ? (
                                    <div className="rounded-xl bg-zinc-50 border border-zinc-100 py-6 text-center">
                                        <p className="text-sm text-zinc-400">No amortization schedule generated yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-zinc-200">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                                    <th className="text-left px-3 py-2 text-zinc-500">Due Date</th>
                                                    <th className="text-right px-3 py-2 text-zinc-500">Amount</th>
                                                    <th className="text-right px-3 py-2 text-zinc-500">Principal</th>
                                                    <th className="text-right px-3 py-2 text-zinc-500">Interest</th>
                                                    <th className="text-center px-3 py-2 text-zinc-500">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {viewDetail.amortizations.map((a) => (
                                                    <tr key={a.id} className="hover:bg-zinc-50">
                                                        <td className="px-3 py-2 text-zinc-600">{a.due_date}</td>
                                                        <td className="px-3 py-2 text-right">{fmt(a.amount_to_pay)}</td>
                                                        <td className="px-3 py-2 text-right text-zinc-500">{fmt(a.principal_part)}</td>
                                                        <td className="px-3 py-2 text-right text-zinc-500">{fmt(a.interest_part)}</td>
                                                        <td className="px-3 py-2 text-center">
                                                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${AMORT_BADGE[a.status]}`}>
                                                                {a.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Payment History */}
                            <div className="px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Payment History</p>
                                {viewDetail.payments.length === 0 ? (
                                    <div className="rounded-xl bg-zinc-50 border border-zinc-100 py-6 text-center">
                                        <p className="text-sm text-zinc-400">No payments recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-zinc-200">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                                    <th className="text-left px-3 py-2 text-zinc-500">Date</th>
                                                    <th className="text-right px-3 py-2 text-zinc-500">Amount</th>
                                                    <th className="text-left px-3 py-2 text-zinc-500">Method</th>
                                                    <th className="text-left px-3 py-2 text-zinc-500">Ref #</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {viewDetail.payments.map((p) => (
                                                    <tr key={p.id} className="hover:bg-zinc-50">
                                                        <td className="px-3 py-2 text-zinc-600">{p.payment_date}</td>
                                                        <td className="px-3 py-2 text-right">{fmt(p.amount_paid)}</td>
                                                        <td className="px-3 py-2 text-zinc-500">{p.payment_method}</td>
                                                        <td className="px-3 py-2 text-zinc-400">{p.reference_number ?? '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#2d5a27]">Edit Loan</DialogTitle>
                    </DialogHeader>
                    {editLoan && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-zinc-500">
                                Editing loan for <span className="font-semibold text-zinc-700">{editLoan.member_name}</span>
                            </p>
                            <div className="space-y-1">
                                <Label htmlFor="edit-status" className="text-xs">Status</Label>
                                <select id="edit-status" value={editData.status}
                                    onChange={(e) => setEditData('status', e.target.value as LoanStatus)}
                                    className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
                                    <option value="active">Active</option>
                                    <option value="fully_paid">Fully Paid</option>
                                    <option value="defaulted">Defaulted</option>
                                </select>
                                {editErrors.status && <p className="text-xs text-red-500">{editErrors.status}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-rate" className="text-xs">Interest Rate (% / month)</Label>
                                <Input id="edit-rate" type="number" step="0.01" min="0" max="100"
                                    value={editData.interest_rate}
                                    onChange={(e) => setEditData('interest_rate', e.target.value)}
                                    className="h-9 text-sm" />
                                {editErrors.interest_rate && <p className="text-xs text-red-500">{editErrors.interest_rate}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-term" className="text-xs">Term (months)</Label>
                                <Input id="edit-term" type="number" min="1" max="360"
                                    value={editData.term_months}
                                    onChange={(e) => setEditData('term_months', e.target.value)}
                                    className="h-9 text-sm" />
                                {editErrors.term_months && <p className="text-xs text-red-500">{editErrors.term_months}</p>}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setEditOpen(false)} disabled={editProcessing}>Cancel</Button>
                        <Button size="sm" onClick={submitEdit} disabled={editProcessing}
                            className="bg-[#2d5a27] hover:bg-[#234820] text-white">
                            {editProcessing ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Loan</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-zinc-600 py-2">
                        Permanently delete the loan for <span className="font-semibold text-zinc-800">{deleteName}</span>? This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
                        <Button size="sm" variant="destructive" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}