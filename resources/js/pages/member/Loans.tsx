import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    CreditCard, ChevronDown, ChevronUp, CheckCircle2, 
    AlertCircle, Clock, Plus, Banknote, History 
} from 'lucide-react';
import MemberLayout from '@/layouts/MemberLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Amortization {
    id: number;
    due_date: string;
    amount_to_pay: number;
    principal_part: number;
    interest_part: number;
    status: string;
    total_paid: number;
}

interface LoanRow {
    id: number;
    principal_amount: number;
    term_months: number;
    interest_rate: number;
    total_payable: number;
    remaining_balance: number;
    status: string;
    created_at: string;
    amortizations: Amortization[];
}

interface LoanRequestRow {
    id: number;
    amount: number;
    purpose: string;
    status: string;
    term_months: number;
    interest_rate: number;
    rejection_reason: string | null;
    requested_at: string;
}

interface Props {
    user: { name: string; email: string };
    member: { name: string; id: number };
    loans: LoanRow[];
    loanRequests: LoanRequestRow[];
}

const fmt = (n: number | string) =>
    '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        active:    'bg-green-100 text-green-700',
        paid:      'bg-zinc-100 text-zinc-500',
        overdue:   'bg-red-100 text-red-600',
        pending:   'bg-amber-100 text-amber-700',
        rejected:  'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-zinc-100 text-zinc-600';
};

const amorStatusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle2 className="w-3 h-3 text-green-500" />;
    if (status === 'overdue') return <AlertCircle className="w-3 h-3 text-red-500" />;
    return <Clock className="w-3 h-3 text-zinc-300" />;
};

