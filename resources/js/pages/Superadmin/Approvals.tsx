import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, XCircle, ClipboardList, Users, Trash2, Archive, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PendingRegistration {
    id: number;
    full_name: string;
    address: string;
    income: string;
    date: string;
    status: string;
}

interface PendingLoan {
    id: number;
    amount: number;
    requestedBy: string;
    date: string;
}

interface PendingDeletion {
    id: number;
    name: string;
    contact: string;
    date: string;
    priority: string;
}

interface PendingArchive {
    id: number;
    name: string;
    reason: string | null;
    requested_by: string;
    requested_at: string | null;
}

interface PendingRestore {
    id: number;
    name: string;
    reason: string | null;
    requested_by: string;
    requested_at: string | null;
    archived_at: string | null;
    archive_reason: string | null;
}

interface Props {
    pendingRegistrations: PendingRegistration[];
    pendingLoans: PendingLoan[];
    pendingDeletions: PendingDeletion[];
    pendingArchives: PendingArchive[];
    pendingRestores: PendingRestore[];
}

// ── Peso formatter ────────────────────────────────────────────────────────────

const peso = (n: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);

// ── Confirm Dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
    title,
    message,
    confirmLabel,
    confirmClass,
    onConfirm,
    onCancel,
    showReason,
}: {
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass: string;
    onConfirm: (reason?: string) => void;
    onCancel: () => void;
    showReason?: boolean;
}) {
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
                <p className="text-sm text-zinc-500">{message}</p>
                {showReason && (
                    <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1">
                            Reason (optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm text-zinc-800 focus:ring-2 focus:ring-red-300 outline-none resize-none"
                            placeholder="Provide a reason for rejection..."
                        />
                    </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button size="sm" className={confirmClass} onClick={() => onConfirm(reason || undefined)}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Approvals({ pendingRegistrations, pendingLoans, pendingDeletions, pendingArchives, pendingRestores }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const [confirmAction, setConfirmAction] = useState<{
        type: 'approve' | 'reject';
        id: number;
        name: string;
    } | null>(null);

    const [deletionAction, setDeletionAction] = useState<{
        type: 'approve-deletion' | 'reject-deletion';
        id: number;
        name: string;
    } | null>(null);

    const [archiveAction, setArchiveAction] = useState<{
        type: 'approve-archive' | 'reject-archive';
        id: number;
        name: string;
    } | null>(null);

    const [restoreAction, setRestoreAction] = useState<{
        type: 'approve-restore' | 'reject-restore';
        id: number;
        name: string;
    } | null>(null);

    const handleApprove = (id: number, name: string) => {
        setConfirmAction({ type: 'approve', id, name });
    };

    const handleReject = (id: number, name: string) => {
        setConfirmAction({ type: 'reject', id, name });
    };

    const doAction = (reason?: string) => {
        if (!confirmAction) return;
        const { type, id } = confirmAction;
        setConfirmAction(null);

        if (type === 'approve') {
            router.patch(`/superadmin/approvals/registration/${id}/approve`);
        } else {
            router.patch(`/superadmin/approvals/registration/${id}/reject`, { reason });
        }
    };

    const doDeletionAction = () => {
        if (!deletionAction) return;
        const { type, id } = deletionAction;
        setDeletionAction(null);
        if (type === 'approve-deletion') {
            router.patch(`/superadmin/approvals/member/${id}/approve-deletion`);
        } else {
            router.patch(`/superadmin/approvals/member/${id}/reject-deletion`);
        }
    };

    const doArchiveAction = () => {
        if (!archiveAction) return;
        const { type, id } = archiveAction;
        setArchiveAction(null);
        if (type === 'approve-archive') {
            router.patch(`/superadmin/approvals/member/${id}/approve-archive`);
        } else {
            router.patch(`/superadmin/approvals/member/${id}/reject-archive`);
        }
    };

    const doRestoreAction = () => {
        if (!restoreAction) return;
        const { type, id } = restoreAction;
        setRestoreAction(null);
        if (type === 'approve-restore') {
            router.patch(`/superadmin/approvals/member/${id}/approve-restore`);
        } else {
            router.patch(`/superadmin/approvals/member/${id}/reject-restore`);
        }
    };

    const totalPending = pendingRegistrations.length + pendingLoans.length + pendingDeletions.length + pendingArchives.length + pendingRestores.length;

    return (
        <>
            <Head title="Pending Approvals" />

            {/* Confirm Dialog */}
            {confirmAction && (
                <ConfirmDialog
                    title={confirmAction.type === 'approve' ? 'Approve Registration' : 'Reject Registration'}
                    message={
                        confirmAction.type === 'approve'
                            ? `Approve the registration for ${confirmAction.name}? A member account will be created.`
                            : `Reject the registration for ${confirmAction.name}?`
                    }
                    confirmLabel={confirmAction.type === 'approve' ? 'Approve' : 'Reject'}
                    confirmClass={
                        confirmAction.type === 'approve'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                    }
                    showReason={confirmAction.type === 'reject'}
                    onConfirm={doAction}
                    onCancel={() => setConfirmAction(null)}
                />
            )}

            {/* Deletion Confirm Dialog */}
            {deletionAction && (
                <ConfirmDialog
                    title={deletionAction.type === 'approve-deletion' ? 'Approve Member Deletion' : 'Reject Deletion Request'}
                    message={
                        deletionAction.type === 'approve-deletion'
                            ? `This will permanently delete ${deletionAction.name}. This action cannot be undone. Are you sure?`
                            : `Reject the deletion request for ${deletionAction.name}? The member will be restored to active status.`
                    }
                    confirmLabel={deletionAction.type === 'approve-deletion' ? 'Permanently Delete' : 'Reject Request'}
                    confirmClass={
                        deletionAction.type === 'approve-deletion'
                            ? 'bg-red-700 hover:bg-red-800 text-white'
                            : 'bg-zinc-700 hover:bg-zinc-800 text-white'
                    }
                    onConfirm={doDeletionAction}
                    onCancel={() => setDeletionAction(null)}
                />
            )}

            {/* Archive Confirm Dialog */}
            {archiveAction && (
                <ConfirmDialog
                    title={archiveAction.type === 'approve-archive' ? 'Approve Archive Request' : 'Reject Archive Request'}
                    message={
                        archiveAction.type === 'approve-archive'
                            ? `Approve archiving ${archiveAction.name}? The member's account will be disabled and moved to the archive.`
                            : `Reject the archive request for ${archiveAction.name}? The member will remain active.`
                    }
                    confirmLabel={archiveAction.type === 'approve-archive' ? 'Approve Archive' : 'Reject Request'}
                    confirmClass={
                        archiveAction.type === 'approve-archive'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-zinc-700 hover:bg-zinc-800 text-white'
                    }
                    onConfirm={doArchiveAction}
                    onCancel={() => setArchiveAction(null)}
                />
            )}

            {/* Restore Confirm Dialog */}
            {restoreAction && (
                <ConfirmDialog
                    title={restoreAction.type === 'approve-restore' ? 'Approve Restore Request' : 'Reject Restore Request'}
                    message={
                        restoreAction.type === 'approve-restore'
                            ? `Approve restoring ${restoreAction.name} to active status? Their account will be re-enabled.`
                            : `Reject the restore request for ${restoreAction.name}? The member will remain archived.`
                    }
                    confirmLabel={restoreAction.type === 'approve-restore' ? 'Approve Restore' : 'Reject Request'}
                    confirmClass={
                        restoreAction.type === 'approve-restore'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-zinc-700 hover:bg-zinc-800 text-white'
                    }
                    onConfirm={doRestoreAction}
                    onCancel={() => setRestoreAction(null)}
                />
            )}

            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                        Staff Management
                    </p>
                    <h1 className="text-2xl font-bold text-[#2d5a27]">Pending Approvals</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Review and act on escalated loan requests and member registrations.
                    </p>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {totalPending === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-3">
                        <CheckCircle2 className="w-12 h-12 text-green-300" />
                        <p className="text-base font-medium">No pending approvals 🎉</p>
                        <p className="text-sm">Everything is up to date.</p>
                    </div>
                )}

                {/* ── Pending Member Registrations ── */}
                {pendingRegistrations.length > 0 && (
                    <Card className="border border-zinc-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#2d5a27]" />
                                <h2 className="text-base font-semibold text-zinc-900">
                                    Pending Member Registrations
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                        {pendingRegistrations.length}
                                    </span>
                                </h2>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50">
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Address</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Source of Income</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date Applied</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {pendingRegistrations.map((reg) => (
                                            <tr key={reg.id} className="hover:bg-zinc-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{reg.full_name}</td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs max-w-45 truncate">{reg.address}</td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs">{reg.income}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">{reg.date}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(reg.id, reg.full_name)}
                                                            className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs gap-1"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleReject(reg.id, reg.full_name)}
                                                            className="h-7 px-3 border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Pending Loan Requests ── */}
                {pendingLoans.length > 0 && (
                    <Card className="border border-zinc-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-[#c8920a]" />
                                <h2 className="text-base font-semibold text-zinc-900">
                                    Pending Loan Requests
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                        {pendingLoans.length}
                                    </span>
                                </h2>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50">
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Requested By</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Amount</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {pendingLoans.map((loan) => (
                                            <tr key={loan.id} className="hover:bg-zinc-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{loan.requestedBy}</td>
                                                <td className="px-4 py-3 text-zinc-700 font-mono text-xs">{peso(loan.amount)}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">{loan.date}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm"
                                                            className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline"
                                                            className="h-7 px-3 border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1">
                                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Pending Member Deletions ── */}
                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-red-500" />
                            <h2 className="text-base font-semibold text-zinc-900">
                                Pending Member Deletions
                                {pendingDeletions.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                        {pendingDeletions.length}
                                    </span>
                                )}
                            </h2>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingDeletions.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-zinc-400 text-sm">
                                No pending deletion requests ✅
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50">
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Contact</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date Requested</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Priority</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {pendingDeletions.map((d) => (
                                            <tr key={d.id} className="hover:bg-zinc-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{d.name}</td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs">{d.contact}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">{d.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                        {d.priority}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setDeletionAction({ type: 'approve-deletion', id: d.id, name: d.name })}
                                                            className="h-7 px-3 bg-red-600 hover:bg-red-700 text-white text-xs gap-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Approve Deletion
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setDeletionAction({ type: 'reject-deletion', id: d.id, name: d.name })}
                                                            className="h-7 px-3 border-zinc-300 text-zinc-600 hover:bg-zinc-50 text-xs"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Pending Archive Requests ── */}
                <Card className="border border-amber-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Archive className="w-4 h-4 text-amber-500" />
                            <h2 className="text-base font-semibold text-zinc-900">
                                Pending Archive Requests
                                {pendingArchives.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                        {pendingArchives.length}
                                    </span>
                                )}
                            </h2>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingArchives.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-zinc-400 text-sm">
                                No pending archive requests ✅
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-amber-100 bg-amber-50">
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Member</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Reason</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Requested By</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-50">
                                        {pendingArchives.map((a) => (
                                            <tr key={a.id} className="hover:bg-amber-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{a.name}</td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs max-w-48 truncate" title={a.reason ?? ''}>{a.reason ?? '—'}</td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs">{a.requested_by}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">{a.requested_at ?? '—'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setArchiveAction({ type: 'approve-archive', id: a.id, name: a.name })}
                                                            className="h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1"
                                                        >
                                                            <Archive className="w-3.5 h-3.5" /> Approve Archive
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setArchiveAction({ type: 'reject-archive', id: a.id, name: a.name })}
                                                            className="h-7 px-3 border-zinc-300 text-zinc-600 hover:bg-zinc-50 text-xs"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Pending Restore Requests ── */}
                <Card className="border border-blue-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-blue-500" />
                            <h2 className="text-base font-semibold text-zinc-900">
                                Pending Restore Requests
                                {pendingRestores.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                        {pendingRestores.length}
                                    </span>
                                )}
                            </h2>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingRestores.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-zinc-400 text-sm">
                                No pending restore requests ✅
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-blue-100 bg-blue-50">
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Member</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Restore Reason</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Archived On</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Requested By</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-50">
                                        {pendingRestores.map((r) => (
                                            <tr key={r.id} className="hover:bg-blue-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{r.name}</td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs max-w-40 truncate" title={r.reason ?? ''}>{r.reason ?? '—'}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">{r.archived_at ?? '—'}</td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs">{r.requested_by}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">{r.requested_at ?? '—'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setRestoreAction({ type: 'approve-restore', id: r.id, name: r.name })}
                                                            className="h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Restore
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setRestoreAction({ type: 'reject-restore', id: r.id, name: r.name })}
                                                            className="h-7 px-3 border-zinc-300 text-zinc-600 hover:bg-zinc-50 text-xs"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
