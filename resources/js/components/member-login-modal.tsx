import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
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

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function MemberLoginModal({ open, onOpenChange }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[#2d5a27]">Member Login</DialogTitle>
                    <DialogDescription>
                        Access your KSCFMPC member portal account.
                    </DialogDescription>
                </DialogHeader>

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
                                <Label htmlFor="member-email">Email</Label>
                                <Input
                                    id="member-email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="your@email.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="member-pw">Password</Label>
                                <PasswordInput
                                    id="member-pw"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Login
                            </Button>

                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 leading-relaxed">
                                Don&apos;t have an account? Registration is processed by our staff after
                                seminar attendance confirmation.
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
