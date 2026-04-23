import { Banknote, Calendar, Users } from 'lucide-react';
import { LoanRequest } from '@/types/loan-request';

interface LoanRequestTableProps {
    loanRequests: LoanRequest[];
}

export default function LoanRequestTable({ loanRequests }: LoanRequestTableProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const badgeClass = (status: LoanRequest['status']) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-700';
            case 'for_bod_approval':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-amber-100 text-amber-700';
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
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {loanRequests.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
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
                                    <p className="font-bold text-zinc-900">₱{Number(request.amount).toLocaleString()}</p>
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
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
