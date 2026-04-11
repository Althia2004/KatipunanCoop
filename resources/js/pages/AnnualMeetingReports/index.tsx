import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    Clock,
    Users,
    Zap,
    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    Pin,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import AnnualMeetingDetailModal from '@/components/annual-meeting-detail-modal';
import type {
    AnnualMeeting,
    AnnualMeetingStats,
    ChartDataPoint,
    MeetingStatus,
} from '@/types/annual-meeting';

// ─── types ────────────────────────────────────────────────────────────────────

interface PageProps {
    meetings: AnnualMeeting[];
    stats: AnnualMeetingStats;
    chartData: ChartDataPoint[];
}

// ─── constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<MeetingStatus, string> = {
    scheduled:  'bg-blue-100 text-blue-700',
    completed:  'bg-emerald-100 text-emerald-700',
    cancelled:  'bg-zinc-100 text-zinc-500',
    overdue:    'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<MeetingStatus, string> = {
    scheduled:  'Scheduled',
    completed:  'Completed',
    cancelled:  'Cancelled',
    overdue:    'Overdue',
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatTime(t: string) {
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

// ─── stat card ───────────────────────────────────────────────────────────────

function StatCard({
    icon,
    label,
    value,
    description,
    trend,
    unit = '',
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    description: string;
    trend?: number;
    unit?: string;
}) {
    const positive = trend !== undefined && trend >= 0;
    return (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-[#3D582F]/10 text-[#3D582F]">{icon}</div>
                {trend !== undefined && (
                    <span
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                            positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                        }`}
                    >
                        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-2xl font-bold text-zinc-900">
                    {value}{unit}
                </p>
                <p className="text-sm font-medium text-zinc-500 mt-0.5">{label}</p>
            </div>
            <p className="text-xs text-zinc-400">{description}</p>
        </div>
    );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function Index({ meetings, stats, chartData }: PageProps) {
    const [openMenuId, setOpenMenuId]         = useState<number | null>(null);
    const [selectedMeeting, setSelectedMeeting] = useState<AnnualMeeting | null>(null);
    const [loadingId, setLoadingId]           = useState<number | null>(null);

    function handleView(meeting: AnnualMeeting) {
        setOpenMenuId(null);
        setLoadingId(meeting.id);
        fetch(`/reports/annual/${meeting.id}`)
            .then((r) => r.json())
            .then((data: AnnualMeeting) => {
                setSelectedMeeting(data);
                setLoadingId(null);
            });
    }

    function handlePin(meeting: AnnualMeeting) {
        setOpenMenuId(null);
        router.patch(`/reports/annual/${meeting.id}/pin`, {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Annual Meeting Reports" />

            <div className="p-8 max-w-360 mx-auto space-y-8">

                {/* ── Page Header ── */}
                <div className="border-b border-zinc-200 pb-6">
                    <h1 className="text-3xl font-bold text-[#2d4734]">Annual Meeting Reports</h1>
                    <p className="text-zinc-500 font-medium mt-1">
                        View and track all cooperative annual meetings.
                    </p>
                </div>

                {/* ── Stats + Chart Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats cards — 2×2 grid */}
                    <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                        <StatCard
                            icon={<CalendarDays className="w-5 h-5" />}
                            label="Total Meetings"
                            value={stats.total}
                            description="All recorded annual meetings"
                        />
                        <StatCard
                            icon={<Clock className="w-5 h-5" />}
                            label="Avg. Duration"
                            value={stats.avgDuration ?? '—'}
                            unit={stats.avgDuration ? ' min' : ''}
                            description="Average meeting length (completed)"
                        />
                        <StatCard
                            icon={<Users className="w-5 h-5" />}
                            label="Attendance %"
                            value={stats.attendancePct}
                            unit="%"
                            description="Completed meetings with participants"
                        />
                        <StatCard
                            icon={<Zap className="w-5 h-5" />}
                            label="Engagement %"
                            value={stats.engagementPct}
                            unit="%"
                            description="Meetings with logged action items"
                        />
                    </div>

                    {/* Line chart */}
                    <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <p className="text-sm font-semibold text-zinc-700 mb-4">
                            Meeting Frequency — Current Month
                        </p>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#71717a' }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="meetings"
                                    stroke="#459245"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: '#459245' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Meetings Table ── */}
                <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100">
                        <h2 className="text-base font-semibold text-zinc-800">All Meetings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-zinc-50 text-left text-zinc-500 text-xs uppercase tracking-wide">
                                    <th className="px-4 py-3 w-10">#</th>
                                    <th className="px-4 py-3">Meeting Topic</th>
                                    <th className="px-4 py-3">Host</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 w-14 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {meetings.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-zinc-400 italic">
                                            No meetings recorded yet.
                                        </td>
                                    </tr>
                                )}
                                {meetings.map((meeting, idx) => (
                                    <tr key={meeting.id} className="hover:bg-zinc-50 transition">
                                        <td className="px-4 py-3 text-zinc-400">{idx + 1}</td>
                                        <td className="px-4 py-3 font-medium text-zinc-800">
                                            <span className="flex items-center gap-2">
                                                {meeting.is_pinned && (
                                                    <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                                                )}
                                                {meeting.topic}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">{meeting.host}</td>
                                        <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{formatDate(meeting.date)}</td>
                                        <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{formatTime(meeting.time_start)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[meeting.status]}`}>
                                                {STATUS_LABELS[meeting.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === meeting.id ? null : meeting.id)}
                                                className="p-1.5 hover:bg-zinc-100 rounded-lg transition text-zinc-400"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>

                                            {/* Dropdown */}
                                            {openMenuId === meeting.id && (
                                                <>
                                                    {/* Click-away overlay */}
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenMenuId(null)}
                                                    />
                                                    <div className="absolute right-6 top-8 z-20 w-44 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 text-left">
                                                        <button
                                                            onClick={() => handleView(meeting)}
                                                            disabled={loadingId === meeting.id}
                                                            className="w-full px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition flex items-center gap-2"
                                                        >
                                                            {loadingId === meeting.id ? 'Loading…' : 'View'}
                                                        </button>
                                                        <button
                                                            onClick={() => handlePin(meeting)}
                                                            className="w-full px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition flex items-center gap-2"
                                                        >
                                                            <Pin className="w-3.5 h-3.5 text-amber-500" />
                                                            {meeting.is_pinned ? 'Unpin' : 'Mark as Read Later'}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Detail Modal ── */}
            {selectedMeeting && (
                <AnnualMeetingDetailModal
                    meeting={selectedMeeting}
                    onClose={() => setSelectedMeeting(null)}
                />
            )}
        </>
    );
}

Index.layout = () => ({
    breadcrumbs: [{ title: 'Annual Meeting Reports', href: '/reports/annual' }],
});
