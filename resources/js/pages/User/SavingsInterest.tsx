import { Head, router } from '@inertiajs/react';
import { AlertCircle, Download, Scale } from 'lucide-react';

interface MemberRow {
    id: number;
    name: string;
    savings_balance: number;
    share_capital: number;
    interest_earned: number;
    year: number;
    status: string;
}

interface Props {
    members: MemberRow[];
    year: number;
    caRate: number;
    totalMembers: number;
    totalSavings: number;
    totalInterest: number;
    availableYears: number[];
}

function fmt(n: number) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SavingsInterest({
    members,
    year,
    caRate,
    totalMembers,
    totalSavings,
    totalInterest,
    availableYears,
}: Props) {
    return (
        <>
            <Head title="Savings Interest" />
            <div className="p-6 space-y-6 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                            User Management
                        </p>
                        <h1 className="text-2xl font-bold text-[#2d5a27]">Savings Interest</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">Annual CA interest applied per cooperative policy</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2d5a27]/10 text-[#2d5a27]">
                            <Scale className="w-3.5 h-3.5" />
                            CA Rate: {caRate}%
                        </span>
                        <a href={`/user/savings-interest/download?year=${year}`}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#c8920a] text-white text-sm font-semibold rounded-xl hover:bg-[#a87608] transition">
                                <Download className="w-4 h-4" />
                                Download CSV
                            </button>
                        </a>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-3 px-4 py-3 bg-[#c8920a]/10 border border-[#c8920a]/20 rounded-xl text-sm text-[#c8920a]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>CA Interest Rate: <strong>{caRate}%</strong> — Applied annually per cooperative policy</p>
                </div>

                {/* Year Filter */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-zinc-600">Year:</label>
                    <select
                        value={year}
                        onChange={(e) => router.get('/user/savings-interest', { year: e.target.value }, { preserveState: true })}
                        className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                    >
                        {availableYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Members',         value: totalMembers.toString() },
                        { label: 'Total Savings',         value: fmt(totalSavings) },
                        { label: 'Total Interest Earned', value: fmt(totalInterest) },
                    ].map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                            <p className="text-xs font-medium text-zinc-500 mb-1">{s.label}</p>
                            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                                {['Member', 'Savings Balance', 'Interest Rate', 'Interest Earned', 'Status'].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-zinc-400 text-sm">
                                        No members found
                                    </td>
                                </tr>
                            ) : members.map((m) => (
                                <tr key={m.id} className="hover:bg-zinc-50 transition">
                                    <td className="px-5 py-3.5 font-medium text-zinc-800">{m.name}</td>
                                    <td className="px-5 py-3.5 text-zinc-700">{fmt(m.savings_balance)}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-semibold bg-[#2d5a27]/10 text-[#2d5a27]">
                                            {caRate}%
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-[#2d5a27]">
                                        {fmt(m.interest_earned)}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-semibold capitalize ${
                                            m.status === 'active' || m.status === 'approved'
                                                ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                                : 'bg-[#c8920a]/10 text-[#c8920a]'
                                        }`}>
                                            {m.status}
                                        </span>
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