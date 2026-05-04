import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import PendingApprovalsTable, { PendingMember } from './PendingApprovalsTable';
import { apiClient } from '@/lib/api-client';

export default function PendingApprovalsPanel() {
    const [members, setMembers] = useState<PendingMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approvalInProgress, setApprovalInProgress] = useState<number | null>(null);

    useEffect(() => {
        fetchPendingMembers();
    }, []);

    const fetchPendingMembers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<{ data: PendingMember[] }>('/api/members/pending');
            setMembers(response.data.data);
        } catch (err) {
            setError('Failed to load pending approvals');
            console.error('Error fetching pending members:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (member: PendingMember) => {
        if (!confirm(`Approve ${member.name} for membership?`)) return;

        setApprovalInProgress(member.id);
        try {
            await apiClient.put(`/api/members/${member.id}/approve`);
            setMembers(members.filter((m) => m.id !== member.id));
        } catch (err) {
            setError('Failed to approve member');
            console.error('Error approving member:', err);
        } finally {
            setApprovalInProgress(null);
        }
    };

    const handleReject = async (member: PendingMember) => {
        if (!confirm(`Reject ${member.name} for membership?`)) return;

        setApprovalInProgress(member.id);
        try {
            await apiClient.put(`/api/members/${member.id}/reject`);
            setMembers(members.filter((m) => m.id !== member.id));
        } catch (err) {
            setError('Failed to reject member');
            console.error('Error rejecting member:', err);
        } finally {
            setApprovalInProgress(null);
        }
    };

    return (
        <>
            <Head title="Pending Member Approvals" />

            <div className="space-y-8 p-8 max-w-[90rem] mx-auto">
                {/* Header */}
                <div className="border-b border-zinc-200 pb-6">
                    <h1 className="text-3xl font-bold text-[#2d4734]">Pending Member Approvals</h1>
                    <p className="mt-2 text-zinc-600 font-medium">
                        Review and approve new member applications
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-zinc-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Pending Approvals</p>
                                <p className="mt-2 text-3xl font-bold text-yellow-600">{members.length}</p>
                            </div>
                            <div className="rounded-lg bg-yellow-50 p-3">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Action Required</p>
                                <p className="mt-2 text-3xl font-bold text-amber-600">
                                    {members.length > 0 ? 'Yes' : 'None'}
                                </p>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-3">
                                <AlertCircle className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Info Alert */}
                {members.length > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Approving a member will make them visible in the Admin Member Management dashboard.
                            Rejecting will remove them from the system.
                        </p>
                    </div>
                )}

                {/* Pending Approvals Table */}
                <PendingApprovalsTable
                    members={members}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isLoading={isLoading}
                />
            </div>
        </>
    );
}
