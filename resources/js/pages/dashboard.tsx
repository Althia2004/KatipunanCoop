import { Head, Link, usePage } from '@inertiajs/react';
import {
    Users,
    Clock,
    CalendarDays,
    Banknote,
    BriefcaseBusiness,
    BookOpenCheck,
    FileText,
    Archive,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { Auth } from '@/types';

// ─── BOD data ────────────────────────────────────────────────────────────────

const BOD_MEMBERS = [
    { name: 'Blaine Cottrell',  role: 'Membership Approval Authority' },
    { name: 'Cherish Kerr',     role: 'Mortuary/Death Benefits Overseer' },
    { name: 'Beatrice Janelle', role: 'Financial & Dividend Analyst' },
    { name: 'Eulalie Armel',    role: 'Loan Compliance & Vetting' },
    { name: 'Esperanza Lodge',  role: 'Executive Oversight' },
    { name: 'Zayn Hartley',     role: 'Transaction Auditor' },
    { name: 'Laurent Wilma',    role: 'Policy & Rules Governance' },
];

function initials(name: string) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface DashboardProps {
    total_members: number;
    pending_approvals: number;
    upcoming_seminars: number;
    active_loans: number;
    pending_loan_approvals?: number;
    recent_loan_requests?: Array<{
        id: number;
        amount: number;
        requestedBy: string;
        date: string;
    }>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Dashboard({
    total_members,
    pending_approvals,
    upcoming_seminars,
    active_loans,
    pending_loan_approvals,
    recent_loan_requests,
}: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth.user.name.split(' ')[0];

    const quickActions = [
        {
            icon: BriefcaseBusiness,
            label: 'Member Registrations',
            description: 'View and manage new member applications',
            href: '/loan/member-registration',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            icon: BookOpenCheck,
            label: 'Seminar Tracking',
            description: 'Track seminar schedules and attendance',
            href: '/loan/seminar-tracking',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            icon: Archive,
            label: 'Annual Meeting Reports',
            description: 'View and manage annual meeting summaries',
            href: '/reports/annual',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            icon: FileText,
            label: 'Loan Management',
            description: 'Monitor active loans and applications',
            href: '/loan/management',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ];

    const stats = [
        {
            icon: Users,
            label: 'Total Registered Members',
            value: total_members,
            accent: 'bg-emerald-50 text-emerald-600',
        },
        {
            icon: Clock,
            label: 'Pending Approvals',
            value: pending_approvals,
            accent: 'bg-amber-50 text-amber-600',
        },
        {
            icon: CalendarDays,
            label: 'Upcoming Seminars',
            value: upcoming_seminars,
            accent: 'bg-blue-50 text-blue-600',
        },
        {
            icon: Banknote,
            label: 'Active Loans',
            value: active_loans,
            accent: 'bg-purple-50 text-purple-600',
        },
    ];

    // Add pending loan approvals stat if user is admin/superadmin
    if (pending_loan_approvals !== undefined) {
        stats.splice(1, 0, {
            icon: Clock,
            label: 'Pending Loan Approvals',
            value: pending_loan_approvals,
            accent: 'bg-red-50 text-red-600',
        });
    }

    // Duplicate for seamless infinite scroll
    const scrollItems = [...BOD_MEMBERS, ...BOD_MEMBERS];

    return (
        <>
            <Head title="Dashboard" />

            <style>{`
                @keyframes scroll-left {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .bod-track {
                    animation: scroll-left 28s linear infinite;
                }
                .bod-track:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="p-8 space-y-10 max-w-7xl mx-auto">

                {/* ── Welcome ── */}
                <div>
                    <h1 className="text-3xl font-bold text-[#2d4734]">
                        Welcome back, {firstName}! 
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium">
                        Here&apos;s what&apos;s happening at KSCF Cooperative today.
                    </p>
                </div>

                {/* ── Quick Actions ── */}
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="group bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm
                                           hover:shadow-md hover:-translate-y-1 transition-all duration-200
                                           flex flex-col gap-4"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.bg}`}>
                                    <action.icon className={`w-6 h-6 ${action.color}`} />
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-800 group-hover:text-[#459245] transition-colors">
                                        {action.label}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                        {action.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Recent Loan Requests ── */}
                {recent_loan_requests && recent_loan_requests.length > 0 && (
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                            Recent Loan Requests
                        </h2>
                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                            <div className="space-y-4">
                                {recent_loan_requests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-b-0">
                                        <div>
                                            <p className="font-medium text-zinc-800">{request.requestedBy}</p>
                                            <p className="text-sm text-zinc-500">₱{request.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-zinc-500">{request.date}</p>
                                            <Link
                                                href="/loan/management"
                                                className="text-sm text-[#459245] hover:text-[#3D582F] font-medium"
                                            >
                                                Review →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Board of Directors ── */}
                <div>
                    <h2 className="text-lg font-bold text-[#3D582F] mb-4">Board of Directors</h2>
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white py-6">
                        <div className="flex bod-track gap-4 w-max px-4">
                            {scrollItems.map((member, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center gap-3 bg-zinc-50 border border-zinc-200
                                               rounded-2xl p-5 w-44 shadow-sm shrink-0"
                                >
                                    <div className="w-14 h-14 rounded-full bg-[#3D582F] text-white flex
                                                    items-center justify-center text-lg font-bold select-none">
                                        {initials(member.name)}
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-sm text-zinc-800 leading-tight">
                                            {member.name}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-1 leading-snug">
                                            {member.role}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                        Overview
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.accent}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-zinc-900">{stat.value}</p>
                                    <p className="text-sm text-zinc-500 mt-0.5">{stat.label}</p>
                                </div>
                                <div className="h-1 w-12 rounded-full bg-[#459245]/30" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
