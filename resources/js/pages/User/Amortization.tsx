import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';

interface Amortization {
    id: number;
    loan_id: number;
    member_name: string;
    due_date: string;
    amount_to_pay: number;
    principal_part: number;
    interest_part: number;
    status: string;
    paid_at: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Stats {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
}

interface Props {
    amortizations: Paginated<Amortization>;
    stats: Stats;
    filters: { search: string; status: string };
}

const statusBadge: Record<string, string> = {
    pending: 'bg-[#c8920a]/10 text-[#c8920a]',
    paid:    'bg-[#2d5a27]/10 text-[#2d5a27]',
    overdue: 'bg-red-100 text-red-700',
};

function fmt(n: number) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Amortization({ amortizations, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const apply = useCallback((s: string, st: string) => {
        router.get('/user/amortization', { search: s, status: st }, { preserveState: true, replace: true });
    }, []);

    useEffect(() => {
        const t = setTimeout(() => apply(search, status), 400);
        return () => clearTimeout(t);
    }, [search]);

    const statuses = ['', 'pending', 'paid', 'overdue'];
    const statusLabels: Record<string, string> = { '': 'All', pending: 'Pending', paid: 'Paid', overdue: 'Overdue' };

    return (
        <>
            <Head title="Amortization Schedules" />
            <div className="p-6 space-y-6 max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">User Management</p>
                        <h1 className="text-2xl font-bold text-[#2d5a27]">Amortization Schedules</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">View all loan repayment schedules</p>
                    </div>
                    <a href="/user/amortization/download">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#c8920a] text-white text-sm font-semibold rounded-xl hover:bg-[#a87608] transition">
                            <Download className="w-4 h-4" />
                            Download CSV
                        </button>
                    </a>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Schedules', value: stats.total },
                        { label: 'Pending',          value: stats.pending },
                        { label: 'Paid',             value: stats.paid },
                        { label: 'Overdue',          value: stats.overdue },
                    ].map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                            <p className="text-xs font-medium text-zinc-500 mb-1">{s.label}</p>
                            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search member name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 sm:w-64 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => { setStatus(s); apply(search, s); }}
                                className={`h-9 px-3 text-sm font-medium rounded-xl transition ${
                                    status === s
                                        ? 'bg-[#2d5a27] text-white'
                                        : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                }`}
                            >
                                {statusLabels[s]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                                {['Member', 'Loan ID', 'Due Date', 'Amount Due', 'Principal', 'Interest', 'Status', 'Paid At'].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {amortizations.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-12 text-center text-zinc-400 text-sm">
                                        No amortization schedules found
                                    </td>
                                </tr>
                            ) : amortizations.data.map((a) => (
                                <tr key={a.id} className="hover:bg-zinc-50 transition">
                                    <td className="px-5 py-3.5 font-medium text-zinc-800">{a.member_name}</td>
                                    <td className="px-5 py-3.5 text-zinc-500">#{a.loan_id}</td>
                                    <td className="px-5 py-3.5 text-zinc-700">{a.due_date}</td>
                                    <td className="px-5 py-3.5 font-semibold text-zinc-800">{fmt(a.amount_to_pay)}</td>
                                    <td className="px-5 py-3.5 text-zinc-700">{fmt(a.principal_part)}</td>
                                    <td className="px-5 py-3.5 text-zinc-700">{fmt(a.interest_part)}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-semibold capitalize ${statusBadge[a.status] ?? 'bg-zinc-100 text-zinc-700'}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-zinc-500">{a.paid_at ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {amortizations.last_page > 1 && (
                    <div className="flex gap-1 justify-center flex-wrap">
                        {amortizations.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, { search, status }, { preserveState: true })}
                                className={`px-3 py-1.5 rounded-xl text-sm border transition ${
                                    link.active
                                        ? 'bg-[#2d5a27] text-white border-[#2d5a27]'
                                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                                } disabled:opacity-40`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
