import { useState } from 'react';
import { X, Printer, Users, CheckSquare, ArrowRight, Lightbulb, AlertTriangle } from 'lucide-react';
import type { AnnualMeeting, MeetingStatus } from '@/types/annual-meeting';

// ─── helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

function formatTime(t: string | null) {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

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

type Tab = 'overview' | 'keypoints' | 'actionitems' | 'nextsteps' | 'participants';

// ─── component ───────────────────────────────────────────────────────────────

interface Props {
    meeting: AnnualMeeting;
    onClose: () => void;
}

export default function AnnualMeetingDetailModal({ meeting, onClose }: Props) {
    const [tab, setTab] = useState<Tab>('overview');

    const discussionPoints = (meeting.key_points ?? []).filter((k) => k.type === 'discussion_point');
    const challenges       = (meeting.key_points ?? []).filter((k) => k.type === 'challenge');

    function handlePrint() {
        window.print();
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'overview',     label: 'Overview' },
        { key: 'keypoints',    label: 'Key Points' },
        { key: 'actionitems',  label: 'Action Items' },
        { key: 'nextsteps',    label: 'Next Steps' },
        { key: 'participants', label: 'Participants' },
    ];

    return (
        <>
            {/* ── Print stylesheet injected inline ── */}
            <style>{`
                @media print {
                    body > *:not(#print-target) { display: none !important; }
                    #print-target { display: block !important; position: static !important; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                }
                .print-only { display: none; }
            `}</style>

            {/* ── Backdrop ── */}
            <div
                className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                    {/* ── Modal Header ── */}
                    <div className="flex items-start justify-between gap-4 p-6 border-b border-zinc-100">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-[#2d4734] truncate">{meeting.topic}</h2>
                            <p className="text-sm text-zinc-500 mt-0.5">
                                {formatDate(meeting.date)} &bull; {formatTime(meeting.time_start)}
                                {meeting.time_end ? ` – ${formatTime(meeting.time_end)}` : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[meeting.status]}`}>
                                {STATUS_LABELS[meeting.status]}
                            </span>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-100 rounded-full transition text-zinc-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="no-print flex border-b border-zinc-100 px-6 overflow-x-auto shrink-0">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                                    tab === t.key
                                        ? 'border-[#459245] text-[#3D582F]'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-700'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab Content ── */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">

                        {/* Overview */}
                        {tab === 'overview' && (
                            <div>
                                <p className="text-sm text-zinc-500 uppercase font-semibold mb-2 tracking-wide">Meeting Overview</p>
                                {meeting.overview
                                    ? <p className="text-zinc-700 leading-relaxed">{meeting.overview}</p>
                                    : <p className="text-zinc-400 italic">No overview provided.</p>
                                }
                                <div className="mt-4 pt-4 border-t border-zinc-100 text-sm text-zinc-500">
                                    <span className="font-medium text-zinc-700">Host:</span> {meeting.host}
                                </div>
                            </div>
                        )}

                        {/* Key Points */}
                        {tab === 'keypoints' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Discussion Points */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        <p className="text-sm font-semibold text-zinc-700">Project Progress / Discussion Points</p>
                                    </div>
                                    {discussionPoints.length > 0
                                        ? <ul className="space-y-2">
                                            {discussionPoints.map((kp) => (
                                                <li key={kp.id} className="flex gap-2 text-sm text-zinc-600">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                                    {kp.content}
                                                </li>
                                            ))}
                                          </ul>
                                        : <p className="text-zinc-400 italic text-sm">None recorded.</p>
                                    }
                                </div>
                                {/* Challenges */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                        <p className="text-sm font-semibold text-zinc-700">Challenges Faced</p>
                                    </div>
                                    {challenges.length > 0
                                        ? <ul className="space-y-2">
                                            {challenges.map((kp) => (
                                                <li key={kp.id} className="flex gap-2 text-sm text-zinc-600">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                                    {kp.content}
                                                </li>
                                            ))}
                                          </ul>
                                        : <p className="text-zinc-400 italic text-sm">None recorded.</p>
                                    }
                                </div>
                            </div>
                        )}

                        {/* Action Items */}
                        {tab === 'actionitems' && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckSquare className="w-4 h-4 text-[#459245]" />
                                    <p className="text-sm font-semibold text-zinc-700">Action Items</p>
                                </div>
                                {(meeting.action_items ?? []).length > 0
                                    ? <ul className="space-y-3">
                                        {(meeting.action_items ?? []).map((item) => (
                                            <li key={item.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                                                <div className="w-8 h-8 rounded-full bg-[#3D582F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                    {initials(item.assignee_name)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-zinc-500">{item.assignee_name}</p>
                                                    <p className="text-sm text-zinc-700">{item.task}</p>
                                                </div>
                                            </li>
                                        ))}
                                      </ul>
                                    : <p className="text-zinc-400 italic text-sm">No action items recorded.</p>
                                }
                            </div>
                        )}

                        {/* Next Steps */}
                        {tab === 'nextsteps' && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ArrowRight className="w-4 h-4 text-blue-500" />
                                    <p className="text-sm font-semibold text-zinc-700">Next Steps</p>
                                </div>
                                {(meeting.next_steps ?? []).length > 0
                                    ? <ul className="space-y-2">
                                        {(meeting.next_steps ?? []).map((ns) => (
                                            <li key={ns.id} className="flex gap-2 text-sm text-zinc-600">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                                {ns.content}
                                            </li>
                                        ))}
                                      </ul>
                                    : <p className="text-zinc-400 italic text-sm">No next steps recorded.</p>
                                }
                            </div>
                        )}

                        {/* Participants */}
                        {tab === 'participants' && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Users className="w-4 h-4 text-[#459245]" />
                                    <p className="text-sm font-semibold text-zinc-700">
                                        Participants ({(meeting.participants ?? []).length})
                                    </p>
                                </div>
                                {(meeting.participants ?? []).length > 0
                                    ? <ul className="space-y-2">
                                        {(meeting.participants ?? []).map((p) => (
                                            <li key={p.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                                                <div className="w-9 h-9 rounded-full bg-[#3D582F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                    {initials(p.name)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-zinc-800">{p.name}</p>
                                                    <p className="text-xs text-zinc-500">{p.role}</p>
                                                </div>
                                            </li>
                                        ))}
                                      </ul>
                                    : <p className="text-zinc-400 italic text-sm">No participants recorded.</p>
                                }
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="no-print flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-[#3D582F] text-white text-sm font-semibold rounded-xl hover:bg-[#459245] transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Printable version (hidden on screen, shown on print) ── */}
            <div id="print-target" className="print-only p-8 text-sm text-black">
                <h1 className="text-2xl font-bold mb-1">{meeting.topic}</h1>
                <p className="text-zinc-600 mb-1">{formatDate(meeting.date)} &bull; {formatTime(meeting.time_start)}{meeting.time_end ? ` – ${formatTime(meeting.time_end)}` : ''}</p>
                <p className="mb-4">Host: <strong>{meeting.host}</strong> &nbsp;|&nbsp; Status: <strong>{STATUS_LABELS[meeting.status]}</strong></p>

                {meeting.overview && (
                    <section className="mb-6">
                        <h2 className="font-bold text-base border-b pb-1 mb-2">Overview</h2>
                        <p>{meeting.overview}</p>
                    </section>
                )}

                {(discussionPoints.length > 0 || challenges.length > 0) && (
                    <section className="mb-6">
                        <h2 className="font-bold text-base border-b pb-1 mb-2">Key Points</h2>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <p className="font-semibold mb-1">Discussion Points</p>
                                <ul>{discussionPoints.map((k) => <li key={k.id}>&bull; {k.content}</li>)}</ul>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p className="font-semibold mb-1">Challenges Faced</p>
                                <ul>{challenges.map((k) => <li key={k.id}>&bull; {k.content}</li>)}</ul>
                            </div>
                        </div>
                    </section>
                )}

                {(meeting.action_items ?? []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="font-bold text-base border-b pb-1 mb-2">Action Items</h2>
                        <ul>
                            {(meeting.action_items ?? []).map((a) => (
                                <li key={a.id}>&bull; <strong>{a.assignee_name}</strong>: {a.task}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {(meeting.next_steps ?? []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="font-bold text-base border-b pb-1 mb-2">Next Steps</h2>
                        <ul>
                            {(meeting.next_steps ?? []).map((ns) => (
                                <li key={ns.id}>&bull; {ns.content}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {(meeting.participants ?? []).length > 0 && (
                    <section className="mb-6">
                        <h2 className="font-bold text-base border-b pb-1 mb-2">Participants</h2>
                        <ul>
                            {(meeting.participants ?? []).map((p) => (
                                <li key={p.id}>&bull; {p.name} — {p.role}</li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </>
    );
}
