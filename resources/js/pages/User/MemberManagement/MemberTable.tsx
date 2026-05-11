import React from 'react';
import { Eye, Edit, Lock, LockOpen, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export interface Member {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    contact_number: string;
    source_of_income: string;
    date_of_birth: string | null;
    address: string;
    gender: string;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended' | 'pending_deletion';
    membership_status: 'good' | 'warning' | 'non-compliant';
    standing: string;
    start_date: string | null;
    last_login: string | null;
    migs_score: number;
    migs_classification: 'migs' | 'non_migs';
    share_capital: number;
    savings_balance: number;
    copra_sales_ytd: number;
    loans: {
        id: number;
        principal_amount: number;
        remaining_balance: number;
        status: string;
        created_at: string;
    }[];
}

interface MemberTableProps {
    members: Member[];
    onEdit: (member: Member) => void;
    onView: (member: Member) => void;
    onDelete: (member: Member) => void;
    onLock: (member: Member) => void;
    isLoading?: boolean;
}

function formatDate(dateString: string | null) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function MemberTable({
    members,
    onEdit,
    onView,
    onDelete,
    onLock,
    isLoading = false,
}: MemberTableProps) {
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
                <p className="text-sm text-zinc-500">No approved members found</p>
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
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Member Standing</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Start Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Membership Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Gender</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => (
                        <tr
                            key={member.id}
                            className={`border-b border-zinc-200 hover:bg-zinc-50 ${member.status === 'pending_deletion' ? 'bg-amber-50/40' : ''}`}
                        >
                            <td className="px-6 py-4 text-sm text-zinc-900">#{member.id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-zinc-900">{member.name}</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={member.status} />
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-700">{member.standing}</td>
                            <td className="px-6 py-4 text-sm text-zinc-700">{formatDate(member.start_date)}</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={member.membership_status} />
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-700 capitalize">{member.gender}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {/* View */}
                                    <button
                                        onClick={() => onView(member)}
                                        className="rounded-lg p-2 text-zinc-600 hover:bg-blue-50 hover:text-blue-600 transition"
                                        title="View"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>

                                    {/* Edit — disabled while pending deletion */}
                                    {member.status !== 'pending_deletion' && (
                                        <button
                                            onClick={() => onEdit(member)}
                                            className="rounded-lg p-2 text-zinc-600 hover:bg-amber-50 hover:text-amber-600 transition"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    )}

                                    {/* Lock / Unlock — disabled while pending deletion */}
                                    {member.status !== 'pending_deletion' && (
                                        <button
                                            onClick={() => onLock(member)}
                                            className={`rounded-lg p-2 transition ${
                                                member.status === 'suspended'
                                                    ? 'text-red-500 hover:bg-red-50 hover:text-red-700'
                                                    : 'text-zinc-400 hover:bg-purple-50 hover:text-purple-600'
                                            }`}
                                            title={member.status === 'suspended' ? 'Reactivate Member' : 'Suspend Member'}
                                        >
                                            {member.status === 'suspended' ? (
                                                <Lock className="h-4 w-4" />
                                            ) : (
                                                <LockOpen className="h-4 w-4" />
                                            )}
                                        </button>
                                    )}

                                    {/* Delete / Pending Deletion badge */}
                                    {member.status === 'pending_deletion' ? (
                                        <span className="text-xs text-amber-600 font-medium px-2 py-0.5 bg-amber-100 rounded-full whitespace-nowrap">
                                            Pending Deletion
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => onDelete(member)}
                                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition"
                                            title="Request Deletion"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}