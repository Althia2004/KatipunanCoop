import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, XCircle, ClipboardList, Users, Trash2 } from 'lucide-react';
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
    amount: number | string;
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

interface Props {
    pendingRegistrations: PendingRegistration[];
    pendingLoans: PendingLoan[];
    pendingDeletions: PendingDeletion[];
}

// ── Peso formatter ────────────────────────────────────────────────────────────

const peso = (n: number | string) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(n || 0));

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

export default function Approvals({ pendingRegistrations, pendingLoans, pendingDeletions }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const [confirmAction, setConfirmAction] = useState<{
        type: 'approve' | 'reject';
        id: number;
        name: string;
    } | null>(null);

    const [loanConfirm, setLoanConfirm] = useState<{
        id: number;
        name: string;
    } | null>(null);

    const [deletionAction, setDeletionAction] = useState<{
        type: 'approve-deletion' | 'reject-deletion';
        id: number;
        name: string;
    } | null>(null);

    const handleApprove = (id: number, name: string) => {
        setConfirmAction({ type: 'approve', id, name });
    };

    const handleReject = (id: number, name: string) => {
        setConfirmAction({ type: 'reject', id, name });
    };

    const handleLoanApprove = (id: number, name: string) => {
        setLoanConfirm({ id, name });
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

    const doLoanApprove = () => {
        if (!loanConfirm) return;
        const { id } = loanConfirm;
        setLoanConfirm(null);
        router.patch(`/loan/request/${id}/approve`, { interest_rate: 1.0 }, {
            preserveScroll: true,
            onSuccess: () => {
                window.location.reload();
            },
        });
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

    const totalPending = pendingRegistrations.length + pendingLoans.length + pendingDeletions.length;

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

            {loanConfirm && (
                <ConfirmDialog
                    title="Approve Loan Request"
                    message={`Approve the loan request submitted by ${loanConfirm.name}?`}
                    confirmLabel="Approve Loan"
                    confirmClass="bg-green-600 hover:bg-green-700 text-white"
                    onConfirm={doLoanApprove}
                    onCancel={() => setLoanConfirm(null)}
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
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleLoanApprove(loan.id, loan.requestedBy)}
                                                            className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs gap-1"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
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
            </div>
        </>
    );
}
