import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Banknote, Clock, CheckCircle2, XCircle, Eye, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ── Types ─────────────────────────────────────────────────────────────────────

// TODO: wire to real Loan model
interface LoanItem {
    id: number;
    member: string;
    amount: number;
    purpose: string;
    status: 'approved' | 'pending' | 'for_bod' | 'rejected' | 'closed';
    dateReleased: string | null;
    balance: number;
}

interface Props {
    // Controller passes empty array for now — placeholder data used below
    loans?: LoanItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<LoanItem['status'], string> = {
    approved:  'Approved',
    pending:   'Pending',
    for_bod:   'For BOD Review',
    rejected:  'Rejected',
    closed:    'Closed',
};

const STATUS_BADGE: Record<LoanItem['status'], string> = {
    approved:  'bg-green-100 text-green-700',
    pending:   'bg-amber-100 text-amber-700',
    for_bod:   'bg-blue-100 text-blue-700',
    rejected:  'bg-red-100 text-red-700',
    closed:    'bg-zinc-100 text-zinc-500',
};

// ── Placeholder data ───────────────────────────────────────────────────────────
// TODO: remove once controller passes real data
const PLACEHOLDER: LoanItem[] = [
    { id: 1, member: 'Juan Dela Cruz',  amount: 25000, purpose: 'Home Improvement', status: 'approved', dateReleased: 'Jan 15, 2026', balance: 18000 },
    { id: 2, member: 'Maria Santos',    amount: 50000, purpose: 'Business Capital',  status: 'pending',  dateReleased: null,            balance: 50000 },
    { id: 3, member: 'Pedro Reyes',     amount: 80000, purpose: 'Education',         status: 'for_bod',  dateReleased: null,            balance: 80000 },
    { id: 4, member: 'Ana Villanueva',  amount: 15000, purpose: 'Medical',           status: 'rejected', dateReleased: null,            balance: 0    },
    { id: 5, member: 'Jose Lim',        amount: 30000, purpose: 'Livelihood',        status: 'closed',   dateReleased: 'Jun 01, 2025',  balance: 0    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Loans({ loans }: Props) {
    const data = (loans && loans.length > 0) ? loans : PLACEHOLDER;

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<LoanItem['status'] | 'all'>('all');

    const filtered = data.filter((l) => {
        const matchSearch = l.member.toLowerCase().includes(search.toLowerCase()) ||
            l.purpose.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || l.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = [
        { label: 'Total Loans',   value: data.length,                                             icon: Banknote,     color: 'text-blue-600',    bg: 'bg-blue-50' },
        { label: 'Active',        value: data.filter((l) => l.status === 'approved').length,      icon: CheckCircle2, color: 'text-green-600',   bg: 'bg-green-50' },
        { label: 'Pending',       value: data.filter((l) => l.status === 'pending' || l.status === 'for_bod').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Closed/Rejected', value: data.filter((l) => l.status === 'closed' || l.status === 'rejected').length, icon: XCircle, color: 'text-zinc-500', bg: 'bg-zinc-100' },
    ];

    return (
        <>
            <Head title="All Loans" />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                        Cooperative
                    </p>
                    <h1 className="text-2xl font-bold text-[#2d5a27]">All Loans</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Overview of all cooperative loan records.
                        {/* TODO: remove placeholder note once real data is wired */}
                        {(!loans || loans.length === 0) && (
                            <span className="ml-2 text-amber-500">(showing placeholder data)</span>
                        )}
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s) => (
                        <Card key={s.label} className="border border-zinc-200 shadow-sm">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                                    <s.icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-zinc-900">{s.value}</p>
                                    <p className="text-xs text-zinc-500">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex gap-2 flex-wrap">
                            <div className="relative flex-1 min-w-52">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                <Input className="pl-8 h-8 text-sm" placeholder="Search by member or purpose…"
                                    value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-700"
                            >
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="for_bod">For BOD Review</option>
                                <option value="rejected">Rejected</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50">
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Member</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Amount</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Purpose</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date Released</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Balance</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-zinc-400 text-sm">
                                                No loans found.
                                            </td>
                                        </tr>
                                    )}
                                    {filtered.map((l) => (
                                        <tr key={l.id} className="hover:bg-zinc-50 transition">
                                            <td className="px-4 py-3 font-medium text-zinc-800">{l.member}</td>
                                            <td className="px-4 py-3 text-zinc-700">₱{l.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-zinc-500">{l.purpose}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[l.status]}`}>
                                                    {STATUS_LABEL[l.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400 text-xs">{l.dateReleased ?? '—'}</td>
                                            <td className="px-4 py-3 text-zinc-700">
                                                {l.balance > 0 ? `₱${l.balance.toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm"
                                                    className="h-7 px-2 text-zinc-400 hover:text-[#2d5a27] gap-1 text-xs">
                                                    <Eye className="w-3.5 h-3.5" /> View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
