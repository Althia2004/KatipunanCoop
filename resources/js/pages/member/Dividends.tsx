import { Head } from '@inertiajs/react';
import { BarChart3, Leaf, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import MemberLayout from '@/layouts/MemberLayout';

interface CoproSale {
    id: number;
    sale_date: string;
    kilos: number;
    price_per_kilo: number;
    gross_amount: number;
    deduction_amount: number;
    net_amount: number;
}

interface Props {
    user: { name: string; email: string };
    member: {
        name: string;
        copra_sales_ytd: number;
        patronage_amount: number;
    };
    copra_history: CoproSale[];
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtKg = (n: number) =>
    n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';

export default function MemberDividends({ user, member, copra_history }: Props) {
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? copra_history : copra_history.slice(0, 10);

    const totalGross = copra_history.reduce((s, c) => s + c.gross_amount, 0);
    const totalNet   = copra_history.reduce((s, c) => s + c.net_amount, 0);
    const totalKilos = copra_history.reduce((s, c) => s + c.kilos, 0);

    return (
        <MemberLayout user={user} title="Dividends">
            <Head title="Dividends — KSCFMPC Member Portal" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Dividends & Patronage</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">Your copra sales history and patronage refunds.</p>
                </div>

                {/* Summary */}
                <div className="grid sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Copra Sales YTD', value: fmt(member.copra_sales_ytd), icon: Leaf, color: '#2d5a27' },
                        { label: 'Patronage Amount', value: fmt(member.patronage_amount), icon: BarChart3, color: '#c8920a' },
                        { label: 'Total Kilos Sold', value: fmtKg(totalKilos), icon: Leaf, color: '#2563eb' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-zinc-500 font-medium">{card.label}</p>
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: card.color + '15' }}
                                >
                                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-zinc-900">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Copra Sales History */}
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-zinc-700">Copra Sales History</h2>
                        <div className="text-xs text-zinc-400">{copra_history.length} records</div>
                    </div>

                    {copra_history.length === 0 ? (
                        <div className="py-12 text-center">
                            <Leaf className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
                            <p className="text-sm text-zinc-400">No copra sales recorded yet.</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Date</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Kilos</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase hidden sm:table-cell">Price/kg</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Gross</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase hidden sm:table-cell">Deduction</th>
                                        <th className="text-right px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase">Net</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {visible.map(s => (
                                        <tr key={s.id} className="hover:bg-zinc-50/50">
                                            <td className="px-5 py-3 text-zinc-500 text-xs">{s.sale_date}</td>
                                            <td className="px-4 py-3 text-right text-zinc-600">{fmtKg(s.kilos)}</td>
                                            <td className="px-4 py-3 text-right text-zinc-500 hidden sm:table-cell">₱{s.price_per_kilo.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-medium text-zinc-800">{fmt(s.gross_amount)}</td>
                                            <td className="px-4 py-3 text-right text-red-500 hidden sm:table-cell">
                                                {s.deduction_amount > 0 ? `-${fmt(s.deduction_amount)}` : '—'}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-[#2d5a27]">{fmt(s.net_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {copra_history.length > 0 && (
                                    <tfoot className="bg-zinc-50 border-t border-zinc-100">
                                        <tr>
                                            <td className="px-5 py-2.5 text-xs font-semibold text-zinc-500">All-time Total</td>
                                            <td className="px-4 py-2.5 text-right text-xs font-semibold text-zinc-600">{fmtKg(totalKilos)}</td>
                                            <td className="hidden sm:table-cell" />
                                            <td className="px-4 py-2.5 text-right text-xs font-semibold text-zinc-800">{fmt(totalGross)}</td>
                                            <td className="hidden sm:table-cell" />
                                            <td className="px-5 py-2.5 text-right text-xs font-bold text-[#2d5a27]">{fmt(totalNet)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>

                            {copra_history.length > 10 && (
                                <div className="px-5 py-3 border-t border-zinc-100 text-center">
                                    <button
                                        onClick={() => setShowAll(!showAll)}
                                        className="text-xs text-[#2d5a27] font-medium hover:underline flex items-center gap-1 mx-auto"
                                    >
                                        {showAll
                                            ? <><ChevronUp className="w-3 h-3" /> Show less</>
                                            : <><ChevronDown className="w-3 h-3" /> Show all {copra_history.length} records</>}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MemberLayout>
    );
}
