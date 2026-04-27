import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import type { FormEvent } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoanRequestModal({ isOpen, onClose }: ModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        purpose: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/loan/request', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                    <h2 className="text-xl font-bold text-[#2d4734]">New Loan Request</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1.5">Loan Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className={`w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all ${
                                errors.amount ? 'border-red-500 ring-1 ring-red-500' : ''
                            }`}
                            placeholder="0.00"
                        />
                        {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1.5">Purpose</label>
                        <textarea
                            value={data.purpose}
                            onChange={(e) => setData('purpose', e.target.value)}
                            className={`w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 min-h-[100px] focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all ${
                                errors.purpose ? 'border-red-500 ring-1 ring-red-500' : ''
                            }`}
                            placeholder="Explain why you need this loan..."
                        />
                        {errors.purpose && <p className="text-red-500 text-xs mt-1 font-medium">{errors.purpose}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-[#2d4734] text-white rounded-xl font-bold hover:bg-[#1e3023] disabled:opacity-50 transition-all active:scale-95"
                        >
                            {processing ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}