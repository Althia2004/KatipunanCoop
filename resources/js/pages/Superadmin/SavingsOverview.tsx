import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    PiggyBank, TrendingUp, Users, Coins,
    Plus, Minus, History, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface MemberRow {
    id: number;
    name: string;
    savings_balance: number;
    share_capital: number;
}

interface Stats {
    total_savings: number;
    total_capital: number;
    total_members: number;
}

interface Props {
    members: MemberRow[];
    stats: Stats;
}

type ModalType = 'deposit' | 'withdraw' | 'capital' | 'history' | null;

interface HistoryEntry {
    id: number;
    type: string;
    amount: number;
    balance_after: number;
    remarks: string | null;
    recorded_by: string;
    created_at: string;
}

interface HistoryData {
    member_name: string;
    savings_balance: number;
    share_capital: number;
    savings: HistoryEntry[];
    capital: HistoryEntry[];
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SavingsOverview({ members, stats }: Props) {
    const [search, setSearch] = useState('');
    const [modalType, setModalType] = useState<ModalType>(null);
    const [activeMember, setActiveMember] = useState<MemberRow | null>(null);
    const [historyData, setHistoryData] = useState<HistoryData | null>(null);
    const [historyTab, setHistoryTab] = useState<'savings' | 'capital'>('savings');
    const [historyLoading, setHistoryLoading] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        type: 'credit',
        remarks: '',
    });

    function openModal(type: ModalType, member: MemberRow) {
        setActiveMember(member);
        setModalType(type);
        reset();
        if (type === 'history') loadHistory(member.id);
    }

    function closeModal() {
        setModalType(null);
        setActiveMember(null);
        setHistoryData(null);
        reset();
    }

    async function loadHistory(memberId: number) {
        setHistoryLoading(true);
        try {
            const resp = await fetch(`/superadmin/savings/${memberId}/history`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const json = await resp.json();
            setHistoryData(json);
        } finally {
            setHistoryLoading(false);
        }
    }

    function submitAction(e: React.FormEvent) {
        e.preventDefault();
        if (!activeMember || !modalType) return;
        const urls: Record<string, string> = {
            deposit: `/superadmin/savings/${activeMember.id}/deposit`,
            withdraw: `/superadmin/savings/${activeMember.id}/withdraw`,
            capital: `/superadmin/savings/${activeMember.id}/capital-adjust`,
        };
        post(urls[modalType], {
            onSuccess: closeModal,
        });
    }

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    const modalTitle = modalType === 'deposit' ? 'Deposit to Savings'
        : modalType === 'withdraw' ? 'Withdraw from Savings'
        : modalType === 'capital' ? 'Adjust Capital Share'
        : 'Transaction History';

    return (
        <>
            <Head title="Savings & Capital — KSCFMPC" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2d5a27]/10 flex items-center justify-center">
                        <PiggyBank className="w-5 h-5 text-[#2d5a27]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">Savings & Capital</h1>
                        <p className="text-xs text-zinc-500">Manage member savings and capital share</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Savings', value: fmt(stats.total_savings), icon: PiggyBank, color: '#2d5a27' },
                        { label: 'Total Capital', value: fmt(stats.total_capital), icon: TrendingUp, color: '#c8920a' },
                        { label: 'Active Members', value: stats.total_members.toString(), icon: Users, color: '#2563eb' },
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
                                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Savings Balance</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Capital Share</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-48">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filtered.map(member => (
                                <tr key={member.id} className="hover:bg-zinc-50/50">
                                    <td className="px-4 py-3 font-medium text-zinc-900">{member.name}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-[#2d5a27]">{fmt(member.savings_balance)}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-[#c8920a]">{fmt(member.share_capital)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button
                                                size="sm"
                                                onClick={() => openModal('deposit', member)}
                                                className="h-7 gap-1 text-xs bg-[#2d5a27] hover:bg-[#2d5a27]/90 text-white"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Deposit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openModal('withdraw', member)}
                                                className="h-7 gap-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                            >
                                                <Minus className="w-3 h-3" />
                                                Withdraw
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openModal('capital', member)}
                                                className="h-7 gap-1 text-xs border-[#c8920a]/30 text-[#c8920a] hover:bg-[#c8920a]/5"
                                            >
                                                <Coins className="w-3 h-3" />
                                                Capital
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openModal('history', member)}
                                                className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700"
                                            >
                                                <History className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="py-12 text-center text-sm text-zinc-400">No members found.</div>
                    )}
                </div>
            </div>

            {/* Deposit / Withdraw / Capital Dialog */}
            <Dialog open={modalType !== null && modalType !== 'history'} onOpenChange={open => !open && closeModal()}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {modalType === 'deposit' && <Plus className="w-4 h-4 text-[#2d5a27]" />}
                            {modalType === 'withdraw' && <Minus className="w-4 h-4 text-red-500" />}
                            {modalType === 'capital' && <Coins className="w-4 h-4 text-[#c8920a]" />}
                            {modalTitle}
                        </DialogTitle>
                        {activeMember && (
                            <p className="text-sm text-zinc-500">{activeMember.name}</p>
                        )}
                    </DialogHeader>

                    <form onSubmit={submitAction} className="space-y-4 pt-2">
                        {activeMember && modalType === 'deposit' && (
                            <div className="bg-zinc-50 rounded-lg px-4 py-2 text-xs text-zinc-500">
                                Current savings: <span className="font-semibold text-zinc-900">{fmt(activeMember.savings_balance)}</span>
                            </div>
                        )}
                        {activeMember && modalType === 'withdraw' && (
                            <div className="bg-zinc-50 rounded-lg px-4 py-2 text-xs text-zinc-500">
                                Available balance: <span className="font-semibold text-zinc-900">{fmt(activeMember.savings_balance)}</span>
                            </div>
                        )}
                        {activeMember && modalType === 'capital' && (
                            <div className="bg-zinc-50 rounded-lg px-4 py-2 text-xs text-zinc-500">
                                Current capital: <span className="font-semibold text-zinc-900">{fmt(activeMember.share_capital)}</span>
                            </div>
                        )}

                        {modalType === 'capital' && (
                            <div>
                                <label className="text-xs font-medium text-zinc-600 mb-1 block">Adjustment Type</label>
                                <select
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm"
                                >
                                    <option value="credit">Credit (Add)</option>
                                    <option value="debit">Debit (Deduct)</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1 block">Amount (₱)</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                                required
                            />
                            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1 block">Remarks (optional)</label>
                            <Input
                                placeholder="Add remarks..."
                                value={data.remarks}
                                onChange={e => setData('remarks', e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={closeModal} className="text-sm">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className={
                                    modalType === 'withdraw'
                                        ? 'bg-red-600 hover:bg-red-700 text-white text-sm'
                                        : modalType === 'capital'
                                        ? 'bg-[#c8920a] hover:bg-[#c8920a]/90 text-white text-sm'
                                        : 'bg-[#2d5a27] hover:bg-[#2d5a27]/90 text-white text-sm'
                                }
                            >
                                {processing ? 'Saving...' : 'Confirm'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={modalType === 'history'} onOpenChange={open => !open && closeModal()}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                                <History className="w-4 h-4 text-zinc-600" />
                                Transaction History
                            </DialogTitle>
                        </div>
                        {historyData && (
                            <p className="text-sm text-zinc-500">{historyData.member_name}</p>
                        )}
                    </DialogHeader>

                    {historyLoading && (
                        <div className="flex-1 flex items-center justify-center py-12">
                            <div className="text-sm text-zinc-400">Loading...</div>
                        </div>
                    )}

                    {!historyLoading && historyData && (
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {/* Balance summary */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#2d5a27]/5 rounded-lg px-4 py-3">
                                    <p className="text-xs text-zinc-500 mb-0.5">Savings Balance</p>
                                    <p className="font-bold text-[#2d5a27]">{fmt(historyData.savings_balance)}</p>
                                </div>
                                <div className="bg-[#c8920a]/5 rounded-lg px-4 py-3">
                                    <p className="text-xs text-zinc-500 mb-0.5">Capital Share</p>
                                    <p className="font-bold text-[#c8920a]">{fmt(historyData.share_capital)}</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 border-b border-zinc-100">
                                {(['savings', 'capital'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setHistoryTab(tab)}
                                        className={`px-4 py-2 text-sm font-medium transition-colors capitalize border-b-2 -mb-px ${
                                            historyTab === tab
                                                ? 'border-[#2d5a27] text-[#2d5a27]'
                                                : 'border-transparent text-zinc-500 hover:text-zinc-700'
                                        }`}
                                    >
                                        {tab === 'savings' ? 'Savings' : 'Capital Share'}
                                    </button>
                                ))}
                            </div>

                            {/* Transaction list */}
                            {(historyTab === 'savings' ? historyData.savings : historyData.capital).length === 0 ? (
                                <div className="py-8 text-center text-sm text-zinc-400">No transactions yet.</div>
                            ) : (
                                <table className="w-full text-xs">
                                    <thead className="bg-zinc-50">
                                        <tr>
                                            <th className="text-left px-3 py-2 font-semibold text-zinc-500">Date</th>
                                            <th className="text-left px-3 py-2 font-semibold text-zinc-500">Type</th>
                                            <th className="text-right px-3 py-2 font-semibold text-zinc-500">Amount</th>
                                            <th className="text-right px-3 py-2 font-semibold text-zinc-500">Balance After</th>
                                            <th className="text-left px-3 py-2 font-semibold text-zinc-500">Remarks</th>
                                            <th className="text-left px-3 py-2 font-semibold text-zinc-500">Recorded By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {(historyTab === 'savings' ? historyData.savings : historyData.capital).map(t => (
                                            <tr key={t.id} className="hover:bg-zinc-50">
                                                <td className="px-3 py-2 text-zinc-500">{t.created_at}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                                        t.type === 'deposit' || t.type === 'credit'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-600'
                                                    }`}>
                                                        {t.type === 'deposit' || t.type === 'credit' ? '+' : '-'} {t.type}
                                                    </span>
                                                </td>
                                                <td className={`px-3 py-2 text-right font-semibold ${
                                                    t.type === 'deposit' || t.type === 'credit'
                                                        ? 'text-green-600'
                                                        : 'text-red-500'
                                                }`}>
                                                    {t.type === 'deposit' || t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}
                                                </td>
                                                <td className="px-3 py-2 text-right text-zinc-700">{fmt(t.balance_after)}</td>
                                                <td className="px-3 py-2 text-zinc-500 max-w-30 truncate">{t.remarks || '—'}</td>
                                                <td className="px-3 py-2 text-zinc-500">{t.recorded_by}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
