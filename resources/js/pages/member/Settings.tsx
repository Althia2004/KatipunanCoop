import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Settings, Key, Phone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MemberLayout from '@/layouts/MemberLayout';

interface Props {
    user: { name: string; email: string | null };
}

export default function MemberSettings({ user }: Props) {
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const contactForm = useForm({
        contact_number: '',
    });

    function submitPassword(e: React.FormEvent) {
        e.preventDefault();
        passwordForm.put('/member/settings/password', {
            onSuccess: () => passwordForm.reset(),
        });
    }

    function submitContact(e: React.FormEvent) {
        e.preventDefault();
        contactForm.put('/member/settings/contact', {
            onSuccess: () => contactForm.reset(),
        });
    }

    return (
        <MemberLayout user={{ ...user, email: user.email ?? undefined }} title="Settings">
            <Head title="Settings — KSCFMPC Member Portal" />

            <div className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">Manage your account preferences.</p>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
                        <Key className="w-4 h-4 text-zinc-500" />
                        <h2 className="text-sm font-semibold text-zinc-700">Change Password</h2>
                    </div>
                    <form onSubmit={submitPassword} className="p-5 space-y-4">
                        {passwordForm.recentlySuccessful && (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
                                <CheckCircle2 className="w-4 h-4" />
                                Password updated successfully.
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1 block">Current Password</label>
                            <Input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={e => passwordForm.setData('current_password', e.target.value)}
                                required
                            />
                            {passwordForm.errors.current_password && (
                                <p className="text-xs text-red-500 mt-1">{passwordForm.errors.current_password}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1 block">New Password</label>
                            <Input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={e => passwordForm.setData('password', e.target.value)}
                                required
                            />
                            {passwordForm.errors.password && (
                                <p className="text-xs text-red-500 mt-1">{passwordForm.errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1 block">Confirm New Password</label>
                            <Input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-1">
                            <Button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="bg-[#2d5a27] hover:bg-[#2d5a27]/90 text-white"
                            >
                                {passwordForm.processing ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Update Contact */}
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-zinc-500" />
                        <h2 className="text-sm font-semibold text-zinc-700">Update Contact Number</h2>
                    </div>
                    <form onSubmit={submitContact} className="p-5 space-y-4">
                        {contactForm.recentlySuccessful && (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
                                <CheckCircle2 className="w-4 h-4" />
                                Contact number updated.
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1 block">New Contact Number</label>
                            <Input
                                type="tel"
                                placeholder="e.g. 09171234567"
                                value={contactForm.data.contact_number}
                                onChange={e => contactForm.setData('contact_number', e.target.value)}
                                required
                            />
                            {contactForm.errors.contact_number && (
                                <p className="text-xs text-red-500 mt-1">{contactForm.errors.contact_number}</p>
                            )}
                        </div>

                        <p className="text-xs text-zinc-400">
                            Note: Updating your contact number changes your login credentials. Please remember your new number.
                        </p>

                        <div className="flex justify-end pt-1">
                            <Button
                                type="submit"
                                disabled={contactForm.processing}
                                className="bg-[#2d5a27] hover:bg-[#2d5a27]/90 text-white"
                            >
                                {contactForm.processing ? 'Saving...' : 'Update Contact'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Account Info (read-only) */}
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-zinc-700 flex items-center gap-2 mb-4">
                        <Settings className="w-4 h-4" />
                        Account Information
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-zinc-400">Name</p>
                            <p className="text-sm font-medium text-zinc-800">{user.name}</p>
                        </div>
                        {user.email && (
                            <div>
                                <p className="text-xs text-zinc-400">Email</p>
                                <p className="text-sm font-medium text-zinc-800">{user.email}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
}
