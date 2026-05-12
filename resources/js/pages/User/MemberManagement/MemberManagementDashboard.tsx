import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Users, CheckCircle2, Archive, AlertTriangle } from 'lucide-react';
import MemberTable, { Member } from './MemberTable';
import MemberSearch from './MemberSearch';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Stats {
    total: number;
    migs: number;
    non_migs: number;
    archived: number;
    archive_years: number[];
}

interface Filters {
    search: string;
    status: string;
    standing: string;
    gender: string;
    migs: string;
    archived: boolean;
    archive_year: string;
}

interface Props {
    members: Member[];
    stats: Stats;
    filters: Filters;
}

export default function MemberManagementDashboard({ members, stats, filters }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    // -- Filter state (initialised from server-provided filters) --------------
    const [search, setSearch]             = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [standing, setStanding]         = useState(filters.standing ?? '');
    const [gender, setGender]             = useState(filters.gender ?? '');
    const [migs, setMigs]                 = useState(filters.migs ?? '');
    const [showArchived, setShowArchived] = useState(filters.archived ?? false);
    const [archiveYear, setArchiveYear]   = useState(filters.archive_year ?? '');

    // -- Sheet / dialog state --------------------------------------------------
    const [viewMember, setViewMember]     = useState<Member | null>(null);
    const [editMember, setEditMember]     = useState<Member | null>(null);
    const [editForm, setEditForm]         = useState({ first_name: '', last_name: '', contact_number: '', source_of_income: '' });
    const [editMigsOpen, setEditMigsOpen] = useState(false);
    const [migsForm, setMigsForm]         = useState({ migs_score: 0, migs_classification: 'non_migs' as 'migs' | 'non_migs' });

    // -- Archive dialog state --------------------------------------------------
    const [archiveTarget, setArchiveTarget] = useState<Member | null>(null);
    const [archiveReason, setArchiveReason] = useState('');
    const [archiveOpen, setArchiveOpen]     = useState(false);

    // -- Apply filters (server-side via Inertia) -------------------------------
    const applyFilters = (overrides: Partial<Filters & { search: string }> = {}) => {
        const params: Record<string, string | boolean | undefined> = {
            search:       overrides.search       ?? search,
            status:       overrides.status        ?? statusFilter,
            standing:     overrides.standing      ?? standing,
            gender:       overrides.gender        ?? gender,
            migs:         overrides.migs          ?? migs,
            archived:     String(overrides.archived ?? showArchived),
            archive_year: overrides.archive_year  ?? archiveYear,
        };
        // strip empty values
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get('/user/member-management', params as Record<string, string>, {
            preserveState: true,
            replace: true,
        });
    };

    // -- Handlers --------------------------------------------------------------

    const handleView = (member: Member) => setViewMember(member);

    const handleEdit = (member: Member) => {
        setEditMember(member);
        setEditForm({
            first_name: member.first_name || member.name.split(' ')[0] || '',
            last_name: member.last_name || member.name.split(' ').slice(1).join(' ') || '',
            contact_number: member.contact_number || '',
            source_of_income: member.source_of_income || '',
        });
    };

    const handleEditSave = () => {
        if (!editMember) return;
        router.patch(`/user/member-management/${editMember.id}`, editForm, {
            onSuccess: () => setEditMember(null),
            preserveScroll: true,
        });
    };

    const handleLock = (member: Member) => {
        const action = member.status === 'suspended' ? 'reactivate' : 'suspend';
        if (!confirm(`Are you sure you want to ${action} ${member.name}?`)) return;
        router.patch(`/user/member-management/${member.id}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleArchiveClick = (member: Member) => {
        setArchiveTarget(member);
        setArchiveReason('');
        setArchiveOpen(true);
    };

    const handleArchiveConfirm = () => {
        if (!archiveTarget) return;
        router.patch(
            `/user/member-management/${archiveTarget.id}/request-archive`,
            { archive_reason: archiveReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setArchiveOpen(false);
                    setArchiveTarget(null);
                    setArchiveReason('');
                    if (viewMember?.id === archiveTarget.id) setViewMember(null);
                },
            }
        );
    };

    const toggleArchivedView = () => {
        const newVal = !showArchived;
        setShowArchived(newVal);
        setArchiveYear('');
        applyFilters({ archived: newVal, archive_year: '' });
    };

    return (
        <>
            <Head title="Member Management" />

            {/* -- Archive Confirm Dialog -- */}
            <Dialog open={archiveOpen} onOpenChange={(o) => !o && setArchiveOpen(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Archive className="w-5 h-5 text-amber-500" />
                            Request Archive
                        </DialogTitle>
                    </DialogHeader>
                    {archiveTarget && (
                        <div className="space-y-4 py-2">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-amber-800">
                                <strong>{archiveTarget.name}</strong> — an archive request will be submitted for superadmin approval. The member remains active until approved.
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="archive_reason">Reason for archiving <span className="text-red-500">*</span></Label>
                                <textarea
                                    id="archive_reason"
                                    rows={3}
                                    value={archiveReason}
                                    onChange={(e) => setArchiveReason(e.target.value)}
                                    placeholder="Minimum 10 characters�"
                                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d5a27] outline-none resize-none"
                                />
                                <p className={`text-xs ${archiveReason.length < 10 ? 'text-zinc-400' : 'text-emerald-600'}`}>
                                    {archiveReason.length}/10 minimum characters
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setArchiveOpen(false)}>Cancel</Button>
                        <Button
                            disabled={archiveReason.length < 10}
                            onClick={handleArchiveConfirm}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            Submit Archive Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* -- View Sheet -- */}
            <Sheet open={!!viewMember} onOpenChange={(open) => !open && setViewMember(null)}>
                <SheetContent className="w-110 overflow-y-auto p-0 border-l border-zinc-200 shadow-xl">
                    {viewMember && (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-100">
                                <h2 className="text-xl font-bold text-zinc-900">{viewMember.name}</h2>
                                <p className="text-sm text-zinc-400 mt-0.5">Member ID #{viewMember.id}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {viewMember.is_archived ? (
                                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-zinc-200 text-zinc-600">
                                            <Archive className="w-3 h-3" /> Archived {viewMember.archive_year ? `(${viewMember.archive_year})` : ''}
                                        </span>
                                    ) : (
                                        <>
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                viewMember.membership_status === 'good' ? 'bg-emerald-100 text-emerald-800' :
                                                viewMember.membership_status === 'warning' ? 'bg-amber-100 text-amber-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {viewMember.membership_status === 'good' ? 'MIGS ?' : 'Non-MIGS ?'}
                                            </span>
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                                viewMember.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                viewMember.status === 'pending_deletion' ? 'bg-amber-100 text-amber-800' :
                                                'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {viewMember.status.replace('_', ' ')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Archive Info (shown only when archived) */}
                            {viewMember.is_archived && (
                                <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Archive Information</p>
                                    {[
                                        { label: 'Archived On', value: viewMember.archived_at ?? '�' },
                                        { label: 'Archived By', value: viewMember.archived_by_name ?? '�' },
                                        { label: 'Archive Year', value: viewMember.archive_year?.toString() ?? '�' },
                                        { label: 'Reason', value: viewMember.archive_reason ?? '�' },
                                    ].map((row) => (
                                        <div key={row.label} className="flex justify-between items-start py-2 border-b border-zinc-100 last:border-0">
                                            <span className="text-sm text-zinc-500 shrink-0 mr-4">{row.label}</span>
                                            <span className="text-sm font-medium text-zinc-700 text-right">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* MIGS Score (hidden when archived) */}
                            {!viewMember.is_archived && (
                                <div className="px-6 py-4 border-b border-zinc-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">MIGS Score</p>
                                        <button
                                            onClick={() => {
                                                setMigsForm({
                                                    migs_score: viewMember.migs_score,
                                                    migs_classification: viewMember.migs_classification,
                                                });
                                                setEditMigsOpen(true);
                                            }}
                                            className="text-xs text-[#2d5a27] hover:underline flex items-center gap-1"
                                        >
                                            ? Edit Score
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    viewMember.migs_score >= 50 ? 'bg-[#2d5a27]' : 'bg-red-400'
                                                }`}
                                                style={{ width: `${Math.min(viewMember.migs_score, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-zinc-700 shrink-0">
                                            {viewMember.migs_score}/100
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-zinc-400">
                                            {viewMember.migs_score >= 50
                                                ? '? MIGS � Member is in good standing'
                                                : '? Non-MIGS � Below minimum score (50)'}
                                        </p>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Recalculate MIGS score for ${viewMember.name}?`)) {
                                                    router.post(
                                                        `/user/member-management/${viewMember.id}/recalculate-migs`,
                                                        {},
                                                        { preserveScroll: true }
                                                    );
                                                }
                                            }}
                                            className="text-xs text-zinc-400 hover:text-zinc-600 hover:underline"
                                        >
                                            ? Recalculate
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Personal Information */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Personal Information</p>
                                {[
                                    { label: 'Full Name', value: viewMember.name },
                                    { label: 'Gender', value: viewMember.gender },
                                    { label: 'Date of Birth', value: viewMember.date_of_birth ?? '�' },
                                    { label: 'Contact Number', value: viewMember.contact_number },
                                    { label: 'Address', value: viewMember.address },
                                    { label: 'Source of Income', value: viewMember.source_of_income },
                                ].map((row) => (
                                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-zinc-50 last:border-0">
                                        <span className="text-sm text-zinc-500 shrink-0">{row.label}</span>
                                        <span className="text-sm font-medium text-zinc-800 text-right max-w-48 truncate capitalize">{row.value || '�'}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Membership Information */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Membership Information</p>
                                {[
                                    { label: 'Member Since', value: viewMember.start_date ?? '�' },
                                    { label: 'Standing', value: viewMember.standing },
                                    { label: 'Share Capital', value: `?${viewMember.share_capital.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
                                    { label: 'Savings Balance', value: `?${viewMember.savings_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
                                    { label: 'Copra Sales YTD', value: `?${(viewMember.copra_sales_ytd ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
                                ].map((row) => (
                                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-zinc-50 last:border-0">
                                        <span className="text-sm text-zinc-500 shrink-0">{row.label}</span>
                                        <span className="text-sm font-medium text-zinc-800 capitalize">{row.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Loan History */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Loan History</p>
                                {viewMember.loans && viewMember.loans.length > 0 ? (
                                    <div className="space-y-2">
                                        {viewMember.loans.map((loan) => (
                                            <div key={loan.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-zinc-700">Loan #{loan.id}</span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                                                        loan.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        loan.status === 'fully_paid' ? 'bg-zinc-100 text-zinc-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>{loan.status.replace('_', ' ')}</span>
                                                </div>
                                                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                                                    <span>Principal: ?{loan.principal_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    <span>Balance: ?{loan.remaining_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-zinc-400">{loan.created_at}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-zinc-100 bg-zinc-50 py-8 text-center">
                                        <p className="text-sm text-zinc-400">No loan records found.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer � Archive / Restore actions */}
                            <div className="p-6 space-y-2">
                                {viewMember.is_archived ? (
                                    <div className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-semibold text-zinc-500">
                                        <Archive className="w-4 h-4" />
                                        Archived — manage from Archive Management
                                    </div>
                                ) : viewMember.status === 'pending_archive' || viewMember.archive_requested ? (
                                    <div className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-3 text-sm font-semibold text-amber-700">
                                        <Archive className="w-4 h-4" />
                                        Archive Request Pending Superadmin Approval
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleArchiveClick(viewMember)}
                                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                                    >
                                        <Archive className="w-4 h-4 mr-2" /> Request Archive
                                    </Button>
                                )}
                                <button
                                    onClick={() => setViewMember(null)}
                                    className="w-full py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* -- MIGS Score Edit Dialog -- */}
            <Dialog open={editMigsOpen} onOpenChange={(o) => !o && setEditMigsOpen(false)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit MIGS Score</DialogTitle>
                    </DialogHeader>
                    {viewMember && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-zinc-500">
                                Manually set MIGS score for <strong className="text-zinc-700">{viewMember.name}</strong>
                            </p>
                            <div className="space-y-1.5">
                                <Label>MIGS Score (0�100)</Label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={migsForm.migs_score}
                                    onChange={(e) => {
                                        const score = Math.min(100, Math.max(0, Number(e.target.value)));
                                        setMigsForm(f => ({
                                            ...f,
                                            migs_score: score,
                                            migs_classification: score >= 50 ? 'migs' : 'non_migs',
                                        }));
                                    }}
                                    className="w-full h-9 rounded-xl border border-zinc-200 px-3 text-sm focus:ring-2 focus:ring-[#2d5a27] outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                migsForm.migs_score >= 50 ? 'bg-[#2d5a27]' : 'bg-red-400'
                                            }`}
                                            style={{ width: `${migsForm.migs_score}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold shrink-0 text-zinc-700">
                                        {migsForm.migs_score}/100
                                    </span>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    migsForm.migs_classification === 'migs'
                                        ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                        : 'bg-red-100 text-red-600'
                                }`}>
                                    {migsForm.migs_classification === 'migs' ? '? MIGS' : '? Non-MIGS'}
                                </span>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                                ? Manual override. Use "Recalculate" in the sheet to restore automatic scoring.
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setEditMigsOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                if (!viewMember) return;
                                router.patch(
                                    `/user/member-management/${viewMember.id}/migs-score`,
                                    migsForm,
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => setEditMigsOpen(false),
                                    }
                                );
                            }}
                            className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                        >
                            Save Score
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* -- Edit Dialog -- */}
            <Dialog open={!!editMember} onOpenChange={(open) => !open && setEditMember(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={editForm.first_name}
                                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={editForm.last_name}
                                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <Input
                                id="contact_number"
                                value={editForm.contact_number}
                                onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="source_of_income">Source of Income</Label>
                            <Input
                                id="source_of_income"
                                value={editForm.source_of_income}
                                onChange={(e) => setEditForm({ ...editForm, source_of_income: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
                        <Button
                            onClick={handleEditSave}
                            className="bg-[#2d4734] hover:bg-[#1e3e1a] text-white"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-8 p-8 max-w-360 mx-auto">
                {/* Header */}
                <div className="border-b border-zinc-200 pb-6">
                    <h1 className="text-3xl font-bold text-[#2d4734]">Member Management</h1>
                    <p className="mt-2 text-zinc-600 font-medium">
                        View and manage approved cooperative members
                    </p>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-zinc-200 bg-white p-5">
                        <p className="text-sm font-medium text-zinc-500">Total Members</p>
                        <p className="mt-1 text-3xl font-bold text-[#2d4734]">{stats.total}</p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-white p-5">
                        <p className="text-sm font-medium text-zinc-500">MIGS</p>
                        <p className="mt-1 text-3xl font-bold text-emerald-600">{stats.migs}</p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-white p-5">
                        <p className="text-sm font-medium text-zinc-500">Non-MIGS</p>
                        <p className="mt-1 text-3xl font-bold text-amber-600">{stats.non_migs}</p>
                    </div>
                    <button
                        onClick={toggleArchivedView}
                        className={`rounded-lg border p-5 text-left transition ${
                            showArchived
                                ? 'border-zinc-400 bg-zinc-100'
                                : 'border-zinc-200 bg-white hover:bg-zinc-50'
                        }`}
                    >
                        <p className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
                            <Archive className="w-3.5 h-3.5" /> Archived
                        </p>
                        <p className="mt-1 text-3xl font-bold text-zinc-500">{stats.archived}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{showArchived ? 'Click to hide' : 'Click to view'}</p>
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="flex-1 min-w-48">
                        <MemberSearch
                            search={search}
                            onSearchChange={(val) => {
                                setSearch(val);
                                applyFilters({ search: val });
                            }}
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); applyFilters({ status: e.target.value }); }}
                            className="h-9 rounded-lg border border-zinc-200 px-2 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="approved">Approved</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending_deletion">Pending Deletion</option>
                            <option value="pending_archive">Pending Archive</option>
                            <option value="pending_restore">Pending Restore</option>
                        </select>
                    </div>

                    {/* Standing */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500">Standing</label>
                        <select
                            value={standing}
                            onChange={(e) => { setStanding(e.target.value); applyFilters({ standing: e.target.value }); }}
                            className="h-9 rounded-lg border border-zinc-200 px-2 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                        >
                            <option value="">All</option>
                            <option value="regular">Regular</option>
                            <option value="associate">Associate</option>
                        </select>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500">Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => { setGender(e.target.value); applyFilters({ gender: e.target.value }); }}
                            className="h-9 rounded-lg border border-zinc-200 px-2 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                        >
                            <option value="">All</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {/* MIGS */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500">MIGS</label>
                        <select
                            value={migs}
                            onChange={(e) => { setMigs(e.target.value); applyFilters({ migs: e.target.value }); }}
                            className="h-9 rounded-lg border border-zinc-200 px-2 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                        >
                            <option value="">All</option>
                            <option value="migs">MIGS</option>
                            <option value="non_migs">Non-MIGS</option>
                        </select>
                    </div>

                    {/* Archive Year (only shown when archived view active) */}
                    {showArchived && stats.archive_years.length > 0 && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Archive Year</label>
                            <select
                                value={archiveYear}
                                onChange={(e) => { setArchiveYear(e.target.value); applyFilters({ archive_year: e.target.value }); }}
                                className="h-9 rounded-lg border border-zinc-200 px-2 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                            >
                                <option value="">All Years</option>
                                {stats.archive_years.map((y) => (
                                    <option key={y} value={String(y)}>{y}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Reset */}
                    {(search || statusFilter || standing || gender || migs) && (
                        <button
                            onClick={() => {
                                setSearch(''); setStatusFilter(''); setStanding(''); setGender(''); setMigs('');
                                applyFilters({ search: '', status: '', standing: '', gender: '', migs: '' });
                            }}
                            className="h-9 px-3 text-xs text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {showArchived && (
                    <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-300 text-zinc-600 rounded-xl px-4 py-3 text-sm">
                        <Archive className="w-4 h-4 shrink-0" />
                        Showing <strong>{members.length}</strong> archived member{members.length !== 1 ? 's' : ''}.
                        Archived records are read-only historical data.
                    </div>
                )}

                {/* Table */}
                <MemberTable
                    members={members}
                    onView={handleView}
                    onEdit={handleEdit}
                    onLock={handleLock}
                    onDelete={handleArchiveClick}
                />
            </div>
        </>
    );
}


