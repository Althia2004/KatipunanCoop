import { Link, router } from '@inertiajs/react';
import {
    LayoutGrid, CreditCard, PiggyBank, User, Megaphone,
    BarChart3, Settings, LogOut, Menu, X, Banknote, TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
    { title: 'Dashboard',       href: '/member/dashboard',     icon: LayoutGrid },
    { title: 'My Loans',        href: '/member/loans',         icon: Banknote },
    { title: 'My Payments',     href: '/member/payments',      icon: CreditCard },
    { title: 'Savings',         href: '/member/savings',       icon: PiggyBank },
    { title: 'Dividends',       href: '/member/dividends',     icon: TrendingUp },
    { title: 'Announcements',   href: '/member/announcements', icon: Megaphone },
    { title: 'My Profile',      href: '/member/profile',       icon: User },
    { title: 'Settings',        href: '/member/settings',      icon: Settings },
];

interface Props {
    user: { name: string; email?: string | null };
    children: React.ReactNode;
    title?: string;
}

export default function MemberLayout({ user, children, title }: Props) {
    const [open, setOpen] = useState(false);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    function handleLogout() {
        router.post('/member/logout');
    }

    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
        <aside className={
            mobile
                ? 'flex flex-col h-full bg-[#2d5a27] w-72'
                : 'hidden lg:flex flex-col w-64 min-h-screen bg-[#2d5a27] fixed left-0 top-0 bottom-0 z-30'
        }>
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                <img
                    src="/images/Sample - Logo(KSCF MPC).png"
                    alt="KSCFMPC"
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/30 shrink-0"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
                <div>
                    <p className="text-white font-bold text-sm leading-none">KSCFMPC</p>
                    <p className="text-white/50 text-[10px] mt-0.5">Member Portal</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(item => {
                    const active = currentPath === item.href ||
                        currentPath.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
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
                        <span className="text-white text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                        {user.email && !user.email.includes('@kscf.local') && (
                            <p className="text-white/50 text-[10px] truncate">{user.email}</p>
                        )}
                        {(!user.email || user.email.includes('@kscf.local')) && (
                            <p className="text-white/30 text-[10px] italic">Member</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
    return (
    
        <div className="min-h-screen bg-zinc-50">

            {/* Desktop Sidebar — fixed */}
            <SidebarContent />

            {/* Mobile overlay */}
            {open && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
                    <div className="relative z-50">
                        <SidebarContent mobile />
                    </div>
                </div>
            )}

            {/* Mobile header */}
            <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#2d5a27] border-b border-white/10 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <img
                        src="/images/Sample - Logo(KSCF MPC).png"
                        alt="KSCFMPC"
                        className="w-7 h-7 rounded-full object-cover border border-white/30"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="text-white font-bold text-sm">{title ?? 'Member Portal'}</span>
                </div>
                <button
                    onClick={() => setOpen(!open)}
                    className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                >
                    {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </header>

            {/* Main content — ml-64 reserves sidebar space, fills remaining width */}
            <div className="lg:ml-64 min-h-screen flex flex-col">
        <main className="flex-1 p-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-5xl w-full">
            {children}
        </div>
     </main>
     <footer className="px-6 py-3 border-t border-zinc-200 bg-white">
        <p className="text-xs text-zinc-400 text-center">
            © {new Date().getFullYear()} Katipunan Small Coconut Farmers MPC · Katipunan, Davao del Norte
        </p>
         </footer>
        </div>

        </div>
    );
}