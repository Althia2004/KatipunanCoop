import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { CalendarDays, Download, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Meeting {
    id: number;
    topic: string;
    host: string;
    date: string;
    time_start: string;
    time_end: string | null;
    status: 'scheduled' | 'completed' | 'cancelled' | 'overdue';
    overview: string | null;
    is_pinned: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedMeetings {
    data: Meeting[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    meetings: PaginatedMeetings;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<Meeting['status'], string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-zinc-100 text-zinc-500',
    overdue:   'bg-red-100 text-red-600',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnnualReports({ meetings }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [flashMsg, setFlashMsg] = useState<string | null>(null);

    const form = useForm({
        topic:      '',
        host:       '',
        date:       '',
        time_start: '08:00',
        time_end:   '',
        status:     'scheduled',
        overview:   '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/superadmin/reports/annual', {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                form.reset();
                setFlashMsg('Annual meeting report created successfully.');
            },
        });
    }

    return (
        <>
            <Head title="Annual Meeting Reports" />

            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                            Reports
                        </p>
                        <h1 className="text-2xl font-bold text-[#2d5a27]">Annual Meeting Reports</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">
                            Records of general assembly meetings and resolutions.
                        </p>
                    </div>
                    <Button
                        className="shrink-0 bg-[#2d5a27] hover:bg-[#1e3e1a] text-white gap-1.5"
                        onClick={() => setDialogOpen(true)}
                    >
                        <CalendarDays className="w-4 h-4" /> New Report
                    </Button>
                </div>

                {/* Total count */}
                <p className="text-sm text-zinc-500">
                    {meetings.total} meeting{meetings.total !== 1 ? 's' : ''} recorded
                </p>

                {flashMsg && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        {flashMsg}
                        <button onClick={() => setFlashMsg(null)} className="ml-4 text-green-500 hover:text-green-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-0" />
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50">
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">#</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Topic</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Host</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Time</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Download</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {meetings.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-zinc-400 text-sm">
                                                No annual meeting reports yet.
                                            </td>
                                        </tr>
                                    )}
                                    {meetings.data.map((m, idx) => (
                                        <tr key={m.id} className="hover:bg-zinc-50 transition">
                                            <td className="px-4 py-3 text-zinc-400 text-xs">
                                                {(meetings.current_page - 1) * 10 + idx + 1}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-zinc-800 max-w-48 truncate">{m.topic}</td>
                                            <td className="px-4 py-3 text-zinc-500">{m.host}</td>
                                            <td className="px-4 py-3 text-zinc-500">{formatDate(m.date)}</td>
                                            <td className="px-4 py-3 text-zinc-400 text-xs">
                                                {m.time_start}{m.time_end ? ` – ${m.time_end}` : ''}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[m.status]}`}>
                                                    {m.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <a
                                                    href={`/superadmin/reports/annual/${m.id}/download`}
                                                    className="inline-flex items-center gap-1 text-xs text-[#2d5a27] hover:underline"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {meetings.last_page > 1 && (
                            <div className="flex gap-1 justify-center py-4 border-t border-zinc-100">
                                {meetings.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`px-3 py-1.5 rounded-xl text-sm border transition ${
                                            link.active
                                                ? 'bg-[#2d5a27] text-white border-[#2d5a27]'
                                                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                                        } disabled:opacity-40`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── New Report Dialog ── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Annual Meeting Report</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="topic">Topic / Title</Label>
                            <Input
                                id="topic"
                                placeholder="e.g. 2026 Annual General Assembly"
                                value={form.data.topic}
                                onChange={(e) => form.setData('topic', e.target.value)}
                                required
                            />
                            <InputError message={form.errors.topic} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="host">Host / Presiding Officer</Label>
                            <Input
                                id="host"
                                placeholder="e.g. Juan Dela Cruz"
                                value={form.data.host}
                                onChange={(e) => form.setData('host', e.target.value)}
                                required
                            />
                            <InputError message={form.errors.host} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="date">Date Held</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={form.data.date}
                                    onChange={(e) => form.setData('date', e.target.value)}
                                    required
                                />
                                <InputError message={form.errors.date} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
                                    required
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <InputError message={form.errors.status} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="time_start">Start Time</Label>
                                <Input
                                    id="time_start"
                                    type="time"
                                    value={form.data.time_start}
                                    onChange={(e) => form.setData('time_start', e.target.value)}
                                    required
                                />
                                <InputError message={form.errors.time_start} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="time_end">
                                    End Time <span className="text-zinc-400">(optional)</span>
                                </Label>
                                <Input
                                    id="time_end"
                                    type="time"
                                    value={form.data.time_end}
                                    onChange={(e) => form.setData('time_end', e.target.value)}
                                />
                                <InputError message={form.errors.time_end} />
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="overview">
                                Overview / Notes <span className="text-zinc-400">(optional)</span>
                            </Label>
                            <textarea
                                id="overview"
                                rows={3}
                                value={form.data.overview}
                                onChange={(e) => form.setData('overview', e.target.value)}
                                placeholder="Brief summary of the meeting…"
                                className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30"
                            />
                            <InputError message={form.errors.overview} />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setDialogOpen(false); form.reset(); }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                                disabled={form.processing}
                            >
                                {form.processing ? 'Creating…' : 'Create Report'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}