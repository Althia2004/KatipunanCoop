import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import MemberTable, { Member } from './MemberTable';
import MemberSearch from './MemberSearch';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoanRecord {
    id: number;
    principal_amount: number;
    remaining_balance: number;
    status: string;
    created_at: string;
}

interface MemberWithFinancials extends Member {
    migs_score?: number;
    migs_classification?: string;
    share_capital?: number;
    savings_balance?: number;
    copra_sales_ytd?: number;
    loans?: LoanRecord[];
}

interface Props {
    members: MemberWithFinancials[];
}

const fmt = (n: number) =>
    '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const LOAN_STATUS_BADGE: Record<string, string> = {
    active:     'bg-[#2d5a27]/10 text-[#2d5a27]',
    approved:   'bg-[#2d5a27]/10 text-[#2d5a27]',
    fully_paid: 'bg-zinc-100 text-zinc-500',
    defaulted:  'bg-red-100 text-red-700',
    pending:    'bg-[#c8920a]/10 text-[#c8920a]',
    rejected:   'bg-red-100 text-red-700',
};

export default function MemberManagementDashboard({ members }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const [search, setSearch] = useState('');
    const [viewMember, setViewMember] = useState<MemberWithFinancials | null>(null);
    const [editMember, setEditMember] = useState<MemberWithFinancials | null>(null);
    const [editForm, setEditForm] = useState({
        first_name: '', last_name: '', contact_number: '', source_of_income: ''
    });

    const filtered = members.filter((m) => {
        const q = search.toLowerCase();
        return (
            m.name.toLowerCase().includes(q) ||
            m.id.toString().includes(q) ||
            m.contact_number?.toLowerCase().includes(q)
        );
    });

    const approvedCount    = members.length;
    const goodStandingCount = members.filter((m) => m.membership_status === 'good').length;
    const warningCount     = members.filter((m) => m.membership_status === 'warning').length;

    const handleView = (member: MemberWithFinancials) => setViewMember(member);

    const handleEdit = (member: MemberWithFinancials) => {
        setEditMember(member);
        setEditForm({
            first_name:       member.first_name || member.name.split(' ')[0] || '',
            last_name:        member.last_name  || member.name.split(' ').slice(1).join(' ') || '',
            contact_number:   member.contact_number || '',
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

    const handleLock = (member: MemberWithFinancials) => {
        const action = member.status === 'suspended' ? 'reactivate' : 'suspend';
        if (!confirm(`Are you sure you want to ${action} ${member.name}?`)) return;
        router.patch(`/user/member-management/${member.id}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleRequestDeletion = (member: MemberWithFinancials) => {
        if (!confirm(`Request deletion of ${member.name}?\n\nThis requires Superadmin approval.`)) return;
        router.patch(`/user/member-management/${member.id}/request-deletion`, {}, { preserveScroll: true });
    };

    // MIGS score — use real value from DB
    const getMigsScore = (m: MemberWithFinancials) => m.migs_score ?? 0;
    const getMigsClass = (m: MemberWithFinancials) => m.migs_classification ?? 'non_migs';

    return (
        <>
            <Head title="Member Management" />

            {/* ── View Sheet ── */}
            <Sheet open={!!viewMember} onOpenChange={(open) => !open && setViewMember(null)}>
                <SheetContent className="w-110 overflow-y-auto p-0 border-l border-zinc-200 shadow-xl">
                    {viewMember && (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-100">
                                <h2 className="text-xl font-bold text-zinc-900">{viewMember.name}</h2>
                                <p className="text-sm text-zinc-400 mt-0.5">Member ID #{viewMember.id}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                        getMigsClass(viewMember) === 'migs'
                                            ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {getMigsClass(viewMember) === 'migs' ? 'MIGS ✓' : 'Non-MIGS ✗'}
                                    </span>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                        viewMember.status === 'suspended'        ? 'bg-red-100 text-red-800' :
                                        viewMember.status === 'pending_deletion' ? 'bg-amber-100 text-amber-800' :
                                        'bg-[#2d5a27]/10 text-[#2d5a27]'
                                    }`}>
                                        {viewMember.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* MIGS Score — REAL DATA */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
                                    MIGS Score
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                getMigsScore(viewMember) >= 50
                                                    ? 'bg-[#2d5a27]'
                                                    : 'bg-red-400'
                                            }`}
                                            style={{ width: `${Math.min(getMigsScore(viewMember), 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-zinc-700 shrink-0">
                                        {getMigsScore(viewMember)}/100
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {getMigsScore(viewMember) >= 50
                                        ? '✓ Member is in good standing'
                                        : '✗ Below minimum score (50)'}
                                </p>
                            </div>

                            {/* Personal Information */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                                    Personal Information
                                </p>
                                {[
                                    { label: 'Full Name',         value: viewMember.name },
                                    { label: 'Gender',            value: viewMember.gender },
                                    { label: 'Date of Birth',     value: viewMember.date_of_birth ?? '—' },
                                    { label: 'Contact Number',    value: viewMember.contact_number },
                                    { label: 'Address',           value: viewMember.address },
                                    { label: 'Source of Income',  value: viewMember.source_of_income },
                                ].map((row) => (
                                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-zinc-50 last:border-0">
                                        <span className="text-sm text-zinc-500 shrink-0">{row.label}</span>
                                        <span className="text-sm font-medium text-zinc-800 text-right max-w-48 truncate capitalize">
                                            {row.value || '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Membership Information — REAL DATA */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                                    Membership Information
                                </p>
                                {[
                                    { label: 'Member Since',    value: viewMember.start_date ?? '—' },
                                    { label: 'Standing',        value: viewMember.standing },
                                    {
                                        label: 'Share Capital',
                                        value: fmt(viewMember.share_capital ?? 0),
                                        highlight: (viewMember.share_capital ?? 0) >= 20000,
                                    },
                                    {
                                        label: 'Savings Balance',
                                        value: fmt(viewMember.savings_balance ?? 0),
                                        highlight: (viewMember.savings_balance ?? 0) > 0,
                                    },
                                ].map((row) => (
                                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-zinc-50 last:border-0">
                                        <span className="text-sm text-zinc-500 shrink-0">{row.label}</span>
                                        <span className={`text-sm font-medium capitalize ${
                                            row.highlight ? 'text-[#2d5a27]' : 'text-zinc-800'
                                        }`}>
                                            {row.value}
                                        </span>
                                    </div>
                                ))}

                                {/* Loan eligibility indicator */}
                                <div className="mt-3 pt-3 border-t border-zinc-100">
                                    <div className={`rounded-xl px-3 py-2 text-xs ${
                                        (viewMember.share_capital ?? 0) >= 20000
                                            ? 'bg-[#2d5a27]/5 text-[#2d5a27]'
                                            : 'bg-amber-50 text-amber-700'
                                    }`}>
                                        {(viewMember.share_capital ?? 0) >= 20000
                                            ? '✓ Meets ₱20,000 capital share requirement for loans'
                                            : `⚠ Needs ₱${(20000 - (viewMember.share_capital ?? 0)).toLocaleString()} more capital share for loan eligibility`}
                                    </div>
                                </div>
                            </div>

                            {/* Loan History — REAL DATA */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                                    Loan History
                                </p>
                                {(!viewMember.loans || viewMember.loans.length === 0) ? (
                                    <div className="rounded-xl border border-zinc-100 bg-zinc-50 py-8 text-center">
                                        <p className="text-sm text-zinc-400">No loan records found.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {viewMember.loans.map((loan) => (
                                            <div key={loan.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                                <div>
                                                    <p className="text-xs font-semibold text-zinc-700">
                                                        Loan #{loan.id}
                                                    </p>
                                                    <p className="text-xs text-zinc-400 mt-0.5">
                                                        {loan.created_at}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-zinc-800">
                                                        {fmt(loan.principal_amount)}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">
                                                        Balance: {fmt(loan.remaining_balance)}
                                                    </p>
                                                </div>
                                                <span className={`ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                    LOAN_STATUS_BADGE[loan.status] ?? 'bg-zinc-100 text-zinc-600'
                                                }`}>
                                                    {loan.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6">
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

            {/* ── Edit Dialog ── */}
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
                            className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-8 p-8 max-w-360 mx-auto">
                {/* Header */}
                <div className="border-b border-zinc-200 pb-6">
                    <h1 className="text-3xl font-bold text-[#2d5a27]">Member Management</h1>
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Total Members</p>
                                <p className="mt-2 text-3xl font-bold text-[#2d5a27]">{approvedCount}</p>
                            </div>
                            <div className="rounded-xl bg-[#2d5a27]/10 p-3">
                                <Users className="h-6 w-6 text-[#2d5a27]" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Good Standing</p>
                                <p className="mt-2 text-3xl font-bold text-[#2d5a27]">{goodStandingCount}</p>
                            </div>
                            <div className="rounded-xl bg-[#2d5a27]/10 p-3">
                                <span className="text-2xl text-[#2d5a27]">✓</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Warnings / Non-Compliant</p>
                                <p className="mt-2 text-3xl font-bold text-[#c8920a]">{warningCount}</p>
                            </div>
                            <div className="rounded-xl bg-[#c8920a]/10 p-3">
                                <span className="text-2xl text-[#c8920a]">!</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <MemberSearch search={search} onSearchChange={setSearch} />

                {/* Table */}
                <MemberTable
                    members={filtered}
                    onView={handleView}
                    onEdit={handleEdit}
                    onLock={handleLock}
                    onDelete={handleRequestDeletion}
                />
            </div>
        </>
    );
}