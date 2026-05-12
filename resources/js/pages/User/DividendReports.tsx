import { Head, router } from '@inertiajs/react';
import { AlertCircle, Banknote, BadgeCheck, Download, Rocket, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface MemberRow {
    id: number;
    name: string;
    share_capital: number;
    capital_pct: number;
    dividend_amount: number;
    status: 'tentative' | 'verified' | 'released';
    year: number;
    verified_by_name: string | null;
    verified_at: string | null;
    released_by_name: string | null;
    released_at: string | null;
}

interface Props {
    members: MemberRow[];
    year: number;
    totalCapital: number;
    totalMembers: number;
    netSurplus: number;
    dividendPool: number;
    availableYears: number[];
    canVerify: boolean;
    canRelease: boolean;
}

function fmt(n: number) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DividendReports({
    members,
    year,
    totalCapital,
    totalMembers,
    netSurplus,
    dividendPool,
    availableYears,
    canVerify,
    canRelease,
}: Props) {
    const [showReleaseDialog, setShowReleaseDialog] = useState(false);
    const [processing, setProcessing] = useState(false);

    const hasTentative = members.some((m) => m.status === 'tentative');
    const hasVerified  = members.some((m) => m.status === 'verified');
    const hasReleased  = members.some((m) => m.status === 'released');

    const yearStatus = !hasTentative && !hasVerified && hasReleased
        ? 'released'
        : !hasTentative && hasVerified
        ? 'verified'
        : 'tentative';

    const stepIndex = yearStatus === 'released' ? 2 : yearStatus === 'verified' ? 1 : 0;

    const firstVerified = members.find((m) => m.verified_by_name);
    const firstReleased = members.find((m) => m.released_by_name);

    const handleVerify = () => {
        setProcessing(true);
        router.post('/user/dividend-reports/verify', { year }, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleRelease = () => {
        setProcessing(true);
        router.post('/user/dividend-reports/release', { year }, {
            onFinish: () => {
                setProcessing(false);
                setShowReleaseDialog(false);
            },
        });
    };

    const steps = [
        {
            label: 'Computed',
            sub: 'Dividends calculated',
            Icon: Banknote,
            activeColor: 'bg-amber-500 text-white',
            activeText: 'text-amber-700',
        },
        {
            label: 'Verified',
            sub: firstVerified ? `${firstVerified.verified_by_name} · ${firstVerified.verified_at}` : 'Bookkeeper review',
            Icon: ShieldCheck,
            activeColor: 'bg-blue-600 text-white',
            activeText: 'text-blue-700',
        },
        {
            label: 'Released',
            sub: firstReleased ? `${firstReleased.released_by_name} · ${firstReleased.released_at}` : 'Final disbursement',
            Icon: Rocket,
            activeColor: 'bg-[#2d5a27] text-white',
            activeText: 'text-[#2d5a27]',
        },
    ];

    return (
        <>
            <Head title="Dividend Reports" />
            <div className="p-6 space-y-6 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                            User Management
                        </p>
                        <h1 className="text-2xl font-bold text-[#2d5a27]">Dividend Reports</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">Annual dividend distribution overview</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2d5a27]/10 text-[#2d5a27]">
                            <Banknote className="w-3.5 h-3.5" />
                            70/30 Rule
                        </span>
                        <a href={`/user/dividend-reports/download?year=${year}`}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#c8920a] text-white text-sm font-semibold rounded-xl hover:bg-[#a87608] transition">
                                <Download className="w-4 h-4" />
                                Download CSV
                            </button>
                        </a>
                    </div>
                </div>

                {/* Status Pipeline */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-5">
                        Distribution Pipeline
                    </p>

                    <div className="flex items-start">
                        {steps.map((step, i) => {
                            const done   = i < stepIndex;
                            const active = i === stepIndex;
                            const { Icon } = step;

                            const circleClass = done
                                ? 'bg-[#2d5a27] text-white'
                                : active
                                ? step.activeColor
                                : 'bg-zinc-100 text-zinc-400';

                            const labelClass = done || active ? 'text-zinc-800' : 'text-zinc-400';
                            const subClass   = done || active ? (active ? step.activeText : 'text-zinc-500') : 'text-zinc-300';

                            return (
                                <div key={i} className="flex items-start flex-1 last:flex-none">
                                    <div className="flex flex-col items-center gap-1.5 min-w-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${circleClass}`}>
                                            {done ? <BadgeCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-xs font-semibold text-center ${labelClass}`}>
                                            {step.label}
                                        </span>
                                        <span className={`text-[10px] text-center leading-tight ${subClass}`}>
                                            {step.sub}
                                        </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`flex-1 h-0.5 mt-5 mx-3 rounded-full ${i < stepIndex ? 'bg-[#2d5a27]' : 'bg-zinc-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    {(canVerify && hasTentative) || (canRelease && !hasTentative && hasVerified) ? (
                        <div className="flex gap-3 mt-6 pt-5 border-t border-zinc-100">
                            {canVerify && hasTentative && (
                                <button
                                    onClick={handleVerify}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#c8920a] text-white text-sm font-semibold rounded-xl hover:bg-[#a87608] transition disabled:opacity-60"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    {processing ? 'Processing…' : `Verify Dividends for ${year}`}
                                </button>
                            )}
                            {canRelease && !hasTentative && hasVerified && (
                                <button
                                    onClick={() => setShowReleaseDialog(true)}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#1e3d1b] transition disabled:opacity-60"
                                >
                                    <Rocket className="w-4 h-4" />
                                    {`Release Dividends for ${year}`}
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Release Confirmation Dialog */}
                {showReleaseDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                            <h2 className="text-lg font-bold text-zinc-900 mb-2">
                                Release Dividends for {year}?
                            </h2>
                            <p className="text-sm text-zinc-500 mb-6">
                                This will officially release dividends for all verified members in {year}.
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowReleaseDialog(false)}
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRelease}
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-[#2d5a27] rounded-xl hover:bg-[#1e3d1b] transition disabled:opacity-60"
                                >
                                    {processing ? 'Releasing…' : 'Yes, Release'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Banner */}
                <div className="flex items-start gap-3 px-4 py-3 bg-[#c8920a]/10 border border-[#c8920a]/20 rounded-xl text-sm text-[#c8920a]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Final dividend amounts are verified by the Bookkeeper before release. Bookkeeper manually computes to ensure accuracy.</p>
                </div>

                {/* Year Filter */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-zinc-600">Year:</label>
                    <select
                        value={year}
                        onChange={(e) => router.get('/user/dividend-reports', { year: e.target.value }, { preserveState: true })}
                        className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                    >
                        {availableYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                        <p className="text-xs font-medium text-zinc-500 mb-1">Total Capital</p>
                        <p className="text-2xl font-bold text-zinc-900">{fmt(totalCapital)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                        <p className="text-xs font-medium text-zinc-500 mb-1">Regular Members</p>
                        <p className="text-2xl font-bold text-zinc-900">{totalMembers}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                        <p className="text-xs font-medium text-zinc-500 mb-1">Net Surplus</p>
                        <p className="text-2xl font-bold text-zinc-900">{fmt(netSurplus)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                        <p className="text-xs font-medium text-zinc-500 mb-1">Dividend Pool (70%)</p>
                        <p className="text-2xl font-bold text-[#2d5a27]">{fmt(dividendPool)}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Member</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Share Capital</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Capital %</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Dividend Amount</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Year</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-zinc-400 text-sm">
                                        No regular members found for {year}
                                    </td>
                                </tr>
                            ) : members.map((m) => (
                                <tr key={m.id} className="hover:bg-zinc-50 transition">
                                    <td className="px-5 py-3.5 font-medium text-zinc-800">{m.name}</td>
                                    <td className="px-5 py-3.5 text-zinc-700">{fmt(m.share_capital)}</td>
                                    <td className="px-5 py-3.5 text-right text-zinc-700">{m.capital_pct}%</td>
                                    <td className={`px-5 py-3.5 font-semibold ${m.dividend_amount > 0 ? 'text-[#2d5a27]' : 'text-zinc-400'}`}>
                                        {fmt(m.dividend_amount)}
                                    </td>
                                    <td className="px-5 py-3.5 text-zinc-700">{m.year}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-semibold capitalize ${
                                            m.status === 'released'
                                                ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                                                : m.status === 'verified'
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'bg-amber-50 text-amber-700'
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
