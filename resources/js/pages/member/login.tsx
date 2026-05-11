import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { ArrowLeft, Leaf } from 'lucide-react';

export default function MemberLogin() {
    const { data, setData, post, processing, errors } = useForm<{ email: string; password: string; auth?: string }>({
        email: '',
        password: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/member/login');
    }

    return (
        <>
            <Head title="Member Login — KSCFMPC" />

            <div className="min-h-screen bg-[#2d5a27] flex flex-col">
                {/* Top bar */}
                <div className="w-full px-6 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white hover:underline text-sm font-medium transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                {/* Centered card */}
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md space-y-6">
                        {/* Logo + name */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-125" />
                                <img
                                    src="/images/Sample - Logo(KSCF MPC).png"
                                    alt="KSCFMPC Logo"
                                    className="relative w-24 h-24 rounded-full object-cover border-4 border-white/30"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold text-xl tracking-wide">KSCFMPC</p>
                                <p className="text-white/70 text-xs mt-0.5">
                                    Katipunan Small Coconut Farmers Multi Purpose Cooperative
                                </p>
                            </div>
                        </div>

                        {/* Login card */}
                        <Card className="bg-[#f5f0e8] border-0 shadow-2xl">
                            <CardHeader className="pb-2 pt-8 px-8">
                                <div className="flex items-center gap-2">
                                    <Leaf className="w-5 h-5 text-[#2d5a27]" />
                                    <h1 className="text-xl font-bold text-[#1a1a1a]">Member Portal</h1>
                                </div>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Sign in to access your KSCFMPC member account.
                                </p>
                            </CardHeader>

                            <CardContent className="px-8 pb-8">
                                {errors.auth && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                        {errors.auth}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            placeholder="your@email.com"
                                            className="bg-white"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="password">Password</Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            required
                                            autoComplete="current-password"
                                            placeholder="Password"
                                            className="bg-white"
                                        />
                                        <InputError message={errors.password} />
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            Need help accessing your account? Contact our staff.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-[#2d5a27] hover:bg-[#1e3e1a] text-white font-semibold"
                                        disabled={processing}
                                    >
                                        {processing ? 'Signing in…' : 'Login'}
                                    </Button>
                                </form>

                                <div className="mt-5 p-4 bg-[#2d5a27]/10 border border-[#2d5a27]/30 rounded-xl text-sm text-[#2d5a27] leading-relaxed">
                                    Don&apos;t have an account? Registration is processed by our staff after
                                    seminar attendance confirmation.
                                </div>
                            </CardContent>
                        </Card>

                        <p className="text-center text-white/50 text-xs opacity-60">
                            © {new Date().getFullYear()} KSCFMPC. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
