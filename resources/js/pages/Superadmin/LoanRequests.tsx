import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Banknote, Clock, CheckCircle2, XCircle, Users, Search,
    AlertCircle, ArrowUpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LoanRequestItem {
    id: number;
    member_name: string;
    member_id: number;
    amount: number;
    purpose: string | null;
    term_months: number;
    interest_rate: number;
    status: 'pending' | 'for_bod_approval' | 'approved' | 'rejected';
    rejection_reason: string | null;
    escalation_notes: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    is_bod_required: boolean;
}

interface PaginatedRequests {
    data: LoanRequestItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Stats {
    total: number;
    pending: number;
    for_bod: number;
    approved: number;
    rejected: number;
}

interface Props {
    requests: PaginatedRequests;
    stats: Stats;
    filters: { search?: string; status?: string };
}

const statusBadge = (s: LoanRequestItem['status']) => {
    switch (s) {
        case 'approved':         return 'bg-emerald-100 text-emerald-700';
        case 'for_bod_approval': return 'bg-blue-100 text-blue-700';
        case 'rejected':         return 'bg-red-100 text-red-700';
        default:                 return 'bg-amber-100 text-amber-700';
    }
};

const statusLabel = (s: LoanRequestItem['status']) =>
    s === 'for_bod_approval' ? 'For BOD' : s.charAt(0).toUpperCase() + s.slice(1);

const fmt = (v: number) => '₱' + v.toLocaleString('en-PH', { minimumFractionDigits: 2 });

export default function LoanRequests({ requests, stats, filters }: Props) {
    const [search, setSearch]           = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');

    // Detail
    const [detailItem, setDetailItem] = useState<LoanRequestItem | null>(null);

    // Approve
    const [approveOpen, setApproveOpen] = useState(false);
    const [approveLoan, setApproveLoan] = useState<LoanRequestItem | null>(null);

    // Reject
    const [rejectOpen, setRejectOpen]     = useState(false);
    const [rejectLoan, setRejectLoan]     = useState<LoanRequestItem | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleApprove = (lr: LoanRequestItem) => { setApproveLoan(lr); setApproveOpen(true); };
    const handleReject  = (lr: LoanRequestItem) => { setRejectLoan(lr);  setRejectReason(''); setRejectOpen(true); };

    const confirmApprove = () => router.post(
        `/superadmin/loan-requests/${approveLoan?.id}/approve`, {},
        { onSuccess: () => setApproveOpen(false) }
    );
    const confirmReject = () => router.post(
        `/superadmin/loan-requests/${rejectLoan?.id}/reject`,
        { rejection_reason: rejectReason },
        { onSuccess: () => setRejectOpen(false) }
    );

    const applyFilter = () => {
        router.get('/superadmin/loan-requests', {
            search: search || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
        }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="BOD Loan Requests — Superadmin" />

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="border-b border-zinc-200 pb-6">
                    <h1 className="text-3xl font-bold text-[#2d4734]">Loan Requests</h1>
                    <p className="text-zinc-500 font-medium mt-1">Review and process loan requests as Board of Directors.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {([
                        { label: 'Total',    value: stats.total,    color: 'emerald', Icon: Banknote     },
                        { label: 'Pending',  value: stats.pending,  color: 'amber',   Icon: Clock        },
                        { label: 'For BOD',  value: stats.for_bod,  color: 'blue',    Icon: Users        },
                        { label: 'Approved', value: stats.approved, color: 'emerald', Icon: CheckCircle2 },
                        { label: 'Rejected', value: stats.rejected, color: 'red',     Icon: XCircle      },
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
                        <Input className="pl-9" placeholder="Search by member name or purpose..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilter()} />
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
                    <Button variant="outline" onClick={applyFilter}>Filter</Button>
                </div>

                {/* Table */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs font-semibold uppercase tracking-wide">
                                <tr>
                                    <th className="px-5 py-3">Member</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Purpose</th>
                                    <th className="px-5 py-3">Term</th>
                                    <th className="px-5 py-3">Rate</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Reviewed By</th>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-16 text-center">
                                            <Banknote className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                                            <p className="text-zinc-400 text-sm">No loan requests found.</p>
                                        </td>
                                    </tr>
                                ) : requests.data.map(lr => (
                                    <tr key={lr.id} className="hover:bg-zinc-50/60 transition">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-zinc-900">{lr.member_name}</p>
                                            <p className="text-xs text-zinc-400">#{lr.id}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="font-bold text-zinc-800">{fmt(lr.amount)}</p>
                                            {lr.is_bod_required && (
                                                <span className="text-[10px] text-[#c8920a] font-semibold flex items-center gap-0.5">
                                                    <AlertCircle className="w-3 h-3" /> BOD req.
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-zinc-500 max-w-[140px] truncate">{lr.purpose || '—'}</td>
                                        <td className="px-5 py-3 text-zinc-500">{lr.term_months}mo</td>
                                        <td className="px-5 py-3 text-zinc-500">{lr.interest_rate}%</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusBadge(lr.status)}`}>
                                                {statusLabel(lr.status)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-zinc-400 text-xs">
                                            {lr.reviewed_by ? (
                                                <span>{lr.reviewed_by}<br /><span className="text-zinc-300">{lr.reviewed_at}</span></span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-zinc-400 text-xs whitespace-nowrap">{lr.created_at}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                <button
                                                    onClick={() => setDetailItem(lr)}
                                                    className="px-2.5 py-1 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition"
                                                >
                                                    View
                                                </button>
                                                {lr.status === 'for_bod_approval' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(lr)}
                                                            className="flex items-center gap-1 px-2.5 py-1 bg-[#2d5a27] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3e1a] transition"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(lr)}
                                                            className="flex items-center gap-1 px-2.5 py-1 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition"
                                                        >
                                                            <XCircle className="w-3 h-3" /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {lr.status === 'pending' && (
                                                    <span className="text-xs text-zinc-400 italic">Pending Admin</span>
                                                )}
                                                {(lr.status === 'approved' || lr.status === 'rejected') && (
                                                    <span className="text-xs text-zinc-400 italic">Closed</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {requests.last_page > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100">
                            <p className="text-xs text-zinc-400">
                                Page {requests.current_page} of {requests.last_page} ({requests.total} total)
                            </p>
                            <div className="flex gap-1">
                                {requests.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-[#2d5a27] text-white'
                                                : link.url
                                                    ? 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                                    : 'border border-zinc-100 text-zinc-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ─────────────────────────────────────────────────── */}
            {detailItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={e => e.target === e.currentTarget && setDetailItem(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-start justify-between p-6 border-b border-zinc-100">
                            <div>
                                <p className="text-xs text-zinc-400 uppercase tracking-widest">Loan Request #{detailItem.id}</p>
                                <h2 className="text-xl font-bold text-zinc-900 mt-1">{detailItem.member_name}</h2>
                            </div>
                            <button onClick={() => setDetailItem(null)} className="text-zinc-400 hover:text-zinc-600 text-xl leading-none">✕</button>
                        </div>
                        <div className="p-6 space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { l: 'Amount',   v: fmt(detailItem.amount) },
                                    { l: 'Term',     v: `${detailItem.term_months} months` },
                                    { l: 'Rate',     v: `${detailItem.interest_rate}%/month` },
                                    { l: 'Submitted',v: detailItem.created_at },
                                ].map(({ l, v }) => (
                                    <div key={l} className="bg-zinc-50 rounded-xl p-3">
                                        <p className="text-xs text-zinc-400">{l}</p>
                                        <p className="font-semibold text-zinc-900">{v}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-zinc-50 rounded-xl p-3">
                                <p className="text-xs text-zinc-400">Purpose</p>
                                <p className="text-zinc-700">{detailItem.purpose || '—'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-zinc-400">Status:</p>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge(detailItem.status)}`}>
                                    {statusLabel(detailItem.status)}
                                </span>
                            </div>
                            {detailItem.escalation_notes && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                    <p className="text-xs text-amber-500 font-semibold mb-1">Escalation Notes</p>
                                    <p className="text-amber-700">{detailItem.escalation_notes}</p>
                                </div>
                            )}
                            {detailItem.rejection_reason && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                                    <p className="text-xs text-red-400 font-semibold mb-1">Rejection Reason</p>
                                    <p className="text-red-700">{detailItem.rejection_reason}</p>
                                </div>
                            )}
                            {detailItem.reviewed_by && (
                                <p className="text-xs text-zinc-400">
                                    Reviewed by <strong>{detailItem.reviewed_by}</strong>
                                    {detailItem.reviewed_at ? ` on ${detailItem.reviewed_at}` : ''}
                                </p>
                            )}
                        </div>
                        <div className="px-6 pb-6 flex justify-end gap-2">
                            {detailItem.status === 'for_bod_approval' && (
                                <>
                                    <Button size="sm" className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                                        onClick={() => { setDetailItem(null); handleApprove(detailItem); }}>
                                        Approve
                                    </Button>
                                    <Button size="sm" variant="destructive"
                                        onClick={() => { setDetailItem(null); handleReject(detailItem); }}>
                                        Reject
                                    </Button>
                                </>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setDetailItem(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── BOD Approve Dialog ─────────────────────────────────────────── */}
            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle className="text-[#2d5a27]">BOD Approve Loan Request</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-zinc-600">Approve loan for <strong>{approveLoan?.member_name}</strong>?</p>
                        {approveLoan && (
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { l: 'Amount', v: fmt(approveLoan.amount) },
                                    { l: 'Term',   v: `${approveLoan.term_months} months` },
                                    { l: 'Rate',   v: `${approveLoan.interest_rate}%/month` },
                                    { l: 'Purpose',v: approveLoan.purpose || '—' },
                                ].map(({ l, v }) => (
                                    <div key={l} className="bg-zinc-50 rounded-xl p-3 text-sm">
                                        <p className="text-xs text-zinc-400">{l}</p>
                                        <p className="font-bold text-zinc-800 truncate">{v}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="bg-[#2d5a27]/5 border border-[#2d5a27]/20 rounded-xl p-3 text-xs text-[#2d5a27]">
                            ✓ A loan record and amortization schedule will be generated automatically.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setApproveOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={confirmApprove} className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white">Confirm BOD Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── BOD Reject Dialog ──────────────────────────────────────────── */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle className="text-red-600">BOD Reject Loan Request</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-zinc-600">
                            Rejecting loan for <strong>{rejectLoan?.member_name}</strong>
                            {rejectLoan ? ` — ${fmt(rejectLoan.amount)}` : ''}
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
        </>
    );
}
