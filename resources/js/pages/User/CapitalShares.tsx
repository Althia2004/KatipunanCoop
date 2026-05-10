// resources/js/pages/User/CapitalShares.tsx

import { PiggyBank, ReceiptText, Info, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

interface Transaction {
    id: number;
    type: 'deposit' | 'withdrawal' | 'interest_on_capital' | 'patronage_refund';
    amount: number;
    reference_number: string;
    remarks: string;
    processed_at: string;
}

interface ShareAccount {
    paid_up_balance: number;
}

export default function CapitalShares({ account, transactions }: { account: ShareAccount, transactions: Transaction[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inertia Form Helper - reference_number is now required again
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount: '',
        reference_number: '',
        remarks: '',
    });

    const formatPHP = (centavos: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(centavos / 100);
    };

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'deposit': return 'text-emerald-600 bg-emerald-50';
            case 'interest_on_capital':
            case 'patronage_refund': return 'text-blue-600 bg-blue-50';
            default: return 'text-amber-600 bg-amber-50';
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Following your project's pattern of using the direct path string
        post('/member/capital-shares', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        clearErrors();
        reset();
    };

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            {/* Action Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Capital Account</h1>
                    <p className="text-zinc-500 text-sm">Monitor your cooperative equity and share status</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Capital
                </button>
            </div>

            {/* Header section with Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-zinc-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-zinc-400 mb-6">
                            <PiggyBank className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">Total Paid-Up Capital</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tight">
                            {formatPHP(account.paid_up_balance)}
                        </h1>
                        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full text-xs font-medium text-zinc-300">
                            <Info className="w-3.5 h-3.5" />
                            Verified Cooperative Equity
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-zinc-800 rounded-full opacity-50 blur-3xl" />
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 flex flex-col justify-center shadow-sm">
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Shares Owned</p>
                    <p className="text-4xl font-black text-zinc-900 mt-2">
                        {(account.paid_up_balance / 10000).toFixed(0)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-2 italic">Based on ₱100.00 par value</p>
                </div>
            </div>

            {/* Transaction Ledger */}
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-zinc-100">
                    <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                        <ReceiptText className="w-5 h-5 text-zinc-400" />
                        Ledger History
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50/50 text-zinc-500 font-bold border-b border-zinc-100">
                            <tr>
                                <th className="px-8 py-4 uppercase tracking-tighter text-[10px]">Processing Date</th>
                                <th className="px-8 py-4 uppercase tracking-tighter text-[10px]">Description</th>
                                <th className="px-8 py-4 uppercase tracking-tighter text-[10px]">Reference / OR</th>
                                <th className="px-8 py-4 uppercase tracking-tighter text-[10px] text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-zinc-400 italic">
                                        No transactions found for this account.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-8 py-5 text-zinc-500 font-medium">
                                            {new Date(tx.processed_at).toLocaleDateString('en-PH', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(tx.type)}`}>
                                                {tx.type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-mono text-xs text-zinc-400">
                                            {tx.reference_number || '---'}
                                        </td>
                                        <td className={`px-8 py-5 text-right font-bold text-base ${tx.type === 'withdrawal' ? 'text-zinc-900' : 'text-emerald-600'}`}>
                                            {tx.type === 'withdrawal' ? '-' : '+'} {formatPHP(tx.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Capital Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                            <h2 className="text-xl font-bold text-zinc-900">Add Capital Share</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1.5">Amount (PHP)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className={`w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-4 text-lg font-bold focus:ring-zinc-900 focus:border-zinc-900 transition-all ${
                                        errors.amount ? 'border-red-500 ring-1 ring-red-500' : ''
                                    }`}
                                    placeholder="0.00"
                                    autoFocus
                                />
                                {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1.5">OR / Reference Number</label>
                                <input
                                    type="text"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    className={`w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 font-medium focus:ring-zinc-900 focus:border-zinc-900 transition-all ${
                                        errors.reference_number ? 'border-red-500 ring-1 ring-red-500' : ''
                                    }`}
                                    placeholder="Enter Receipt or Ref No."
                                />
                                {errors.reference_number && <p className="text-red-500 text-xs mt-1 font-medium">{errors.reference_number}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1.5">Remarks (Optional)</label>
                                <textarea
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    className="w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 min-h-[100px] focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                                    placeholder="e.g. Bank transfer, Cash payment..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-zinc-200"
                                >
                                    {processing ? 'Processing...' : 'Confirm Deposit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}