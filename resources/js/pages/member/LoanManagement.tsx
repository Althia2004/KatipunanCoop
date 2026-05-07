import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function LoanManagement() {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        purpose: '',
        loan_term: '12',
    });

    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/loan/request', {
            onSuccess: () => {
                setSubmitted(true);
                setData({ amount: '', purpose: '', loan_term: '12' });
            },
        });
    }

    return (
        <>
            <Head title="Loan Request" />

            <div className="p-8 space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link
                        href="/member/dashboard"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg
                                   hover:bg-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d4734]">Loan Request</h1>
                        <p className="text-zinc-500 mt-1">Submit a new loan application</p>
                    </div>
                </div>

                {submitted && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                        <p className="text-emerald-800 font-medium">
                            ✓ Your loan request has been submitted successfully. We'll review it and notify you shortly.
                        </p>
                    </div>
                )}

                <div className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Loan Amount */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-900 mb-2">
                                Loan Amount (₱)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="Enter the amount you wish to borrow"
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none
                                           focus:ring-2 focus:ring-[#2d4734] focus:border-transparent"
                            />
                            {errors.amount && (
                                <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
                            )}
                        </div>

                        {/* Loan Purpose */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-900 mb-2">
                                Purpose of Loan
                            </label>
                            <textarea
                                value={data.purpose}
                                onChange={(e) => setData('purpose', e.target.value)}
                                placeholder="Explain why you need this loan"
                                rows={4}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none
                                           focus:ring-2 focus:ring-[#2d4734] focus:border-transparent resize-none"
                            />
                            {errors.purpose && (
                                <p className="text-red-600 text-sm mt-1">{errors.purpose}</p>
                            )}
                        </div>

                        {/* Loan Term */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-900 mb-2">
                                Loan Term (months)
                            </label>
                            <select
                                value={data.loan_term}
                                onChange={(e) => setData('loan_term', e.target.value)}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none
                                           focus:ring-2 focus:ring-[#2d4734] focus:border-transparent"
                            >
                                <option value="6">6 months</option>
                                <option value="12">12 months</option>
                                <option value="24">24 months</option>
                                <option value="36">36 months</option>
                            </select>
                            {errors.loan_term && (
                                <p className="text-red-600 text-sm mt-1">{errors.loan_term}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-[#2d4734] text-white rounded-lg font-semibold
                                           hover:bg-[#1e3023] transition-colors disabled:opacity-50
                                           disabled:cursor-not-allowed"
                            >
                                {processing ? 'Submitting...' : 'Submit Loan Request'}
                            </button>
                            <Link
                                href="/member/dashboard"
                                className="px-6 py-3 border border-zinc-300 text-zinc-900 rounded-lg
                                           font-semibold hover:bg-zinc-50 transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
