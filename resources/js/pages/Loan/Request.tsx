import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';

const LOAN_TYPES = [
    { value: 'regular',       label: 'Regular Loan',       desc: 'General-purpose cooperative loan' },
    { value: 'emergency',     label: 'Emergency Loan',     desc: 'For urgent, unforeseen needs' },
    { value: 'educational',   label: 'Educational Loan',   desc: 'School fees and learning expenses' },
    { value: 'livelihood',    label: 'Livelihood Loan',    desc: 'Business or livelihood support' },
    { value: 'housing',       label: 'Housing Loan',       desc: 'Home improvement or construction' },
    { value: 'agricultural',  label: 'Agricultural Loan',  desc: 'Farm inputs and crop production' },
] as const;

export default function Request() {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        loan_type: '',
        purpose: '',
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
                {/* Loan Type */}
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Loan Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {LOAN_TYPES.map(lt => (
                            <button
                                key={lt.value}
                                type="button"
                                onClick={() => setData('loan_type', lt.value)}
                                className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                                    data.loan_type === lt.value
                                        ? 'border-[#2d4734] bg-[#2d4734]/5'
                                        : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                                }`}
                            >
                                <p className={`text-sm font-bold ${data.loan_type === lt.value ? 'text-[#2d4734]' : 'text-zinc-700'}`}>{lt.label}</p>
                                <p className="text-xs text-zinc-400 mt-0.5">{lt.desc}</p>
                            </button>
                        ))}
                    </div>
                    {errors.loan_type && <p className="text-red-500 text-xs mt-1 font-medium">{errors.loan_type}</p>}
                </div>

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

                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Purpose</label>
                    <textarea
                        value={data.purpose}
                        placeholder="Explain why this loan is needed"
                        onChange={(e) => setData('purpose', e.target.value)}
                        className={`w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 min-h-[120px] focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all ${
                            errors.purpose ? 'border-red-500 ring-1 ring-red-500' : ''
                        }`}
                    />
                    {errors.purpose && <p className="text-red-500 text-xs mt-1 font-medium">{errors.purpose}</p>}
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
