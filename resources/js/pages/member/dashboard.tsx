import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LogOut, Leaf, User } from 'lucide-react';

interface Props {
    user: {
        name: string;
        email: string;
    };
}

export default function MemberDashboard({ user }: Props) {
    function handleLogout() {
        router.post('/member/logout');
    }

    return (
        <>
            <Head title="Member Dashboard — KSCFMPC" />

            <div className="min-h-screen bg-[#2d5a27] flex flex-col">
                {/* Header */}
                <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/Sample - Logo(KSCF MPC).png"
                            alt="KSCFMPC Logo"
                            className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                        />
                        <div>
                            <p className="text-white font-bold text-sm">KSCFMPC</p>
                            <p className="text-white/60 text-[10px]">Member Portal</p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-white/80 hover:text-white hover:bg-white/10 gap-2 text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </header>

                {/* Main content */}
                <div className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="w-full max-w-lg space-y-6">
                        {/* Welcome card */}
                        <Card className="bg-[#f5f0e8] border-0 shadow-2xl">
                            <CardHeader className="pb-2 pt-6 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#2d5a27] rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-medium">Logged in as</p>
                                        <p className="text-[#1a1a1a] font-bold text-lg leading-tight">{user.name}</p>
                                        <p className="text-zinc-500 text-xs">{user.email}</p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 pb-8">
                                <div className="mt-6 flex flex-col items-center gap-3 py-10 bg-[#2d5a27]/5 rounded-2xl border border-[#2d5a27]/10">
                                    <Leaf className="w-12 h-12 text-[#2d5a27]/40" />
                                    <h1 className="text-2xl font-bold text-[#1a1a1a]">Member Dashboard</h1>
                                    <span className="inline-block px-3 py-1 bg-[#c8920a]/20 text-[#c8920a] text-xs font-semibold rounded-full tracking-wide uppercase">
                                        Coming Soon
                                    </span>
                                    <p className="text-zinc-500 text-sm text-center max-w-xs leading-relaxed mt-1">
                                        Your member dashboard is under construction. Soon you'll be able to
                                        view your loans, savings, dividends, and more.
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <Link
                                        href="/"
                                        className="text-sm text-[#2d5a27] font-medium hover:underline flex items-center gap-1"
                                    >
                                        ← Back to Home
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <p className="text-center text-white/50 text-xs">
                            © {new Date().getFullYear()} KSCFMPC. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
