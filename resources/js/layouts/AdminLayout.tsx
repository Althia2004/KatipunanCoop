import { Link, router } from '@inertiajs/react';
import {
    LayoutGrid, Users, PiggyBank, CreditCard, BarChart3,
    Settings, LogOut, Shield, Menu, X, FileText,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
    { title: 'Dashboard',      href: '/admin/dashboard',     icon: LayoutGrid },
    { title: 'Members',        href: '/superadmin/members',  icon: Users },
    { title: 'Savings',        href: '/superadmin/savings',  icon: PiggyBank },
    { title: 'Loans',          href: '/superadmin/loans',    icon: CreditCard },
    { title: 'Reports',        href: '/superadmin/reports/financial', icon: BarChart3 },
    { title: 'Announcements',  href: '/superadmin/announcements', icon: FileText },
    { title: 'Settings',       href: '/superadmin/settings', icon: Settings },
];

interface Props {
    user: { name: string; email?: string | null };
    children: React.ReactNode;
    title?: string;
}

export default function AdminLayout({ user, children, title }: Props) {
    const [open, setOpen] = useState(false);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    function handleLogout() {
        router.post('/logout');
    }

    const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
        <aside className={
            mobile
                ? 'flex flex-col h-full bg-[#1e40af] w-72'
                : 'hidden lg:flex flex-col w-64 min-h-screen bg-[#1e40af] fixed left-0 top-0 bottom-0 z-30'
        }>
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                <img
                    src="/images/Sample - Logo(KSCF MPC).png"
                    alt="KSCFMPC"
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/30 shrink-0"
                />
                <div>
                    <p className="text-blue-100 font-bold text-sm leading-none">KSCFMPC</p>
                    <p className="text-blue-200/70 text-[10px] mt-0.5">Admin Portal</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(item => {
                    const active = currentPath === item.href || currentPath.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                active
                                    ? 'bg-white/15 text-white'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-white/10 px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                        <p className="text-blue-200/70 text-[10px]">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile sidebar overlay */}
            {open && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative z-50">
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Mobile header */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1e40af] border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/Sample - Logo(KSCF MPC).png"
                            alt="KSCFMPC"
                            className="w-7 h-7 rounded-full object-cover border border-white/30"
                        />
                        <span className="text-white font-bold text-sm">{title ?? 'Admin Portal'}</span>
                    </div>
                    <button
                        onClick={() => setOpen(!open)}
                        className="text-white/80 hover:text-white p-1"
                    >
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}