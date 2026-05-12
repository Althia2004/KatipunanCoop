import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Banknote, Search, CheckCircle2, Clock, Users, XCircle,
    ArrowUpCircle, Plus, AlertCircle,
} from 'lucide-react';
import { LoanRequest } from '@/types/loan-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Member { id: number; name: string; }

interface LoanManagementProps {
    loanRequestsFromDb: LoanRequest[];
    members: Member[];
}

const statusBadge = (status: LoanRequest['status']) => {
    switch (status) {
        case 'approved':         return 'bg-emerald-100 text-emerald-700';
        case 'for_bod_approval': return 'bg-blue-100 text-blue-700';
        case 'rejected':         return 'bg-red-100 text-red-700';
        default:                 return 'bg-amber-100 text-amber-700';
    }
};

const statusLabel = (s: LoanRequest['status']) =>
    s === 'for_bod_approval' ? 'For BOD' : s.charAt(0).toUpperCase() + s.slice(1);

const fmt = (v: string | number) =>
    '₱' + Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 });

export default function Management({ loanRequestsFromDb, members }: LoanManagementProps) {
    const { auth } = usePage().props as any;
    const isAdmin      = ['admin', 'superadmin', 'manager'].includes(auth.user.role);
    const isMember     = auth.user.role === 'member';

    const [search, setSearch]           = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Approve
    const [approveOpen, setApproveOpen] = useState(false);
    const [approveLoan, setApproveLoan] = useState<LoanRequest | null>(null);

    // Reject
    const [rejectOpen, setRejectOpen]     = useState(false);
    const [rejectLoan, setRejectLoan]     = useState<LoanRequest | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Escalate
    const [escalateOpen, setEscalateOpen]   = useState(false);
    const [escalateLoan, setEscalateLoan]   = useState<LoanRequest | null>(null);
    const [escalateNotes, setEscalateNotes] = useState('');

    // Create
    const [createOpen, setCreateOpen] = useState(false);
    const createForm = useForm({ member_id: '', amount: '', loan_type: '', purpose: '', term_months: '12', interest_rate: '3' });

    // Detail
    const [detailLoan, setDetailLoan] = useState<LoanRequest | null>(null);

    const handleApprove  = (lr: LoanRequest) => { setApproveLoan(lr);  setApproveOpen(true); };
    const handleReject   = (lr: LoanRequest) => { setRejectLoan(lr);   setRejectReason('');  setRejectOpen(true); };
    const handleEscalate = (lr: LoanRequest) => { setEscalateLoan(lr); setEscalateNotes(''); setEscalateOpen(true); };

    const confirmApprove  = () => router.post(`/loan/loan-requests/${approveLoan?.id}/approve`,  {},                               { onSuccess: () => setApproveOpen(false)  });
    const confirmReject   = () => router.post(`/loan/loan-requests/${rejectLoan?.id}/reject`,    { rejection_reason: rejectReason },{ onSuccess: () => setRejectOpen(false)   });
    const confirmEscalate = () => router.post(`/loan/loan-requests/${escalateLoan?.id}/escalate`,{ escalation_notes: escalateNotes },{ onSuccess: () => setEscalateOpen(false) });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/loan/loan-requests/store', { onSuccess: () => { setCreateOpen(false); createForm.reset(); } });
    };

    const filtered = loanRequestsFromDb.filter(lr => {
        const q = search.toLowerCase();
        const matchSearch = !q
            || lr.requested_by.name.toLowerCase().includes(q)
            || (lr.purpose?.toLowerCase().includes(q) ?? false)
            || lr.amount.toString().includes(q);
        const matchStatus = statusFilter === 'all' || lr.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const counts = {
        total:    loanRequestsFromDb.length,
        pending:  loanRequestsFromDb.filter(l => l.status === 'pending').length,
        bod:      loanRequestsFromDb.filter(l => l.status === 'for_bod_approval').length,
        approved: loanRequestsFromDb.filter(l => l.status === 'approved').length,
        rejected: loanRequestsFromDb.filter(l => l.status === 'rejected').length,
    };

    return (
        <>
            <Head title="Loan Requests" />

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d4734]">Loan Requests</h1>
                        <p className="text-zinc-500 font-medium">Track loan requests and manage the approval workflow.</p>
                    </div>
                    {(isAdmin || isMember) && (
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#2d5a27] text-white font-semibold text-sm rounded-xl hover:bg-[#1e3e1a] transition"
                        >
                            <Plus className="w-4 h-4" /> New Loan Request
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {([
                        { label: 'Total',    value: counts.total,    color: 'emerald', Icon: Banknote     },
                        { label: 'Pending',  value: counts.pending,  color: 'amber',   Icon: Clock        },
                        { label: 'For BOD',  value: counts.bod,      color: 'blue',    Icon: Users        },
                        { label: 'Approved', value: counts.approved, color: 'emerald', Icon: CheckCircle2 },
                        { label: 'Rejected', value: counts.rejected, color: 'red',     Icon: XCircle      },
                    ] as const).map(({ label, value, color, Icon }) => (
                        <div key={label} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg bg-${color}-50 text-${color}-600`}><Icon className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs text-zinc-500">{label}</p>
                                    <p className="text-xl font-bold text-zinc-900">{value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                        <Input className="pl-9" placeholder="Search by name, purpose, amount..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-white text-zinc-700 outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="for_bod_approval">For BOD</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs font-semibold uppercase tracking-wide">
                                <tr>
                                    <th className="px-5 py-3">Requested By</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Purpose</th>
                                    <th className="px-5 py-3">Term</th>
                                    <th className="px-5 py-3">Rate</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <Banknote className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                                            <p className="text-zinc-400 text-sm">No loan requests found.</p>
                                        </td>
                                    </tr>
                                ) : filtered.map(lr => (
                                    <tr key={lr.id} className="hover:bg-zinc-50/60 transition">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-zinc-900">{lr.requested_by.name}</p>
                                            <p className="text-xs text-zinc-400">{lr.requested_by.email}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="font-bold text-zinc-800">{fmt(lr.amount)}</p>
                                            {Number(lr.amount) > 50000 && (
                                                <span className="text-[10px] text-[#c8920a] font-semibold">BOD required</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            {lr.loan_type ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600 capitalize">
                                                    {lr.loan_type}
                                                </span>
                                            ) : <span className="text-zinc-300">—</span>}
                                        </td>
                                        <td className="px-5 py-3 text-zinc-500 max-w-[160px] truncate">{lr.purpose || '—'}</td>
                                        <td className="px-5 py-3 text-zinc-500">{lr.term_months}mo</td>
                                        <td className="px-5 py-3 text-zinc-500">{lr.interest_rate}%</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusBadge(lr.status)}`}>
                                                {statusLabel(lr.status)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-zinc-400 text-xs whitespace-nowrap">{lr.requested_at}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                <button
                                                    onClick={() => setDetailLoan(lr)}
                                                    className="px-2.5 py-1 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition"
                                                >
                                                    View
                                                </button>
                                                {isAdmin && lr.status === 'pending' && (
                                                    <>
                                                        {Number(lr.amount) <= 50000 && (
                                                            <button
                                                                onClick={() => handleApprove(lr)}
                                                                className="flex items-center gap-1 px-2.5 py-1 bg-[#2d5a27] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3e1a] transition"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" /> Approve
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEscalate(lr)}
                                                            className="flex items-center gap-1 px-2.5 py-1 bg-[#c8920a] text-white text-xs font-semibold rounded-lg hover:bg-[#a87608] transition"
                                                        >
                                                            <ArrowUpCircle className="w-3 h-3" />
                                                            {Number(lr.amount) > 50000 ? 'Send to BOD' : 'Escalate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(lr)}
                                                            className="flex items-center gap-1 px-2.5 py-1 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition"
                                                        >
                                                            <XCircle className="w-3 h-3" /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {isAdmin && lr.status === 'for_bod_approval' && (
                                                    <span className="text-xs text-zinc-400 italic">Awaiting BOD</span>
                                                )}
                                                {isAdmin && (lr.status === 'approved' || lr.status === 'rejected') && (
                                                    <span className="text-xs text-zinc-400 italic">Closed</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Detail Modal ─────────────────────────────────────────────────── */}
            {detailLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={e => e.target === e.currentTarget && setDetailLoan(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-start justify-between p-6 border-b border-zinc-100">
                            <div>
                                <p className="text-xs text-zinc-400 uppercase tracking-widest">Loan Request #{detailLoan.id}</p>
                                <h2 className="text-xl font-bold text-zinc-900 mt-1">{detailLoan.requested_by.name}</h2>
                            </div>
                            <button onClick={() => setDetailLoan(null)} className="text-zinc-400 hover:text-zinc-600 text-xl leading-none">✕</button>
                        </div>
                        <div className="p-6 space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { l: 'Amount',   v: fmt(detailLoan.amount) },
                                    { l: 'Term',     v: `${detailLoan.term_months} months` },
                                    { l: 'Rate',     v: `${detailLoan.interest_rate}%/month` },
                                    { l: 'Requested',v: detailLoan.requested_at },
                                ].map(({ l, v }) => (
                                    <div key={l} className="bg-zinc-50 rounded-xl p-3">
                                        <p className="text-xs text-zinc-400">{l}</p>
                                        <p className="font-semibold text-zinc-900">{v}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-zinc-50 rounded-xl p-3">
                                <p className="text-xs text-zinc-400">Purpose</p>
                                <p className="text-zinc-700">{detailLoan.purpose || '—'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-zinc-400">Status:</p>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge(detailLoan.status)}`}>
                                    {statusLabel(detailLoan.status)}
                                </span>
                            </div>
                            {detailLoan.rejection_reason && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                                    <p className="text-xs text-red-400 font-semibold mb-1">Rejection Reason</p>
                                    <p className="text-red-700">{detailLoan.rejection_reason}</p>
                                </div>
                            )}
                            {detailLoan.escalation_notes && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                    <p className="text-xs text-amber-500 font-semibold mb-1">Escalation Notes</p>
                                    <p className="text-amber-700">{detailLoan.escalation_notes}</p>
                                </div>
                            )}
                            {detailLoan.reviewed_by && (
                                <p className="text-xs text-zinc-400">
                                    Reviewed by <strong>{detailLoan.reviewed_by}</strong>
                                    {detailLoan.reviewed_at ? ` on ${detailLoan.reviewed_at}` : ''}
                                </p>
                            )}
                        </div>
                        <div className="px-6 pb-6 flex justify-end gap-2">
                            {isAdmin && detailLoan.status === 'pending' && Number(detailLoan.amount) <= 50000 && (
                                <Button size="sm" className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                                    onClick={() => { setDetailLoan(null); handleApprove(detailLoan); }}>
                                    Approve
                                </Button>
                            )}
                            {isAdmin && detailLoan.status === 'pending' && (
                                <Button size="sm" variant="outline"
                                    onClick={() => { setDetailLoan(null); handleEscalate(detailLoan); }}>
                                    Escalate to BOD
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setDetailLoan(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Approve Dialog ─────────────────────────────────────────────── */}
            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle className="text-[#2d5a27]">Approve Loan Request</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-zinc-600">Approve loan for <strong>{approveLoan?.requested_by.name}</strong>?</p>
                        <div className="grid grid-cols-2 gap-3">
                            {approveLoan && [
                                { l: 'Amount',   v: fmt(approveLoan.amount) },
                                { l: 'Term',     v: `${approveLoan.term_months} months` },
                                { l: 'Rate',     v: `${approveLoan.interest_rate}%/month` },
                                { l: 'Purpose',  v: approveLoan.purpose || '—' },
                            ].map(({ l, v }) => (
                                <div key={l} className="bg-zinc-50 rounded-xl p-3 text-sm">
                                    <p className="text-xs text-zinc-400">{l}</p>
                                    <p className="font-bold text-zinc-800 truncate">{v}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-[#2d5a27]/5 border border-[#2d5a27]/20 rounded-xl p-3 text-xs text-[#2d5a27]">
                            ✓ A loan record and amortization schedule will be generated automatically.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setApproveOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={confirmApprove} className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white">Confirm Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Reject Dialog ──────────────────────────────────────────────── */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle className="text-red-600">Reject Loan Request</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-zinc-600">
                            Rejecting loan for <strong>{rejectLoan?.requested_by.name}</strong> — {rejectLoan && fmt(rejectLoan.amount)}
                        </p>
                        <div className="space-y-1">
                            <Label className="text-xs">Rejection Reason <span className="text-red-500">*</span></Label>
                            <textarea
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                placeholder="Enter reason (min 10 characters)..."
                                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm min-h-24 focus:ring-2 focus:ring-red-200 outline-none resize-none"
                            />
                            <p className="text-xs text-zinc-400">{rejectReason.length}/500</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setRejectOpen(false)}>Cancel</Button>
                        <Button size="sm" variant="destructive" onClick={confirmReject} disabled={rejectReason.length < 10}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Escalate Dialog ────────────────────────────────────────────── */}
            <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle className="text-[#c8920a]">Escalate to BOD</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-zinc-600">
                            Escalate loan for <strong>{escalateLoan?.requested_by.name}</strong> to BOD for approval.
                        </p>
                        {escalateLoan && Number(escalateLoan.amount) > 50000 && (
                            <div className="bg-[#c8920a]/10 border border-[#c8920a]/20 rounded-xl p-3 text-xs text-[#c8920a] flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                This loan exceeds ₱50,000 and requires BOD approval.
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label className="text-xs">Notes (optional)</Label>
                            <textarea
                                value={escalateNotes}
                                onChange={e => setEscalateNotes(e.target.value)}
                                placeholder="Add notes for the BOD..."
                                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm min-h-20 outline-none focus:ring-2 focus:ring-[#c8920a]/30 resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setEscalateOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={confirmEscalate} className="bg-[#c8920a] hover:bg-[#a87608] text-white">Send to BOD</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Create Dialog ──────────────────────────────────────────────── */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle className="text-[#2d5a27]">New Loan Request</DialogTitle></DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 py-2">
                        {isAdmin && (
                            <div className="space-y-1">
                                <Label className="text-xs">Member <span className="text-red-500">*</span></Label>
                                <select
                                    value={createForm.data.member_id}
                                    onChange={e => createForm.setData('member_id', e.target.value)}
                                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                                    required
                                >
                                    <option value="">Select member...</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                {createForm.errors.member_id && <p className="text-xs text-red-500">{createForm.errors.member_id}</p>}
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label className="text-xs">Amount (₱) <span className="text-red-500">*</span></Label>
                            <Input type="number" min="1000" step="100"
                                value={createForm.data.amount} onChange={e => createForm.setData('amount', e.target.value)}
                                placeholder="e.g. 25000" />
                            {Number(createForm.data.amount) > 50000 && (
                                <p className="text-xs text-[#c8920a] flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Will be auto-escalated to BOD.
                                </p>
                            )}
                            {createForm.errors.amount && <p className="text-xs text-red-500">{createForm.errors.amount}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Loan Type <span className="text-red-500">*</span></Label>
                            <select
                                value={createForm.data.loan_type}
                                onChange={e => createForm.setData('loan_type', e.target.value)}
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                                required
                            >
                                <option value="">Select type...</option>
                                <option value="regular">Regular Loan</option>
                                <option value="emergency">Emergency Loan</option>
                                <option value="educational">Educational Loan</option>
                                <option value="livelihood">Livelihood Loan</option>
                                <option value="housing">Housing Loan</option>
                                <option value="agricultural">Agricultural Loan</option>
                            </select>
                            {createForm.errors.loan_type && <p className="text-xs text-red-500">{createForm.errors.loan_type}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Purpose <span className="text-red-500">*</span></Label>
                            <Input value={createForm.data.purpose} onChange={e => createForm.setData('purpose', e.target.value)} placeholder="e.g. Business capital" />
                            {createForm.errors.purpose && <p className="text-xs text-red-500">{createForm.errors.purpose}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Term (months)</Label>
                                <Input type="number" min="1" max="120" value={createForm.data.term_months} onChange={e => createForm.setData('term_months', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Interest Rate (%/mo)</Label>
                                <Input type="number" min="0" step="0.5" value={createForm.data.interest_rate} onChange={e => createForm.setData('interest_rate', e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" size="sm" className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white" disabled={createForm.processing}>
                                {createForm.processing ? 'Creating...' : 'Create Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