export default function Loans({ user, member, loans, loanRequests }: Props) {
    const [expandedLoan, setExpandedLoan] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const createForm = useForm({
        amount: '',
        purpose: '',
        term_months: '12',
        interest_rate: '1'
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/member/loan-requests/store', {
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            }
        });
    };

    return (
        <MemberLayout user={user} title='My Loans'>
            <Head title="My Loans" />

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">My Loans</h1>
                        <p className="text-sm text-zinc-500 font-medium">View your loan applications and active payment schedules.</p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2d5a27] text-white font-semibold text-sm rounded-xl hover:bg-[#1e3e1a] transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Apply for a Loan
                    </button>
                </div>

                {/* --- 1. Pending/Recent Applications Section --- */}
                {loanRequests.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4" /> My Applications
                        </h2>
                        <div className="grid gap-3">
                            {loanRequests.map((req) => (
                                <div key={req.id} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4 transition hover:border-zinc-300">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                            <Banknote className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-zinc-900 text-lg">{fmt(req.amount)}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusBadge(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500">
                                                {req.purpose} • {req.term_months} Months @ {req.interest_rate}%
                                            </p>
                                            {req.rejection_reason && (
                                                <p className="text-xs text-red-600 mt-1 font-medium bg-red-50 p-2 rounded-lg inline-block italic">
                                                    Note: {req.rejection_reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0">
                                        <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Requested On</p>
                                        <p className="text-sm font-semibold text-zinc-700">{req.requested_at}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- 2. Active Loans Section --- */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        {loans.length > 0 ? "Active Disbursement History" : ""}
                    </h2>

                    {loans.length === 0 && loanRequests.length === 0 ? (
                        <div className="bg-white border border-dashed border-zinc-200 rounded-3xl py-20 text-center">
                            <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Banknote className="w-10 h-10 text-zinc-300" />
                            </div>
                            <h3 className="text-zinc-900 font-semibold text-lg">No records found</h3>
                            <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
                                You don't have any active loans or pending applications at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {loans.map((loan) => {
                                const isExpanded = expandedLoan === loan.id;
                                return (
                                    <div key={loan.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                                        <div 
                                            className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:bg-zinc-50/50"
                                            onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="p-3 bg-zinc-100 rounded-xl">
                                                    <CreditCard className="w-6 h-6 text-zinc-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-zinc-900 text-lg">{fmt(loan.principal_amount)}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusBadge(loan.status)}`}>
                                                            {loan.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500">Loan ID: #{loan.id} • Issued on {loan.created_at}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:flex md:items-center gap-6 text-right">
                                                <div className="text-left md:text-right">
                                                    <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Remaining</p>
                                                    <p className="font-bold text-zinc-900">{fmt(loan.remaining_balance)}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-zinc-100 bg-zinc-50/30 p-5">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <h4 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                                                        <History className="w-4 h-4" /> Payment Schedule
                                                    </h4>
                                                    <div className="text-xs text-zinc-500">
                                                        {loan.term_months} Months @ {loan.interest_rate}% interest
                                                    </div>
                                                </div>

                                                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                                                            <tr>
                                                                <th className="px-4 py-2">Due Date</th>
                                                                <th className="px-4 py-2">Principal</th>
                                                                <th className="px-4 py-2">Interest</th>
                                                                <th className="px-4 py-2">Total Due</th>
                                                                <th className="px-4 py-2">Paid</th>
                                                                <th className="px-4 py-2 text-center">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                                            {loan.amortizations.map((a) => (
                                                                <tr key={a.id} className="hover:bg-zinc-50/80">
                                                                    <td className="px-4 py-3 font-medium">{a.due_date}</td>
                                                                    <td className="px-4 py-3">{fmt(a.principal_part)}</td>
                                                                    <td className="px-4 py-3">{fmt(a.interest_part)}</td>
                                                                    <td className="px-4 py-3 font-bold text-zinc-900">{fmt(a.amount_to_pay)}</td>
                                                                    <td className="px-4 py-3 text-emerald-600 font-medium">{a.total_paid > 0 ? fmt(a.total_paid) : '—'}</td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center justify-center gap-1.5">
                                                                            {amorStatusIcon(a.status)}
                                                                            <span className={`capitalize font-semibold ${
                                                                                a.status === 'paid' ? 'text-green-600'
                                                                                : a.status === 'overdue' ? 'text-red-500'
                                                                                : 'text-zinc-400'
                                                                            }`}>{a.status}</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Apply Loan Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#2d5a27]">New Loan Application</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Desired Amount (₱) <span className="text-red-500">*</span></Label>
                            <Input 
                                type="number" 
                                min="1000" 
                                step="100"
                                value={createForm.data.amount} 
                                onChange={e => createForm.setData('amount', e.target.value)}
                                placeholder="e.g. 10000" 
                                required
                            />
                            {Number(createForm.data.amount) > 50000 && (
                                <p className="text-xs text-[#c8920a] flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Requires Board of Directors (BOD) approval.
                                </p>
                            )}
                            {createForm.errors.amount && <p className="text-xs text-red-500">{createForm.errors.amount}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Purpose of Loan <span className="text-red-500">*</span></Label>
                            <textarea 
                                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm min-h-20 outline-none focus:ring-2 focus:ring-[#2d5a27]/30 resize-none"
                                value={createForm.data.purpose} 
                                onChange={e => createForm.setData('purpose', e.target.value)} 
                                placeholder="e.g. Hospitalization, Tuition Fees, Business Capital..."
                                required
                            />
                            {createForm.errors.purpose && <p className="text-xs text-red-500">{createForm.errors.purpose}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Preferred Term (months)</Label>
                                <select 
                                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                                    value={createForm.data.term_months} 
                                    onChange={e => createForm.setData('term_months', e.target.value)}
                                >
                                    {[3, 6, 12, 18, 24].map(m => (
                                        <option key={m} value={m}>{m} Months</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Interest Rate (%/mo)</Label>
                                <Input 
                                    type="number" 
                                    disabled 
                                    value={createForm.data.interest_rate} 
                                    className="bg-zinc-50"
                                />
                                <p className="text-[10px] text-zinc-400">Standard cooperative rate</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-700">
                            ℹ️ Your application will be reviewed by the Credit Committee. You will be notified once the status changes.
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button 
                                type="submit" 
                                size="sm" 
                                className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white" 
                                disabled={createForm.processing}
                            >
                                {createForm.processing ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MemberLayout>
    );
}