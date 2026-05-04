import { Head, Link, usePage } from '@inertiajs/react';
import { ShieldCheck, Users, BarChart3, Settings2, ServerCog } from 'lucide-react';
import type { Auth } from '@/types';

const widgets = [
    {
        icon: ShieldCheck,
        title: 'Global Access Control',
        description: 'Manage system permissions and monitor security settings across all teams.',
        badge: 'Security',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    {
        icon: Users,
        title: 'User Oversight',
        description: 'Review active users, staff roles, and superadmin-level access status.',
        badge: 'Users',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        icon: BarChart3,
        title: 'System Metrics',
        description: 'Inspect high-level dashboard trends and cross-team performance data.',
        badge: 'Analytics',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
    },
    {
        icon: Settings2,
        title: 'Platform Settings',
        description: 'Control platform-wide configuration and global application defaults.',
        badge: 'Settings',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
    },
];

export default function SuperadminDashboard() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth.user.name.split(' ')[0];

    return (
        <>
            <Head title="Superadmin Dashboard" />

            <div className="p-8 space-y-10 max-w-7xl mx-auto">
                <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        Superadmin Control Center
                    </p>
                    <h1 className="text-3xl font-bold text-[#2d4734]">
                        Good to see you, {firstName}.
                    </h1>
                    <p className="text-zinc-500 max-w-2xl">
                        This space is reserved for the Superadmin subsystem. You can use it to manage global settings, review system-wide health, and oversee key administrative workflows.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {widgets.map((widget) => (
                        <div
                            key={widget.title}
                            className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${widget.bg}`}>
                                    <widget.icon className={`w-6 h-6 ${widget.color}`} />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    {widget.badge}
                                </span>
                            </div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-2">{widget.title}</h2>
                            <p className="text-sm leading-relaxed text-zinc-500">{widget.description}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-[#f8faf8] border border-zinc-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <ServerCog className="w-5 h-5 text-[#2d4734]" />
                            <p className="text-sm font-semibold text-zinc-700">Platform health</p>
                        </div>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            System infrastructure is healthy. All services are operating within normal parameters, and no critical alerts are active.
                        </p>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-zinc-900 mb-3">Next steps</h3>
                        <ul className="space-y-3 text-sm text-zinc-500 leading-relaxed">
                            <li>• Review user role assignments for the latest team membership changes.</li>
                            <li>• Verify global access and security configuration.</li>
                            <li>• Check the platform settings for any pending updates.</li>
                        </ul>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-zinc-900 mb-3">Quick links</h3>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition"
                            >
                                Return to main site
                            </Link>
                            <Link
                                href="/admin/dashboard"
                                className="inline-flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition"
                            >
                                Open Admin dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

SuperadminDashboard.layout = () => ({
    breadcrumbs: [{ title: 'Superadmin Dashboard', href: '/superadmin/dashboard' }],
});
