import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import MemberTable, { Member } from './MemberTable';
import MemberSearch from './MemberSearch';
import StatusBadge from './StatusBadge';
import { apiClient } from '@/lib/api-client';

export default function MemberManagementDashboard() {
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<{ data: Member[] }>('/api/members');
            setMembers(response.data.data);
        } catch (err) {
            setError('Failed to load members');
            console.error('Error fetching members:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = members.filter((m) => {
        const searchLower = search.toLowerCase();
        return m.name.toLowerCase().includes(searchLower) || m.id.toString().includes(searchLower);
    });

    const approvedCount = members.length;
    const goodStandingCount = members.filter((m) => m.membership_status === 'good').length;
    const warningCount = members.filter((m) => m.membership_status === 'warning').length;

    const handleEdit = (member: Member) => {
        console.log('Edit member:', member.id);
        // TODO: Implement edit functionality
    };

    const handleView = (member: Member) => {
        console.log('View member:', member.id);
        // TODO: Implement view functionality
    };

    const handleDelete = async (member: Member) => {
        if (!confirm(`Are you sure you want to delete ${member.name}?`)) return;
        try {
            await apiClient.delete(`/api/members/${member.id}`);
            setMembers(members.filter((m) => m.id !== member.id));
        } catch (err) {
            setError('Failed to delete member');
            console.error('Error deleting member:', err);
        }
    };

    const handleLock = (member: Member) => {
        console.log('Lock member:', member.id);
        // TODO: Implement lock functionality
    };

    return (
        <>
            <Head title="Member Management" />

            <div className="space-y-8 p-8 max-w-[90rem] mx-auto">
                {/* Header */}
                <div className="border-b border-zinc-200 pb-6">
                    <h1 className="text-3xl font-bold text-[#2d4734]">Member Management</h1>
                    <p className="mt-2 text-zinc-600 font-medium">
                        View and manage approved cooperative members
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-zinc-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Total Approved Members</p>
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
                                <span className="text-2xl">✓</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Warnings/Non-Compliant</p>
                                <p className="mt-2 text-3xl font-bold text-amber-600">{warningCount}</p>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-3">
                                <span className="text-2xl">!</span>
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

                {/* Search & Filter */}
                <div className="space-y-4">
                    <MemberSearch search={search} onSearchChange={setSearch} />
                </div>

                {/* Members Table */}
                <MemberTable
                    members={filtered}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    onLock={handleLock}
                    isLoading={isLoading}
                />
            </div>
        </>
    );
}
