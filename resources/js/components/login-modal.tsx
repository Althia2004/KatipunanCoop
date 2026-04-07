import { Form } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type LoginModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    canResetPassword: boolean;
};

export default function LoginModal({
    open,
    onOpenChange,
    canResetPassword,
}: LoginModalProps) {
    const [termsAccepted, setTermsAccepted] = useState(false);

    const termsError = useMemo(() => {
        return termsAccepted ? '' : 'You must accept the terms and policy.';
    }, [termsAccepted]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-white/30 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/70">
                <DialogHeader>
                    <DialogTitle>Log in to your account</DialogTitle>
                    <DialogDescription>
                        Use your email and password to continue.
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
                                <Label htmlFor="login-email">Email address</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="login-password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="ml-auto text-sm">
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="login-password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="terms"
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) =>
                                        setTermsAccepted(Boolean(checked))
                                    }
                                />
                                <Label htmlFor="terms" className="leading-5">
                                    I agree to the Terms and Privacy Policy
                                </Label>
                            </div>
                            {!termsAccepted && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {termsError}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing || !termsAccepted}
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}