import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { AlertCircle, Download, TrendingUp } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';

interface MemberRow {
    id: number;
    name: string;
    share_capital: number;
    copra_sales: number;
    patronage_amount: number;
    status: string;
    year: number;
}

interface Props {
    members: MemberRow[];
    year: number;
    totalPatronage: number;
    totalCopra: number;
    totalMembers: number;
    isReleased: boolean;
    availableYears: number[];
}

function fmt(n: number) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PatronageReports({
    members,
    year,
    totalPatronage,
    totalCopra,
    totalMembers,
    isReleased,
    availableYears,
}: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [releasing, setReleasing] = useState(false);

    const handleRelease = () => {
        setReleasing(true);
        router.post(
            '/user/patronage-reports/request-release',
            {},
            {
                onFinish: () => {
                    setReleasing(false);
                    setConfirmOpen(false);
                },
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Patronage Reports" />
            <div className="p-6 space-y-6 max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                            User Management
                        </p>
                        <h1 className="text-2xl font-bold text-[#2d5a27]">Patronage Reports</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">Annual patronage based on copra sales</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href={`/user/patronage-reports/download?year=${year}`}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#c8920a] text-white text-sm font-semibold rounded-xl hover:bg-[#a87608] transition">
                                <Download className="w-4 h-4" />
                                Download CSV
                            </button>
                        </a>
                        <button
                            onClick={() => setConfirmOpen(true)}
                            disabled={isReleased}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#234820] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Request Annual Release
                        </button>
                    </div>
                </div>

                {/* ── Info Banners ── */}
                <div className="space-y-2">
                    <div className="flex items-start gap-3 px-4 py-3 bg-[#c8920a]/10 border border-[#c8920a]/20 rounded-xl text-sm text-[#c8920a]">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Patronage is based on copra sales, not capital share size.</p>
                    </div>
                    <div className="flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-500">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Members with ₱0 copra sales receive ₱0 patronage.</p>
                    </div>
                </div>

                {/* ── Year Filter ── */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-zinc-600">Year:</label>
                    <select
                        value={year}
                        onChange={(e) => router.get('/user/patronage-reports', { year: e.target.value }, { preserveState: true })}
                        className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                    >
                        {availableYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Members',     value: totalMembers.toString() },
                        { label: 'Total Copra Sales', value: fmt(totalCopra) },
                        { label: 'Total Patronage',   value: fmt(totalPatronage) },
                    ].map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                            <p className="text-xs font-medium text-zinc-500 mb-1">{s.label}</p>
                            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                                {['Member', 'Share Capital', 'Copra Sales', 'Patronage Amount', 'Year', 'Status'].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-zinc-400 text-sm">
                                        No members found
                                    </td>
                                </tr>
                            ) : members.map((m) => (
                                <tr key={m.id} className="hover:bg-zinc-50 transition">
                                    <td className="px-5 py-3.5 font-medium text-zinc-800">{m.name}</td>
                                    <td className="px-5 py-3.5 text-zinc-700">{fmt(m.share_capital)}</td>
                                    <td className={`px-5 py-3.5 font-medium ${m.copra_sales > 0 ? 'text-zinc-700' : 'text-zinc-400'}`}>
                                        {fmt(m.copra_sales)}
                                    </td>
                                    <td className={`px-5 py-3.5 font-semibold ${m.patronage_amount > 0 ? 'text-[#2d5a27]' : 'text-zinc-400'}`}>
                                        {fmt(m.patronage_amount)}
                                    </td>
                                    <td className="px-5 py-3.5 text-zinc-700">{m.year}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-semibold capitalize ${
                                            m.status === 'released'
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

            {/* ── Confirm Release Dialog ── */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Annual Release</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to request the annual patronage release for {year}?
                            This action will be logged and submitted for approval.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => setConfirmOpen(false)}
                            disabled={releasing}
                            className="px-4 py-2 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRelease}
                            disabled={releasing}
                            className="px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#234820] transition disabled:opacity-50"
                        >
                            {releasing ? 'Submitting…' : 'Confirm Request'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
