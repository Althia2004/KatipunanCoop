import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Users,
    ClipboardList,
    Clock,
    CheckCircle2,
    Plus,
    Search,
    Eye,
} from 'lucide-react';
import type { MemberRegistrationSummary, RegistrationStatus } from '@/types/member-registration';

interface Props {
    registrations: MemberRegistrationSummary[];
}

const STATUS_LABELS: Record<RegistrationStatus, string> = {
    pending:            'Pending',
    seminar_scheduled:  'Seminar Scheduled',
    seminar_attended:   'Seminar Attended',
    for_bod_approval:   'Awaiting Superadmin',
    approved:           'Approved',
    rejected:           'Rejected',
};

const STATUS_COLORS: Record<RegistrationStatus, string> = {
    pending:           'bg-zinc-100 text-zinc-600',
    seminar_scheduled: 'bg-blue-100 text-blue-700',
    seminar_attended:  'bg-amber-100 text-amber-700',
    for_bod_approval:  'bg-purple-100 text-purple-700',
    approved:          'bg-emerald-100 text-emerald-700',
    rejected:          'bg-red-100 text-red-600',
};

const ALL_STATUSES: RegistrationStatus[] = [
    'pending',
    'seminar_scheduled',
    'seminar_attended',
    'for_bod_approval',
    'approved',
    'rejected',
];

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function MemberRegistrationDashboard({ registrations }: Props) {
    const [search, setSearch]           = useState('');
    const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all');

    const filtered = registrations.filter((r) => {
        const matchesSearch = r.full_name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalCount    = registrations.length;
    const pendingCount  = registrations.filter(r => r.status === 'pending').length;
    const approvedCount = registrations.filter(r => r.status === 'approved').length;
    const bodCount      = registrations.filter(r => r.status === 'for_bod_approval' || r.status === 'seminar_attended').length;

    return (
        <>
            <Head title="Member Registration" />

            <div className="p-8 max-w-360 mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d4734]">Member Registration</h1>
                        <p className="text-zinc-500 font-medium">
                            Manage applicant registrations and track seminar attendance.
                        </p>
                    </div>
                    <Link
                        href="/loan/member-registration/create"
                        className="flex items-center gap-2 px-6 py-3 bg-[#4c9f5f] text-white rounded-xl font-bold hover:bg-[#3d814d] transition shadow-lg shadow-emerald-900/10 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Register New Member
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><ClipboardList /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Total Applicants</p>
                                <p className="text-2xl font-bold text-zinc-900">{totalCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-100 rounded-lg text-zinc-500"><Clock /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-zinc-900">{pendingCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-lg text-purple-600"><Users /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Awaiting Approval</p>
                                <p className="text-2xl font-bold text-zinc-900">{bodCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Approved</p>
                                <p className="text-2xl font-bold text-zinc-900">{approvedCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full text-zinc-900 pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#4c9f5f] focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as RegistrationStatus | 'all')}
                        className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-700 font-medium focus:ring-2 focus:ring-[#4c9f5f] focus:border-transparent outline-none transition-all"
                    >
                        <option value="all">All Statuses</option>
                        {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                            <tr>
                                <th className="px-6 py-4">APPLICANT</th>
                                <th className="px-6 py-4">CONTACT</th>
                                <th className="px-6 py-4">SEMINAR</th>
                                <th className="px-6 py-4">STATUS</th>
                                <th className="px-6 py-4">REGISTERED</th>
                                <th className="px-6 py-4 text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <ClipboardList className="w-8 h-8 text-zinc-300" />
                                            <p className="font-medium">No registrations found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(r => (
                                    <tr key={r.id} className="hover:bg-zinc-50/50 transition group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-zinc-900 group-hover:text-[#4c9f5f] transition-colors">
                                                {r.full_name}
                                            </p>
                                            {r.registered_by && (
                                                <p className="text-xs text-zinc-400 mt-0.5">by {r.registered_by}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">{r.contact_number}</td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs">
                                            {r.seminar
                                                ? <span className="font-medium text-zinc-700">{r.seminar.title}</span>
                                                : <span className="text-zinc-400 italic">Not assigned</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[r.status]}`}>
                                                {STATUS_LABELS[r.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">
                                            {formatDate(r.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/loan/member-registration/${r.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-[#4c9f5f]/10 rounded-lg text-zinc-400 hover:text-[#2d4734] font-medium transition text-xs"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
