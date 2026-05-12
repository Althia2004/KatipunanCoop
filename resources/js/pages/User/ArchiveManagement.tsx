import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Archive, RotateCcw, Search, Eye, X,
    Calendar, User, AlertCircle, CheckCircle,
    ArrowLeft, Filter
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ArchivedMember {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    contact_number: string;
    gender: string;
    date_of_birth: string;
    address: string;
    status: string;
    standing: string;
    migs_score: number;
    migs_classification: string;
    share_capital: number;
    savings_balance: number;
    start_date: string | null;
    archived_at: string;
    archived_by_name: string;
    archive_reason: string;
    archive_year: number;
    restore_requested: boolean;
    restore_request_reason: string | null;
    restore_requested_by_name: string | null;
    restore_requested_at: string | null;
}

interface Props {
    members: ArchivedMember[];
    archiveYears: number[];
    filters: { search: string; archiveYear: string; standing: string; gender: string };
    stats: { total: number; pending_restore: number };
}

const fmt = (n: number) =>
    '\u20b1' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ArchiveManagement({ members, archiveYears, filters, stats }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = (props as any).flash;

    const [search, setSearch]           = useState(filters.search ?? '');
    const [archiveYear, setArchiveYear] = useState(filters.archiveYear ?? '');
    const [standing, setStanding]       = useState(filters.standing ?? '');
    const [gender, setGender]           = useState(filters.gender ?? '');

    const [viewMember, setViewMember]       = useState<ArchivedMember | null>(null);
    const [restoreTarget, setRestoreTarget] = useState<ArchivedMember | null>(null);
    const [restoreReason, setRestoreReason] = useState('');
    const [restoreOpen, setRestoreOpen]     = useState(false);

    let searchTimer: ReturnType<typeof setTimeout>;

    const applyFilters = (overrides = {}) => {
        router.get('/user/archive-management', {
            search,
            archive_year: archiveYear,
            standing,
            gender,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => applyFilters({ search: val }), 400);
    };

    const clearFilters = () => {
        setSearch(''); setArchiveYear(''); setStanding(''); setGender('');
        applyFilters({ search: '', archive_year: '', standing: '', gender: '' });
    };

    const hasFilters = search || archiveYear || standing || gender;

    return (
        <>
            <Head title="Archive Management" />

            {/* \u2500\u2500 View Sheet \u2500\u2500 */}
            <Sheet open={!!viewMember} onOpenChange={(o) => !o && setViewMember(null)}>
                <SheetContent className="w-105 sm:w-110 overflow-y-auto p-0 border-l border-zinc-200 shadow-2xl">
                    {viewMember && (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-100 bg-linear-to-br from-amber-50 to-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-1">
                                            Archived Member
                                        </p>
                                        <h2 className="text-xl font-bold text-zinc-900">{viewMember.name}</h2>
                                        <p className="text-sm text-zinc-400 mt-0.5">Member ID #{viewMember.id}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                        \U0001f5c4 Archived {viewMember.archive_year}
                                    </span>
                                    {viewMember.restore_requested && (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                            \u21a9 Restore Pending Approval
                                        </span>
                                    )}
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        viewMember.migs_score >= 50
                                            ? 'bg-[#2d5a27]/10 text-[#2d5a27] border border-[#2d5a27]/20'
                                            : 'bg-red-100 text-red-600 border border-red-200'
                                    }`}>
                                        MIGS {viewMember.migs_score}/100
                                    </span>
                                </div>
                            </div>

                            {/* Archive Info */}
                            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/50">
                                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-1.5">
                                    <Archive className="w-3.5 h-3.5" /> Archive Information
                                </p>
                                <div className="space-y-2.5">
                                    {[
                                        { label: 'Archived On',   value: viewMember.archived_at },
                                        { label: 'Archived By',   value: viewMember.archived_by_name },
                                        { label: 'Archive Year',  value: String(viewMember.archive_year) },
                                        { label: 'Reason',        value: viewMember.archive_reason },
                                    ].map(row => (
                                        <div key={row.label} className="flex justify-between gap-4">
                                            <span className="text-xs text-amber-700 shrink-0">{row.label}</span>
                                            <span className="text-xs font-semibold text-amber-900 text-right">{row.value || '\u2014'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Restore request pending */}
                            {viewMember.restore_requested && (
                                <div className="px-6 py-4 border-b border-blue-100 bg-blue-50/50">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-1.5">
                                        <RotateCcw className="w-3.5 h-3.5" /> Pending Restore Request
                                    </p>
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Requested By', value: viewMember.restore_requested_by_name ?? '\u2014' },
                                            { label: 'Requested On', value: viewMember.restore_requested_at ?? '\u2014' },
                                            { label: 'Reason',       value: viewMember.restore_request_reason ?? '\u2014' },
                                        ].map(row => (
                                            <div key={row.label} className="flex justify-between gap-4">
                                                <span className="text-xs text-blue-700 shrink-0">{row.label}</span>
                                                <span className="text-xs font-semibold text-blue-900 text-right">{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Personal Info */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Personal Information
                                </p>
                                <div className="space-y-2.5">
                                    {[
                                        { label: 'Gender',        value: viewMember.gender },
                                        { label: 'Date of Birth', value: viewMember.date_of_birth },
                                        { label: 'Contact',       value: viewMember.contact_number },
                                        { label: 'Address',       value: viewMember.address },
                                        { label: 'Member Since',  value: viewMember.start_date ?? '\u2014' },
                                        { label: 'Standing',      value: viewMember.standing },
                                    ].map(row => (
                                        <div key={row.label} className="flex justify-between gap-4">
                                            <span className="text-sm text-zinc-500 shrink-0">{row.label}</span>
                                            <span className="text-sm font-medium text-zinc-800 text-right capitalize">{row.value || '\u2014'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Financial */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                                    Financial Summary
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#c8920a]/10 rounded-xl p-3">
                                        <p className="text-xs text-zinc-500">Share Capital</p>
                                        <p className="font-bold text-[#c8920a] text-sm mt-0.5">{fmt(viewMember.share_capital)}</p>
                                    </div>
                                    <div className="bg-[#2d5a27]/10 rounded-xl p-3">
                                        <p className="text-xs text-zinc-500">Savings</p>
                                        <p className="font-bold text-[#2d5a27] text-sm mt-0.5">{fmt(viewMember.savings_balance)}</p>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-xs text-zinc-500">MIGS Score</p>
                                        <span className={`text-xs font-bold ${viewMember.migs_score >= 50 ? 'text-[#2d5a27]' : 'text-red-500'}`}>
                                            {viewMember.migs_score}/100
                                        </span>
                                    </div>
                                    <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${viewMember.migs_score >= 50 ? 'bg-[#2d5a27]' : 'bg-red-400'}`}
                                            style={{ width: `${viewMember.migs_score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 space-y-2">
                                {!viewMember.restore_requested ? (
                                    <button
                                        onClick={() => {
                                            setRestoreTarget(viewMember);
                                            setRestoreReason('');
                                            setRestoreOpen(true);
                                        }}
                                        className="w-full py-2.5 bg-[#2d5a27] text-white rounded-xl text-sm font-semibold hover:bg-[#1e3e1a] transition flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Request Restoration
                                    </button>
                                ) : (
                                    <div className="w-full py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-semibold text-blue-700 text-center flex items-center justify-center gap-2">
                                        <RotateCcw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                                        Restore Request Awaiting Superadmin Approval
                                    </div>
                                )}
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

            {/* \u2500\u2500 Restore Request Dialog \u2500\u2500 */}
            <Dialog open={restoreOpen} onOpenChange={(o) => {
                setRestoreOpen(o);
                if (!o) { setRestoreReason(''); setRestoreTarget(null); }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#2d5a27]">
                            <RotateCcw className="w-5 h-5" />
                            Request Member Restoration
                        </DialogTitle>
                    </DialogHeader>
                    {restoreTarget && (
                        <div className="space-y-4 py-2">
                            <div className="bg-[#2d5a27]/5 border border-[#2d5a27]/20 rounded-xl p-4">
                                <p className="font-semibold text-[#2d5a27] text-sm">{restoreTarget.name}</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    This request will be sent to the Superadmin for review before the member account is reactivated.
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-xs font-semibold text-amber-700">Original archive reason:</p>
                                <p className="text-xs text-amber-600 mt-1">{restoreTarget.archive_reason}</p>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Reason for Restoration <span className="text-red-500">*</span>
                                </Label>
                                <textarea
                                    value={restoreReason}
                                    onChange={(e) => setRestoreReason(e.target.value)}
                                    placeholder="e.g. Member has returned to the area and wishes to rejoin..."
                                    rows={4}
                                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2d5a27]/30 resize-none"
                                />
                                <div className="flex justify-between">
                                    <p className="text-xs text-zinc-400">Minimum 10 characters</p>
                                    <p className={`text-xs font-medium ${restoreReason.length >= 10 ? 'text-[#2d5a27]' : 'text-zinc-400'}`}>
                                        {restoreReason.length} chars
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRestoreOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!restoreTarget || restoreReason.length < 10) return;
                                router.patch(
                                    `/user/member-management/${restoreTarget.id}/request-restore`,
                                    { restore_reason: restoreReason },
                                    {
                                        onSuccess: () => {
                                            setRestoreOpen(false);
                                            setViewMember(null);
                                            setRestoreReason('');
                                            setRestoreTarget(null);
                                        },
                                        preserveScroll: true,
                                    }
                                );
                            }}
                            disabled={restoreReason.length < 10}
                            className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                        >
                            Submit Restore Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* \u2500\u2500 Page Content \u2500\u2500 */}
            <div className="space-y-6 p-4 lg:p-6">

                {/* Header */}
                <div>
                    <Link
                        href="/user/member-management"
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 mb-3 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Member Management
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                                <Archive className="w-6 h-6 text-amber-600" />
                                Archive Management
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">
                                View archived member records and submit restoration requests for Superadmin approval.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 bg-[#2d5a27]/10 border border-[#2d5a27]/20 rounded-xl px-4 py-3 text-sm text-[#2d5a27] font-medium">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <Archive className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Total Archived</p>
                            <p className="text-2xl font-bold text-amber-700">{stats.total}</p>
                        </div>
                    </div>
                    <div className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3 ${
                        stats.pending_restore > 0 ? 'border-blue-200' : 'border-zinc-200'
                    }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            stats.pending_restore > 0 ? 'bg-blue-100' : 'bg-zinc-100'
                        }`}>
                            <RotateCcw className={`w-5 h-5 ${stats.pending_restore > 0 ? 'text-blue-600' : 'text-zinc-400'}`} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Pending Restore</p>
                            <p className={`text-2xl font-bold ${stats.pending_restore > 0 ? 'text-blue-700' : 'text-zinc-400'}`}>
                                {stats.pending_restore}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                            <Filter className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Showing</p>
                            <p className="text-2xl font-bold text-zinc-700">{members.length}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative flex-1 min-w-52">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by name or contact..."
                                className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            />
                            {search && (
                                <button onClick={() => handleSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <X className="w-3.5 h-3.5 text-zinc-400" />
                                </button>
                            )}
                        </div>

                        {/* Archive Year */}
                        <div className="flex items-center gap-1.5">
                            <label className="text-xs text-zinc-500 shrink-0">Archive Year</label>
                            <select
                                value={archiveYear}
                                onChange={(e) => { setArchiveYear(e.target.value); applyFilters({ archive_year: e.target.value }); }}
                                className="h-9 rounded-xl border border-zinc-200 px-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5a27]/30 min-w-28"
                            >
                                <option value="">All Years</option>
                                {archiveYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        {/* Standing */}
                        <div className="flex items-center gap-1.5">
                            <label className="text-xs text-zinc-500 shrink-0">Standing</label>
                            <select
                                value={standing}
                                onChange={(e) => { setStanding(e.target.value); applyFilters({ standing: e.target.value }); }}
                                className="h-9 rounded-xl border border-zinc-200 px-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            >
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="delinquent">Delinquent</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Gender */}
                        <div className="flex items-center gap-1.5">
                            <label className="text-xs text-zinc-500 shrink-0">Gender</label>
                            <select
                                value={gender}
                                onChange={(e) => { setGender(e.target.value); applyFilters({ gender: e.target.value }); }}
                                className="h-9 rounded-xl border border-zinc-200 px-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            >
                                <option value="">All</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Clear */}
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="h-9 px-3 rounded-xl border border-zinc-200 text-xs text-zinc-500 hover:bg-zinc-50 transition flex items-center gap-1"
                            >
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Notice */}
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                        Archived members are <strong>preserved permanently</strong> and are never deleted. Records can be restored by submitting a request for Superadmin approval.
                    </p>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-zinc-700">
                            Archived Members
                            <span className="ml-2 text-xs font-normal text-zinc-400">({members.length} records)</span>
                        </h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                                {['Member', 'Archived On', 'Year', 'Reason', 'Archived By', 'MIGS Score', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                            <Archive className="w-8 h-8 text-amber-400" />
                                        </div>
                                        <p className="text-sm font-semibold text-zinc-600 mb-1">No archived members found</p>
                                        <p className="text-xs text-zinc-400">
                                            {hasFilters
                                                ? 'Try adjusting your filters or search term.'
                                                : 'Archived members will appear here once a request is approved by Superadmin.'}
                                        </p>
                                        {hasFilters && (
                                            <button onClick={clearFilters} className="mt-3 text-xs text-[#2d5a27] hover:underline">
                                                Clear all filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : members.map(m => (
                                <tr key={m.id} className="hover:bg-zinc-50/60 transition group">
                                    <td className="px-4 py-3.5">
                                        <p className="font-semibold text-zinc-800 group-hover:text-[#2d5a27] transition">{m.name}</p>
                                        <p className="text-xs text-zinc-400 mt-0.5 capitalize">
                                            {m.gender} <span className="mx-0.5 text-zinc-300">â€¢</span> {m.standing}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                            <Calendar className="w-3 h-3" />
                                            {m.archived_at}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                            {m.archive_year}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 max-w-44">
                                        <p className="text-xs text-zinc-500 truncate" title={m.archive_reason}>
                                            {m.archive_reason}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-zinc-500">{m.archived_by_name}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${m.migs_score >= 50 ? 'bg-[#2d5a27]' : 'bg-red-400'}`}
                                                    style={{ width: `${m.migs_score}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-semibold ${m.migs_score >= 50 ? 'text-[#2d5a27]' : 'text-red-500'}`}>
                                                {m.migs_score}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {m.restore_requested ? (
                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold whitespace-nowrap">
                                                <RotateCcw className="w-3 h-3" /> Restore Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                                                <Archive className="w-3 h-3" /> Archived
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => setViewMember(m)}
                                                className="flex items-center gap-1 h-7 px-2.5 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-100 transition font-medium"
                                            >
                                                <Eye className="w-3 h-3" /> View
                                            </button>
                                            {!m.restore_requested && (
                                                <button
                                                    onClick={() => {
                                                        setRestoreTarget(m);
                                                        setRestoreReason('');
                                                        setRestoreOpen(true);
                                                    }}
                                                    className="flex items-center gap-1 h-7 px-2.5 text-xs border border-[#2d5a27]/30 rounded-lg text-[#2d5a27] hover:bg-[#2d5a27]/5 transition font-medium whitespace-nowrap"
                                                >
                                                    <RotateCcw className="w-3 h-3" /> Request Restore
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
