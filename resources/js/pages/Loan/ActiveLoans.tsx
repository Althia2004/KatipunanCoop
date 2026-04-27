import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Banknote, Search, Filter, Users, CheckCircle2 } from 'lucide-react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Loan } from '@/types/loan';

interface LoanActiveProps {
    activeLoansFromDb: Loan[];
}

export default function ActiveLoans({ activeLoansFromDb }: LoanActiveProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLoans = activeLoansFromDb.filter((loan) =>
        loan.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loan_request_id.toString().includes(searchTerm) ||
        loan.principal_amount.toString().includes(searchTerm) ||
        loan.remaining_balance.toString().includes(searchTerm)
    );

    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const totalLoans = activeLoansFromDb.length;
    const totalPrincipal = activeLoansFromDb.reduce((sum, loan) => sum + parseFloat(loan.principal_amount), 0);
    const totalRemaining = activeLoansFromDb.reduce((sum, loan) => sum + parseFloat(loan.remaining_balance), 0);

    return (
        <>
            <Head title="Loan Management" />

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d4734]">Loan Management</h1>
                        <p className="text-zinc-500 font-medium">View and track all active loans for admin and superadmin.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><Banknote /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Active Loans</p>
                                <p className="text-2xl font-bold text-zinc-900">{totalLoans}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Users /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Total Principal</p>
                                <p className="text-2xl font-bold text-zinc-900">{totalPrincipal.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><CheckCircle2 /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Remaining Balance</p>
                                <p className="text-2xl font-bold text-zinc-900">{totalRemaining.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full text-zinc-900">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search active loans by borrower, request ID, amount..."
                            className="w-full text-zinc-900 pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#4c9f5f] focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-zinc-700 font-bold border border-zinc-200 rounded-xl hover:bg-zinc-50 transition">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-3xl border border-zinc-200 shadow-sm">
                    <table className="min-w-full divide-y divide-zinc-200">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Loan ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Borrower</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Request ID</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Principal</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Remaining</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Interest</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 bg-white">
                            {filteredLoans.map((loan) => (
                                <tr key={loan.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{loan.id}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-700">
                                        <div>{loan.member.name}</div>
                                        <div className="text-xs text-zinc-500">{loan.member.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-700">{loan.loan_request_id}</td>
                                    <td className="px-6 py-4 text-sm text-right text-zinc-900">{loan.principal_amount}</td>
                                    <td className="px-6 py-4 text-sm text-right text-zinc-900">{loan.remaining_balance}</td>
                                    <td className="px-6 py-4 text-sm text-right text-zinc-900">{loan.interest_rate}%</td>
                                    <td className="px-6 py-4 text-sm text-zinc-700">{loan.status}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedLoan(loan)}
                                            className="inline-flex items-center rounded-xl bg-zinc-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 transition hover:bg-zinc-200"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredLoans.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-zinc-500">
                                        No active loans found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedLoan && (
                    <Dialog open={Boolean(selectedLoan)} onOpenChange={(open) => { if (!open) setSelectedLoan(null); }}>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Loan #{selectedLoan.id} Details</DialogTitle>
                                <DialogDescription>
                                    Detailed information for this loan and borrower.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Borrower</p>
                                        <p className="mt-3 text-lg font-semibold text-zinc-900">{selectedLoan.member.name}</p>
                                        <p className="text-sm text-zinc-500">{selectedLoan.member.email}</p>
                                    </div>
                                    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Loan Request</p>
                                        <p className="mt-3 text-lg font-semibold text-zinc-900">#{selectedLoan.loan_request_id}</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Principal Amount</p>
                                        <p className="mt-3 text-2xl font-bold text-zinc-900">₱{Number(selectedLoan.principal_amount).toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Remaining Balance</p>
                                        <p className="mt-3 text-2xl font-bold text-zinc-900">₱{Number(selectedLoan.remaining_balance).toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Interest Rate</p>
                                        <p className="mt-3 text-2xl font-bold text-zinc-900">{selectedLoan.interest_rate}%</p>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Total Payable</p>
                                    <p className="mt-3 text-xl font-semibold text-zinc-900">₱{Number(selectedLoan.total_payable).toLocaleString()}</p>
                                    <p className="mt-2 text-sm text-zinc-500">Paid so far: ₱{(Number(selectedLoan.total_payable) - Number(selectedLoan.remaining_balance)).toLocaleString()}</p>
                                </div>

                                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Status</p>
                                    <p className="mt-3 text-lg font-semibold text-zinc-900 capitalize">{selectedLoan.status.replace(/_/g, ' ')}</p>
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <button className="inline-flex justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition">
                                        Close
                                    </button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}
