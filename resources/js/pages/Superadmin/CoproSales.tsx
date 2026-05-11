import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Leaf, Plus, Trash2, ChevronDown, ChevronUp, Scale, TrendingUp, Package, Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface Sale {
    id: number;
    sale_date: string;
    kilos: number;
    price_per_kilo: number;
    gross_amount: number;
    deduction_amount: number;
    deduction_type: string | null;
    net_amount: number;
    remarks: string | null;
}

interface MemberRow {
    id: number;
    name: string;
    ytd_gross: number;
    ytd_net: number;
    ytd_kilos: number;
    sales: Sale[];
}

interface Stats {
    total_gross: number;
    total_net: number;
    total_kilos: number;
    total_transactions: number;
}

interface Props {
    members: MemberRow[];
    year: number;
    years: number[];
    stats: Stats;
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtKg = (n: number) =>
    n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';

export default function CoproSales({ members, year, years, stats }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMember, setDialogMember] = useState<MemberRow | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        sale_date: new Date().toISOString().slice(0, 10),
        kilos: '',
        price_per_kilo: '',
        deduction_amount: '',
        deduction_type: '',
        remarks: '',
    });

    const gross = parseFloat(data.kilos || '0') * parseFloat(data.price_per_kilo || '0');
    const deduction = parseFloat(data.deduction_amount || '0');
    const net = Math.max(0, gross - deduction);

    function openDialog(member: MemberRow) {
        setDialogMember(member);
        reset();
        setShowDialog(true);
    }

    function submitSale(e: React.FormEvent) {
        e.preventDefault();
        if (!dialogMember) return;
        post(`/superadmin/copra-sales/${dialogMember.id}`, {
            onSuccess: () => { setShowDialog(false); reset(); },
        });
    }

    function deleteSale(saleId: number) {
        if (!confirm('Delete this copra sale record?')) return;
        router.delete(`/superadmin/copra-sales/${saleId}`);
    }

    function changeYear(y: string) {
        router.get('/superadmin/copra-sales', { year: y }, { preserveState: true });
    }

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Head title="Copra Sales — KSCFMPC" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2d5a27]/10 flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-[#2d5a27]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-zinc-900">Copra Sales</h1>
                            <p className="text-xs text-zinc-500">Record and track member copra deliveries</p>
                        </div>
                    </div>
                    <select
                        value={year}
                        onChange={e => changeYear(e.target.value)}
                        className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Gross', value: fmt(stats.total_gross), icon: TrendingUp, color: '#2d5a27' },
                        { label: 'Total Net', value: fmt(stats.total_net), icon: Receipt, color: '#c8920a' },
                        { label: 'Total Kilos', value: fmtKg(stats.total_kilos), icon: Scale, color: '#2563eb' },
                        { label: 'Transactions', value: stats.total_transactions.toString(), icon: Package, color: '#7c3aed' },
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

                {/* Table */}
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3">
                        <Input
                            placeholder="Search members..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="max-w-xs h-8 text-sm"
                        />
                        <span className="text-xs text-zinc-400 ml-auto">{filtered.length} members</span>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Member</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">YTD Kilos</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">YTD Gross</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">YTD Net</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filtered.map(member => (
                                <>
                                    <tr key={member.id} className="hover:bg-zinc-50/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                                                    className="text-zinc-400 hover:text-zinc-600 p-0.5"
                                                >
                                                    {expandedId === member.id
                                                        ? <ChevronUp className="w-4 h-4" />
                                                        : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                                <span className="font-medium text-zinc-900">{member.name}</span>
                                                {member.sales.length > 0 && (
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                        {member.sales.length}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-700">{fmtKg(member.ytd_kilos)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-zinc-900">{fmt(member.ytd_gross)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-[#2d5a27]">{fmt(member.ytd_net)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => openDialog(member)}
                                                className="h-7 gap-1 text-xs bg-[#2d5a27] hover:bg-[#2d5a27]/90 text-white"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Record
                                            </Button>
                                        </td>
                                    </tr>

                                    {expandedId === member.id && member.sales.length > 0 && (
                                        <tr key={`${member.id}-details`}>
                                            <td colSpan={5} className="px-4 pb-3">
                                                <div className="ml-6 bg-zinc-50 rounded-lg border border-zinc-100 overflow-hidden">
                                                    <table className="w-full text-xs">
                                                        <thead className="bg-zinc-100">
                                                            <tr>
                                                                <th className="text-left px-3 py-2 font-semibold text-zinc-500">Date</th>
                                                                <th className="text-right px-3 py-2 font-semibold text-zinc-500">Kilos</th>
                                                                <th className="text-right px-3 py-2 font-semibold text-zinc-500">Price/kg</th>
                                                                <th className="text-right px-3 py-2 font-semibold text-zinc-500">Gross</th>
                                                                <th className="text-right px-3 py-2 font-semibold text-zinc-500">Deduction</th>
                                                                <th className="text-right px-3 py-2 font-semibold text-zinc-500">Net</th>
                                                                <th className="text-left px-3 py-2 font-semibold text-zinc-500">Remarks</th>
                                                                <th className="w-10"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-zinc-100">
                                                            {member.sales.map(sale => (
                                                                <tr key={sale.id} className="hover:bg-zinc-50">
                                                                    <td className="px-3 py-2 text-zinc-600">{sale.sale_date}</td>
                                                                    <td className="px-3 py-2 text-right text-zinc-600">{fmtKg(sale.kilos)}</td>
                                                                    <td className="px-3 py-2 text-right text-zinc-600">₱{sale.price_per_kilo.toFixed(2)}</td>
                                                                    <td className="px-3 py-2 text-right font-medium text-zinc-900">{fmt(sale.gross_amount)}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        {sale.deduction_amount > 0 ? (
                                                                            <span className="text-red-600">
                                                                                -{fmt(sale.deduction_amount)}
                                                                                {sale.deduction_type && (
                                                                                    <Badge variant="outline" className="ml-1 text-[9px] h-3 px-1 border-red-200 text-red-500">
                                                                                        {sale.deduction_type.replace('_', ' ')}
                                                                                    </Badge>
                                                                                )}
                                                                            </span>
                                                                        ) : '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-right font-semibold text-[#2d5a27]">{fmt(sale.net_amount)}</td>
                                                                    <td className="px-3 py-2 text-zinc-500 max-w-40 truncate">{sale.remarks || '—'}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        <button
                                                                            onClick={() => deleteSale(sale.id)}
                                                                            className="text-zinc-300 hover:text-red-500 p-0.5"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {expandedId === member.id && member.sales.length === 0 && (
                                        <tr key={`${member.id}-empty`}>
                                            <td colSpan={5} className="px-4 pb-3">
                                                <div className="ml-6 py-4 text-center text-xs text-zinc-400 bg-zinc-50 rounded-lg border border-zinc-100">
                                                    No sales recorded for {year}.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="py-12 text-center text-sm text-zinc-400">No members found.</div>
                    )}
                </div>
            </div>

            {/* Record Sale Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-[#2d5a27]" />
                            Record Copra Sale
                        </DialogTitle>
                        {dialogMember && (
                            <p className="text-sm text-zinc-500 mt-0.5">{dialogMember.name}</p>
                        )}
                    </DialogHeader>

                    <form onSubmit={submitSale} className="space-y-4 pt-2">
                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1 block">Sale Date</label>
                            <Input
                                type="date"
                                value={data.sale_date}
                                onChange={e => setData('sale_date', e.target.value)}
                                required
                            />
                            {errors.sale_date && <p className="text-xs text-red-500 mt-1">{errors.sale_date}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-zinc-600 mb-1 block">Kilograms</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={data.kilos}
                                    onChange={e => setData('kilos', e.target.value)}
                                    required
                                />
                                {errors.kilos && <p className="text-xs text-red-500 mt-1">{errors.kilos}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-zinc-600 mb-1 block">Price per Kilo (₱)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={data.price_per_kilo}
                                    onChange={e => setData('price_per_kilo', e.target.value)}
                                    required
                                />
                                {errors.price_per_kilo && <p className="text-xs text-red-500 mt-1">{errors.price_per_kilo}</p>}
                            </div>
                        </div>

                        {/* Auto-calculated Gross */}
                        {gross > 0 && (
                            <div className="bg-[#2d5a27]/5 rounded-lg px-4 py-3 flex items-center justify-between">
                                <span className="text-xs text-zinc-600">Gross Amount</span>
                                <span className="font-bold text-[#2d5a27]">{fmt(gross)}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-zinc-600 mb-1 block">Deduction (₱)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={data.deduction_amount}
                                    onChange={e => setData('deduction_amount', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-zinc-600 mb-1 block">Deduction Type</label>
                                <select
                                    value={data.deduction_type}
                                    onChange={e => setData('deduction_type', e.target.value)}
                                    className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm"
                                >
                                    <option value="">None</option>
                                    <option value="loan_payment">Loan Payment</option>
                                    <option value="savings">Savings</option>
                                    <option value="manual">Manual</option>
                                </select>
                            </div>
                        </div>

                        {/* Auto-calculated Net */}
                        {gross > 0 && (
                            <div className="bg-[#c8920a]/5 rounded-lg px-4 py-3 flex items-center justify-between">
                                <span className="text-xs text-zinc-600">Net Amount</span>
                                <span className="font-bold text-[#c8920a]">{fmt(net)}</span>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1 block">Remarks (optional)</label>
                            <Input
                                placeholder="Add remarks..."
                                value={data.remarks}
                                onChange={e => setData('remarks', e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowDialog(false)}
                                className="text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#2d5a27] hover:bg-[#2d5a27]/90 text-white text-sm"
                            >
                                {processing ? 'Saving...' : 'Record Sale'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
