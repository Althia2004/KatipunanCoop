import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Banknote, Search, Filter, CheckCircle2, Clock, Users } from 'lucide-react';
import LoanRequestTable from '@/components/loan-request-table';
import { LoanRequest } from '@/types/loan-request';
import { Plus } from 'lucide-react';
import LoanRequestModal from '@/components/loan-request-modal';

interface LoanManagementProps {
    loanRequestsFromDb: LoanRequest[];
}

export default function Management({ loanRequestsFromDb }: LoanManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const filteredRequests = loanRequestsFromDb.filter((request) =>
        request.requested_by.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requested_by.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.amount.toString().includes(searchTerm)
    );

    const totalRequests = loanRequestsFromDb.length;
    const pendingCount = loanRequestsFromDb.filter((request) => request.status === 'pending').length;
    const bodCount = loanRequestsFromDb.filter((request) => request.status === 'for_bod_approval').length;
    const approvedCount = loanRequestsFromDb.filter((request) => request.status === 'approved').length;

    return (
        <>
            <Head title="Loan Requests" />

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d4734]">Loan Requests</h1>
                        <p className="text-zinc-500 font-medium">Track loan requests and approval status for the loan workflow.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#4c9f5f] text-white font-bold rounded-xl hover:bg-[#459245] transition"
                    >
                        <Plus className="w-4 h-4" /> New Request
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><Banknote /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Total Requests</p>
                                <p className="text-2xl font-bold text-zinc-900">{totalRequests}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Clock /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Pending Approval</p>
                                <p className="text-2xl font-bold text-zinc-900">{pendingCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Users /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">For BOD Review</p>
                                <p className="text-2xl font-bold text-zinc-900">{bodCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Approved</p>
                                <p className="text-2xl font-bold text-zinc-900">{approvedCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full text-zinc-900">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by requester, amount, or status..."
                            className="w-full text-zinc-900 pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#4c9f5f] focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-zinc-700 font-bold border border-zinc-200 rounded-xl hover:bg-zinc-50 transition">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>

                <LoanRequestTable loanRequests={filteredRequests} />
                <LoanRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>  
        </>
    );
}
