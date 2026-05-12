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

interface Props {
    members: Member[];
}

export default function MemberManagementDashboard({ members }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const [search, setSearch] = useState('');
    const [viewMember, setViewMember] = useState<Member | null>(null);
    const [editMember, setEditMember] = useState<Member | null>(null);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', contact_number: '', source_of_income: '' });
    const [editMigsOpen, setEditMigsOpen] = useState(false);
    const [migsForm, setMigsForm] = useState({ migs_score: 0, migs_classification: 'non_migs' as 'migs' | 'non_migs' });

    const filtered = members.filter((m) => {
        const q = search.toLowerCase();
        return (
            m.name.toLowerCase().includes(q) ||
            m.id.toString().includes(q) ||
            m.contact_number?.toLowerCase().includes(q)
        );
    });

    const approvedCount = members.length;
    const goodStandingCount = members.filter((m) => m.membership_status === 'good').length;
    const warningCount = members.filter((m) => m.membership_status === 'warning').length;

    // ΓöÇΓöÇ Handlers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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

    const handleRequestDeletion = (member: Member) => {
        if (!confirm(`Request deletion of ${member.name}?\n\nThis requires Superadmin approval before the member is permanently removed.`)) return;
        router.patch(`/user/member-management/${member.id}/request-deletion`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Member Management" />

            {/* ΓöÇΓöÇ View Sheet ΓöÇΓöÇ */}
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
                                        viewMember.membership_status === 'good' ? 'bg-emerald-100 text-emerald-800' :
                                        viewMember.membership_status === 'warning' ? 'bg-amber-100 text-amber-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {viewMember.membership_status === 'good' ? 'MIGS Γ£ô' : 'Non-MIGS Γ£ù'}
                                    </span>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                        viewMember.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                        viewMember.status === 'pending_deletion' ? 'bg-amber-100 text-amber-800' :
                                        'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {viewMember.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* MIGS Score */}
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
                                        Γ£Å Edit Score
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
                                            ? 'Γ£ô MIGS ΓÇö Member is in good standing'
                                            : 'Γ£ù Non-MIGS ΓÇö Below minimum score (50)'}
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
                                        Γå╗ Recalculate
                                    </button>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Personal Information</p>
                                {[
                                    { label: 'Full Name', value: viewMember.name },
                                    { label: 'Gender', value: viewMember.gender },
                                    { label: 'Date of Birth', value: viewMember.date_of_birth ?? 'ΓÇö' },
                                    { label: 'Contact Number', value: viewMember.contact_number },
                                    { label: 'Address', value: viewMember.address },
                                    { label: 'Source of Income', value: viewMember.source_of_income },
                                ].map((row) => (
                                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-zinc-50 last:border-0">
                                        <span className="text-sm text-zinc-500 shrink-0">{row.label}</span>
                                        <span className="text-sm font-medium text-zinc-800 text-right max-w-48 truncate capitalize">{row.value || 'ΓÇö'}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Membership Information */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Membership Information</p>
                                {[
                                    { label: 'Member Since', value: viewMember.start_date ?? 'ΓÇö' },
                                    { label: 'Standing', value: viewMember.standing },
                                    { label: 'Share Capital', value: `Γé▒${viewMember.share_capital.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
                                    { label: 'Savings Balance', value: `Γé▒${viewMember.savings_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
                                    { label: 'Copra Sales YTD', value: `Γé▒${(viewMember.copra_sales_ytd ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
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
                                                    <span>Principal: Γé▒{loan.principal_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    <span>Balance: Γé▒{loan.remaining_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
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

            {/* ΓöÇΓöÇ MIGS Score Edit Dialog ΓöÇΓöÇ */}
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
                                <Label>MIGS Score (0ΓÇô100)</Label>
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
                                    {migsForm.migs_classification === 'migs' ? 'Γ£ô MIGS' : 'Γ£ù Non-MIGS'}
                                </span>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                                ΓÜá Manual override. Use ΓÇ£RecalculateΓÇ¥ in the sheet to restore automatic scoring.
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

            {/* ΓöÇΓöÇ Edit Dialog ΓöÇΓöÇ */}
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-zinc-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Total Members</p>
                                <p className="mt-2 text-3xl font-bold text-[#2d4734]">{approvedCount}</p>
                            </div>
                            <div className="rounded-lg bg-emerald-50 p-3">
                                <Users className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Good Standing</p>
                                <p className="mt-2 text-3xl font-bold text-emerald-600">{goodStandingCount}</p>
                            </div>
                            <div className="rounded-lg bg-emerald-50 p-3">
                                <span className="text-2xl">Γ£ô</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Warnings / Non-Compliant</p>
                                <p className="mt-2 text-3xl font-bold text-amber-600">{warningCount}</p>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-3">
                                <span className="text-2xl">!</span>
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

