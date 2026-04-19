import { useState } from 'react';
import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { register } from '@/routes';
import { request } from '@/routes/password';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    canResetPassword: boolean;
}

export default function AdminLoginModal({ open, onOpenChange, canResetPassword }: Props) {
    const [captchaChecked, setCaptchaChecked] = useState(false);
    const [consentAccepted, setConsentAccepted] = useState(false);

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setCaptchaChecked(false); setConsentAccepted(false); } }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[#2d5a27]">Administrator Login</DialogTitle>
                    <DialogDescription>
                        Authorized personnel only. All access is logged.
                    </DialogDescription>
                </DialogHeader>

                {/* Consent notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
                    By accessing this system, you acknowledge and agree to the terms of this consent.
                    Unauthorized access is strictly prohibited and subject to legal action.
                </div>

                <Form
                    key={String(open)}
                    {...store.form()}
                    resetOnSuccess={['password']}
                    onSuccess={() => onOpenChange(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="admin-email">Email / Username</Label>
                                <Input
                                    id="admin-email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="admin@kscfmpc.coop"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="admin-pw">Password</Label>
                                    {canResetPassword && (
                                        <a
                                            href={request()}
                                            className="text-xs text-[#2d5a27] hover:underline"
                                        >
                                            Forgot password?
                                        </a>
                                    )}
                                </div>
                                <PasswordInput
                                    id="admin-pw"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* reCAPTCHA UI only */}
                            <div className="border border-zinc-200 rounded-xl p-4 flex items-center gap-3 bg-zinc-50">
                                <Checkbox
                                    id="captcha"
                                    checked={captchaChecked}
                                    onCheckedChange={(v) => setCaptchaChecked(Boolean(v))}
                                />
                                <Label htmlFor="captcha" className="text-sm cursor-pointer">
                                    I am not a robot
                                </Label>
                                <div className="ml-auto text-right leading-tight text-[10px] text-zinc-400">
                                    <div>reCAPTCHA</div>
                                    <div>Privacy · Terms</div>
                                </div>
                            </div>

                            {/* Consent checkbox */}
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="consent"
                                    checked={consentAccepted}
                                    onCheckedChange={(v) => setConsentAccepted(Boolean(v))}
                                />
                                <Label htmlFor="consent" className="text-sm leading-5 cursor-pointer">
                                    I acknowledge and agree to the system access terms and consent.
                                </Label>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                                    disabled={processing || !captchaChecked || !consentAccepted}
                                >
                                    {processing && <Spinner />}
                                    Login
                                </Button>
                            </div>

                            <p className="text-center text-xs text-zinc-400">
                                Need a staff account?{' '}
                                <Link href={register()} className="text-[#2d5a27] hover:underline font-medium">
                                    Register Staff
                                </Link>
                                {' '}(Temporary — pending HR subsystem)
                            </p>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
