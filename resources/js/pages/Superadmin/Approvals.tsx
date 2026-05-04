import { Head } from '@inertiajs/react';
import { CheckCircle2, XCircle, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApprovalItem {
    id: number;
    type: 'Loan Approval' | 'Member Registration';
    requestedBy: string;
    date: string;
    priority: 'high' | 'medium' | 'low';
}

interface Props {
    approvals: ApprovalItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const priorityBadge = (p: string) =>
    ({
        high:   'bg-red-100 text-red-700',
        medium: 'bg-amber-100 text-amber-700',
        low:    'bg-green-100 text-green-700',
    } as Record<string, string>)[p] ?? 'bg-zinc-100 text-zinc-600';

// ── Component ─────────────────────────────────────────────────────────────────

export default function Approvals({ approvals }: Props) {
    const loanApprovals = approvals.filter((a) => a.type === 'Loan Approval');
    const regApprovals  = approvals.filter((a) => a.type === 'Member Registration');

    return (
        <>
            <Head title="Pending Approvals" />

            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                        Staff Management
                    </p>
                    <h1 className="text-2xl font-bold text-[#2d5a27]">Pending Approvals</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Review and act on escalated loan requests and member registrations.
                    </p>
                </div>

                {approvals.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-3">
                        <CheckCircle2 className="w-12 h-12 text-green-300" />
                        <p className="text-base font-medium">No pending approvals 🎉</p>
                        <p className="text-sm">Everything is up to date.</p>
                    </div>
                )}

                {/* ── Pending Loan Requests ── */}
                {loanApprovals.length > 0 && (
                    <Card className="border border-zinc-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-[#2d5a27]" />
                                <h2 className="text-base font-semibold text-zinc-900">
                                    Pending Loan Requests
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                        {loanApprovals.length}
                                    </span>
                                </h2>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50">
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Requested By</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Priority</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {loanApprovals.map((item) => (
                                            <tr key={item.id} className="hover:bg-zinc-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{item.requestedBy}</td>
                                                <td className="px-4 py-3 text-zinc-500">{item.type}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">{item.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityBadge(item.priority)}`}>
                                                        {item.priority}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm"
                                                            className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline"
                                                            className="h-7 px-3 border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1">
                                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Pending Member Registrations ── */}
                {regApprovals.length > 0 && (
                    <Card className="border border-zinc-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-[#c8920a]" />
                                <h2 className="text-base font-semibold text-zinc-900">
                                    Pending Member Registrations
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                        {regApprovals.length}
                                    </span>
                                </h2>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50">
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date Applied</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Priority</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {regApprovals.map((item) => (
                                            <tr key={item.id} className="hover:bg-zinc-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{item.requestedBy}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">{item.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityBadge(item.priority)}`}>
                                                        {item.priority}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm"
                                                            className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline"
                                                            className="h-7 px-3 border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1">
                                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
