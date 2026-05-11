import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ActionType = 'created' | 'updated' | 'deleted' | 'login';

interface AuditLog {
    id: number;
    action: string;
    performed_by: string;
    target: string;
    ip_address: string;
    created_at: string;
    type: ActionType;
}

interface Props {
    logs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        action?: string;
    };
}

const ACTION_BADGE: Record<ActionType, string> = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    deleted: 'bg-red-100 text-red-700',
    login:   'bg-zinc-100 text-zinc-600',
};

const ACTION_TYPES: { value: ActionType | 'all'; label: string }[] = [
    { value: 'all',     label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'login',   label: 'Login' },
];

export default function Audit({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [action, setAction] = useState(filters.action ?? 'all');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get('/superadmin/audit', { search, action }, {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(timeout);
    }, [search, action]);

    return (
        <>
            <Head title="Audit Logs" />
            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                        Audit
                    </p>
                    <h1 className="text-2xl font-bold text-[#2d5a27]">Audit Logs</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Track all system actions performed by staff and administrators.
                    </p>
                </div>

                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex gap-2 flex-1 flex-wrap">
                                <div className="relative flex-1 min-w-52">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                    <Input
                                        className="pl-8 h-8 text-sm"
                                        placeholder="Search by action, user or target…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={action}
                                    onChange={(e) => setAction(e.target.value as ActionType | 'all')}
                                    className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-700"
                                >
                                    {ACTION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-zinc-400 shrink-0">
                                {logs.total} {logs.total === 1 ? 'log' : 'logs'} total
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50">
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Action</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Performed By</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Target</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">IP Address</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-sm">
                                                <div className="flex flex-col items-center gap-2 text-zinc-400">
                                                    <ShieldCheck className="w-8 h-8 text-zinc-300" />
                                                    No audit logs found.
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-zinc-50 transition">
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ACTION_BADGE[log.type]}`}>
                                                        {log.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-zinc-700">{log.action}</td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs">{log.performed_by}</td>
                                                <td className="px-4 py-3 text-zinc-500 text-xs">{log.target}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs font-mono">{log.ip_address}</td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">{log.created_at}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {logs.last_page > 1 && (
                            <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-100">
                                <p className="text-sm text-zinc-400">
                                    Showing {logs.data.length} of {logs.total} logs
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {Array.from({ length: logs.last_page }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => router.get('/superadmin/audit', { page, search, action })}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                                                page === logs.current_page
                                                    ? 'bg-[#2d5a27] text-white'
                                                    : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}