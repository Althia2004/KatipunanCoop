import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface PendingMember {
    id: number;
    name: string;
    gender: string;
    status: 'pending';
    created_at: string;
}

interface PendingApprovalsTableProps {
    members: PendingMember[];
    onApprove: (member: PendingMember) => void;
    onReject: (member: PendingMember) => void;
    isLoading?: boolean;
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PendingApprovalsTable({
    members,
    onApprove,
    onReject,
    isLoading = false,
}: PendingApprovalsTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-200" />
                ))}
            </div>
        );
    }

    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-12">
                <p className="text-sm text-zinc-500">No pending approvals</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Gender</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Date Created</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => (
                        <tr key={member.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                            <td className="px-6 py-4 text-sm text-zinc-900">#{member.id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-zinc-900">{member.name}</td>
                            <td className="px-6 py-4 text-sm text-zinc-700 capitalize">{member.gender}</td>
                            <td className="px-6 py-4 text-sm text-zinc-700">{formatDate(member.created_at)}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onApprove(member)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                                        title="Approve"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => onReject(member)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                                        title="Reject"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
