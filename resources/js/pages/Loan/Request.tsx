import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Request() {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/loan/request');
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Head title="Loan Request" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#2d4734]">Loan Request</h1>
                <p className="text-zinc-500 font-medium">Create a new loan request for approval.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Loan Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.amount}
                        placeholder="Enter requested amount"
                        onChange={(e) => setData('amount', e.target.value)}
                        className={`w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all ${
                            errors.amount ? 'border-red-500 ring-1 ring-red-500' : ''
                        }`}
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount}</p>}
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
                    <h2 className="text-lg font-semibold text-zinc-900">Loan request details</h2>
                    <p className="mt-2 text-sm text-zinc-600">
                        Submit this loan request and it will be stored as a pending LoanRequest record for review with today&apos;s submission date.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-3 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-8 py-3 bg-[#2d4734] text-white rounded-xl font-bold hover:bg-[#1e3023] disabled:opacity-50 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                    >
                        {processing ? 'Submitting...' : 'Submit Loan Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
