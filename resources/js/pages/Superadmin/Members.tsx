import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Search, Eye, Pencil, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CoMaker {
    id: number;
    first_name: string;
    last_name: string;
    contact_number?: string;
    relationship?: string;
}

interface Beneficiary {
    id: number;
    first_name: string;
    last_name: string;
    contact_number?: string;
    relationship?: string;
}

interface MemberUser {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    user_id: number | null;
    contact_number: string;
    source_of_income?: string;
    gender: string;
    date_of_birth: string;
    address: string;
    member_since: string;
    share_capital: number;
    savings_balance: number;
    migs_score: number;
    status: string;
    membership_status?: string;
    standing?: string;
    account_status: 'verified' | 'unverified' | 'no_account';
    classification: 'migs' | 'non_migs';
    co_makers: CoMaker[];
    beneficiaries: Beneficiary[];
}

interface Props {
    members: MemberUser[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Members({ members }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unverified'>('all');
    const [selectedMember, setSelectedMember] = useState<MemberUser | null>(null);
    const [editMember, setEditMember] = useState<MemberUser | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MemberUser | null>(null);

    const editForm = useForm({
        first_name: '',
        last_name: '',
        contact_number: '',
        email: '',
        password: '',
    });

    const filtered = members.filter((m) => {
        const matchSearch =
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.contact_number.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && (m.status === 'active' || m.status === 'approved')) ||
            (statusFilter === 'unverified' && m.account_status !== 'verified');
        return matchSearch && matchStatus;
    });

    const openEdit = (member: MemberUser) => {
        setEditMember(member);
        editForm.setData({
            first_name: member.first_name || '',
            last_name: member.last_name || '',
            contact_number: member.contact_number || '',
            email: member.email === '—' ? '' : member.email,
            password: '',
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editMember) return;
        editForm.put(`/superadmin/members/${editMember.id}`, {
            onSuccess: () => setEditMember(null),
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/superadmin/members/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <Head title="All Members" />

            {/* ── Edit Dialog ── */}
            <Dialog open={!!editMember} onOpenChange={(o) => !o && setEditMember(null)}>
                <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Member — {editMember?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-zinc-700 block mb-1">First Name</label>
                                <Input value={editForm.data.first_name}
                                    onChange={(e) => editForm.setData('first_name', e.target.value)} />
                                {editForm.errors.first_name && <p className="text-red-500 text-xs mt-1">{editForm.errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-zinc-700 block mb-1">Last Name</label>
                                <Input value={editForm.data.last_name}
                                    onChange={(e) => editForm.setData('last_name', e.target.value)} />
                                {editForm.errors.last_name && <p className="text-red-500 text-xs mt-1">{editForm.errors.last_name}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-700 block mb-1">Contact Number</label>
                            <Input value={editForm.data.contact_number}
                                onChange={(e) => editForm.setData('contact_number', e.target.value)} />
                            {editForm.errors.contact_number && <p className="text-red-500 text-xs mt-1">{editForm.errors.contact_number}</p>}
                        </div>

                        <div className="border-t border-zinc-100 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Portal Account Credentials</p>
                            <div>
                                <label className="text-sm font-medium text-zinc-700 block mb-1">Email Address</label>
                                <Input type="email" value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    placeholder="member@example.com" />
                                {editForm.errors.email && <p className="text-red-500 text-xs mt-1">{editForm.errors.email}</p>}
                            </div>
                            <div className="mt-3">
                                <label className="text-sm font-medium text-zinc-700 block mb-1">
                                    New Password <span className="text-zinc-400 font-normal">(leave blank to keep current)</span>
                                </label>
                                <Input type="password" value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                    placeholder="Minimum 8 characters" />
                                {editForm.errors.password && <p className="text-red-500 text-xs mt-1">{editForm.errors.password}</p>}
                            </div>
                        </div>

                        {/* Co-Makers — read only */}
                        {editMember?.co_makers && editMember.co_makers.length > 0 && (
                            <div className="border-t border-zinc-100 pt-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Co-Makers</p>
                                {editMember.co_makers.map((c) => (
                                    <div key={c.id} className="flex justify-between text-sm py-1.5 border-b border-zinc-50">
                                        <span className="text-zinc-700">{c.first_name} {c.last_name}</span>
                                        <span className="text-zinc-400">{c.relationship ?? '—'}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Beneficiaries — read only */}
                        {editMember?.beneficiaries && editMember.beneficiaries.length > 0 && (
                            <div className="border-t border-zinc-100 pt-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Beneficiaries</p>
                                {editMember.beneficiaries.map((b) => (
                                    <div key={b.id} className="flex justify-between text-sm py-1.5 border-b border-zinc-50">
                                        <span className="text-zinc-700">{b.first_name} {b.last_name}</span>
                                        <span className="text-zinc-400">{b.relationship ?? '—'}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={editForm.processing}
                                className="flex-1 bg-[#2d5a27] hover:bg-[#1e3e1a] text-white">
                                {editForm.processing ? 'Saving…' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="outline"
                                onClick={() => setEditMember(null)} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation Dialog ── */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Member</DialogTitle>
                    </DialogHeader>
                    <div className="py-3">
                        <p className="text-sm text-zinc-600">
                            Are you sure you want to permanently delete
                            <span className="font-bold text-zinc-900"> {deleteTarget?.name}</span>?
                        </p>
                        <p className="text-xs text-red-500 mt-2">
                            ⚠️ This will also delete their portal account. This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={confirmDelete}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                            Yes, Delete Permanently
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                        Cooperative
                    </p>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold text-[#2d5a27]">All Members</h1>
                            <p className="text-sm text-zinc-400 mt-0.5">
                                View and manage all registered cooperative members.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                if (confirm('Recalculate MIGS scores for all members? This may take a moment.')) {
                                    router.post('/superadmin/members/recalculate-all-migs');
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-[#2d5a27] text-[#2d5a27] text-sm font-semibold rounded-xl hover:bg-[#2d5a27]/5 transition"
                        >
                            <RefreshCw className="w-4 h-4" /> Recalculate All MIGS
                        </button>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <p className="text-sm font-semibold text-zinc-700">
                                {filtered.length} member{filtered.length !== 1 ? 's' : ''}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                <div className="relative min-w-52">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                    <Input className="pl-8 h-8 text-sm" placeholder="Search by name or email…"
                                        value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                    className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-700"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50">
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Email</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Member Since</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                            {/* TODO: wire share capital from members table */}
                                            Share Capital
                                        </th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-zinc-400 text-sm">
                                                No members found.
                                            </td>
                                        </tr>
                                    )}
                                    {filtered.map((m) => (
                                        <tr key={m.id} className="hover:bg-zinc-50 transition">
                                            <td className="px-4 py-3 font-medium text-zinc-800">{m.name}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {m.email && m.email !== '—' && !m.email.includes('@kscf.local') ? (
                                                    <span className="text-zinc-700 text-xs">{m.email}</span>
                                                ) : (
                                                    <span className="text-zinc-300 text-xs italic">No email assigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400 text-xs">
                                                {m.member_since}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {m.share_capital > 0 ? (
                                                    <span className="font-semibold text-[#2d5a27]">
                                                        ₱{m.share_capital.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-300 text-xs">₱0.00</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                                    m.status === 'approved' || m.status === 'active'
                                                        ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                                        : m.status === 'suspended' || m.status === 'pending_deletion'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-[#c8920a]/10 text-[#c8920a]'
                                                }`}>
                                                    {m.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => setSelectedMember(m)}
                                                        className="flex items-center gap-1 text-xs text-[#2d5a27] hover:underline font-medium">
                                                        <Eye className="w-3.5 h-3.5" /> View
                                                    </button>
                                                    <button onClick={() => openEdit(m)}
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(m)}
                                                        className="flex items-center gap-1 text-xs text-red-500 hover:underline font-medium">
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <MemberViewSheet member={selectedMember} onClose={() => setSelectedMember(null)} />
        </>
    );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center py-2.5 border-b border-zinc-50 last:border-0 gap-4">
            <span className="text-sm text-zinc-500 shrink-0">{label}</span>
            <span className="text-sm font-medium text-zinc-800 text-right">{children}</span>
        </div>
    );
}

// ── Member View Sheet ─────────────────────────────────────────────────────────

function MemberViewSheet({
    member,
    onClose,
}: {
    member: MemberUser | null;
    onClose: () => void;
}) {
    if (!member) return null;

    return (
        <Sheet open={!!member} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-105 overflow-y-auto p-0 border-l border-zinc-200 shadow-xl" overlayClassName="bg-black/30">

                {/* ── Header ── */}
                <div className="p-6 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#2d5a27] flex items-center justify-center shrink-0">
                            <span className="text-white text-lg font-bold select-none">
                                {member.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-base font-bold text-zinc-900">{member.name}</span>
                                {/* Member status badge */}
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                                    member.status === 'approved' || member.status === 'active'
                                        ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                        : member.status === 'suspended'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-[#c8920a]/10 text-[#c8920a]'
                                }`}>
                                    {member.status}
                                </span>
                            </div>
                            {/* Only show email + verification badge if member has a real email */}
                            {member.email && member.email !== '—' && !member.email.includes('@kscf.local') ? (
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-zinc-400 truncate">{member.email}</p>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                        member.account_status === 'verified'
                                            ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                            : 'bg-zinc-100 text-zinc-400'
                                    }`}>
                                        {member.account_status}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-300 italic mt-0.5">No email assigned yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="p-6 space-y-6">

                    {/* Basic Info */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Basic Information</p>
                        <DetailRow label="Phone">{member.contact_number}</DetailRow>
                        <DetailRow label="Gender">{member.gender}</DetailRow>
                        <DetailRow label="Birthday">{member.date_of_birth}</DetailRow>
                        <DetailRow label="Address">{member.address || '—'}</DetailRow>
                        <DetailRow label="Member Since">{member.member_since}</DetailRow>
                        <DetailRow label="Standing">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                member.standing === 'active'
                                    ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                    : 'bg-zinc-100 text-zinc-500'
                            }`}>
                                {member.standing ?? '—'}
                            </span>
                        </DetailRow>
                    </div>

                    {/* Financial Overview */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Financial Overview</p>
                        <DetailRow label="Share Capital">
                            {member.share_capital > 0
                                ? `₱${member.share_capital.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                                : <span className="text-zinc-400 italic text-sm">₱0.00</span>}
                        </DetailRow>
                        <DetailRow label="Savings Balance">
                            {member.savings_balance > 0
                                ? `₱${member.savings_balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                                : <span className="text-zinc-400 italic text-sm">₱0.00</span>}
                        </DetailRow>
                        <div className="py-2.5 border-b border-zinc-50">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-zinc-500">MIGS Score</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-zinc-700">{member.migs_score}/100</span>
                                    <button
                                        onClick={() => router.post(`/superadmin/members/${member.id}/recalculate-migs`)}
                                        className="text-[10px] text-[#2d5a27] hover:underline flex items-center gap-0.5"
                                        title="Recalculate MIGS score"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#2d5a27] rounded-full transition-all"
                                    style={{ width: `${Math.min(member.migs_score, 100)}%` }}
                                />
                            </div>
                        </div>
                        <DetailRow label="Classification">
                            {member.classification === 'migs' ? (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#2d5a27]/10 text-[#2d5a27]">
                                    ✓ MIGS
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">
                                    ✗ Non-MIGS
                                </span>
                            )}
                        </DetailRow>
                    </div>

                    {/* Co-Makers */}
                    {member.co_makers.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Co-Maker(s)</p>
                            {member.co_makers.map((c) => (
                                <div key={c.id} className="py-2.5 border-b border-zinc-50 last:border-0">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium text-zinc-800">{c.first_name} {c.last_name}</span>
                                        <span className="text-xs text-zinc-400">{c.relationship}</span>
                                    </div>
                                    {c.contact_number && c.contact_number !== '—' && (
                                        <p className="text-xs text-zinc-400 mt-0.5">{c.contact_number}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Beneficiaries */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Beneficiaries</p>
                        {member.beneficiaries.length === 0 ? (
                            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-400">
                                No beneficiaries on file.
                            </div>
                        ) : (
                            member.beneficiaries.map((b) => (
                                <div key={b.id} className="py-2.5 border-b border-zinc-50 last:border-0">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium text-zinc-800">{b.first_name} {b.last_name}</span>
                                        <span className="text-xs text-zinc-400">{b.relationship}</span>
                                    </div>
                                    {b.contact_number && b.contact_number !== '—' && (
                                        <p className="text-xs text-zinc-400 mt-0.5">{b.contact_number}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                </div>

                {/* ── Footer ── */}
                <div className="p-6 border-t border-zinc-100">
                    <button
                        className="w-full py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

            </SheetContent>
        </Sheet>
    );
}

