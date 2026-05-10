import { Banknote, Calendar, OctagonX } from 'lucide-react'; // Added OctagonX for rejection style
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { LoanRequest } from '@/types/loan-request';

interface LoanRequestTableProps {
    loanRequests: LoanRequest[];
}

const LOAN_STATUS_STEPS = [
    { status: 'pending', label: 'Pending' },
    { status: 'for_bod_approval', label: 'For BOD Approval' },
    { status: 'approved', label: 'Approved' },
] as const;

export default function LoanRequestTable({ loanRequests }: LoanRequestTableProps) {
    const { auth } = usePage().props as {
        auth: {
            user?: {
                role?: string;
            };
        };
    };

    const isSuperadmin = auth?.user?.role === 'superadmin';
    
    // --- STATE ---
    const [activeRequest, setActiveRequest] = useState<LoanRequest | null>(null);
    const [editedInterestRate, setEditedInterestRate] = useState<string | number>(0);

    // --- HANDLERS ---
    const handleViewRequest = (request: LoanRequest) => {
        setActiveRequest(request);
        setEditedInterestRate(request.interest_rate);
    };

    const handleReject = (id: number) => {
        if (confirm('Are you sure you want to reject this loan request? This action cannot be undone.')) {
            router.patch(`/loan/request/${id}/reject`, {}, {
                preserveScroll: true,
                onSuccess: () => setActiveRequest(null),
            });
        }
    };

    const formatPHP = (amount: number | string) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(Number(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const badgeClass = (status: LoanRequest['status']) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700';
            case 'for_bod_approval': return 'bg-blue-100 text-blue-700';
            case 'rejected': return 'bg-red-100 text-red-700'; // Added rejection color
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                    <tr>
                        <th className="px-6 py-4">REQUEST</th>
                        <th className="px-6 py-4">REQUESTED BY</th>
                        <th className="px-6 py-4">REQUESTED AT</th>
                        <th className="px-6 py-4">STATUS</th>
                        <th className="px-6 py-4 text-right">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {loanRequests.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                <div className="flex flex-col items-center gap-2">
                                    <Banknote className="w-8 h-8 text-zinc-300" />
                                    <p className="font-medium">No loan requests available yet.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        loanRequests.map((request) => (
                            <tr key={request.id} className="hover:bg-zinc-50/70 transition group">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-zinc-900">{formatPHP(request.amount)}</p>
                                    <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
                                        <Banknote className="w-3.5 h-3.5" />
                                        <span className="text-xs">Request #{request.id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-500">
                                    <div className="font-semibold text-zinc-900">{request.requested_by.name}</div>
                                    <div className="text-xs">{request.requested_by.email}</div>
                                </td>
                                <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                        {formatDate(request.requested_at)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass(request.status)}`}>
                                        {request.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleViewRequest(request)}
                                        className="inline-flex items-center rounded-xl bg-zinc-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 transition hover:bg-zinc-200"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {activeRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setActiveRequest(null)}>
                    <div className="w-full max-w-3xl rounded-3xl overflow-hidden bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50 p-6">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Loan Request Details</p>
                                <h2 className="mt-3 text-2xl font-bold text-zinc-900">Request #{activeRequest.id}</h2>
                                <p className="mt-1 text-sm text-zinc-500">Submitted by {activeRequest.requested_by.name}</p>
                            </div>
                            <button onClick={() => setActiveRequest(null)} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold uppercase text-zinc-500 hover:bg-zinc-100">Close</button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Rejected State Banner */}
                            {activeRequest.status === 'rejected' && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700">
                                    <OctagonX className="w-5 h-5" />
                                    <p className="text-sm font-bold uppercase tracking-wider">This request has been rejected.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Amount</p>
                                    <p className="mt-3 text-3xl font-bold text-zinc-900">{formatPHP(activeRequest.amount)}</p>
                                </div>
                                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Requested At</p>
                                    <p className="mt-3 text-xl font-semibold text-zinc-900">{formatDate(activeRequest.requested_at)}</p>
                                </div>
                            </div>

                            {/* Status Stepper - Only show if not rejected */}
                            {activeRequest.status !== 'rejected' && (
                                <div className="rounded-3xl border border-zinc-200 bg-white p-6">
                                    <div className="flex items-center justify-between gap-4 mb-6">
                                        <p className="text-sm font-bold text-zinc-900">Approval Journey</p>
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.24em] ${badgeClass(activeRequest.status)}`}>
                                            {activeRequest.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-x-0 top-5 h-0.5 bg-zinc-200" />
                                        <div 
                                            className="absolute left-0 top-5 h-0.5 bg-emerald-600 transition-all" 
                                            style={{ width: `${(LOAN_STATUS_STEPS.findIndex(s => s.status === activeRequest.status) / (LOAN_STATUS_STEPS.length - 1)) * 100}%` }}
                                        />
                                        <div className="relative flex justify-between">
                                            {LOAN_STATUS_STEPS.map((step, idx) => {
                                                const activeIdx = LOAN_STATUS_STEPS.findIndex(s => s.status === activeRequest.status);
                                                const done = idx <= activeIdx;
                                                return (
                                                    <div key={step.status} className="flex flex-col items-center">
                                                        <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${done ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-zinc-200 text-zinc-400'}`}>
                                                            {done ? '✓' : idx + 1}
                                                        </div>
                                                        <p className={`mt-2 text-xs font-bold ${done ? 'text-zinc-900' : 'text-zinc-400'}`}>{step.label}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Term (Months)</p>
                                    <p className="mt-3 text-xl font-semibold text-zinc-900">{activeRequest.term_months} Months</p>
                                </div>
                                
                                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Interest Rate</p>
                                    {isSuperadmin && activeRequest.status === 'pending' ? (
                                        <div className="mt-3 flex items-center gap-2">
                                            <input 
                                                type="number"
                                                step="0.01"
                                                value={editedInterestRate}
                                                onChange={(e) => setEditedInterestRate(e.target.value)}
                                                className="w-24 rounded-xl border border-zinc-300 p-2 text-xl font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <span className="text-xl font-bold text-zinc-900">%</span>
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-xl font-semibold text-zinc-900">{activeRequest.interest_rate}%</p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Purpose</p>
                                <p className="mt-3 text-sm leading-7 text-zinc-900">{activeRequest.purpose || 'No purpose provided.'}</p>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center border-t border-zinc-100 pt-6">
                                {/* Only Superadmin sees Reject button for Pending or BOD Approval requests */}
                                {isSuperadmin && (activeRequest.status === 'pending' || activeRequest.status === 'for_bod_approval') && (
                                    <button
                                        type="button"
                                        onClick={() => handleReject(activeRequest.id)}
                                        className="mr-auto px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                                    >
                                        Reject Request
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => setActiveRequest(null)}
                                    className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-700 transition"
                                >
                                    Cancel
                                </button>

                                {isSuperadmin && activeRequest.status === 'pending' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            router.patch(
                                                `/loan/request/${activeRequest.id}/approve`,
                                                { interest_rate: editedInterestRate },
                                                { 
                                                    preserveScroll: true,
                                                    onSuccess: () => setActiveRequest(null) 
                                                }
                                            );
                                        }}
                                        className={`rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition ${Number(activeRequest.amount) <= 50000 ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-sky-600 hover:bg-sky-700 shadow-sky-200'}`}
                                    >
                                        {Number(activeRequest.amount) <= 50000 ? 'Approve Loan' : 'Move to BOD Approval'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}