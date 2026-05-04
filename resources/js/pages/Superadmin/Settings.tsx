import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Settings {
    lendingRate: string;
    caRate: string;
    latePenalty: string;
    managerLimit: string;
    bodThreshold: string;
    migsMinScore: string;
    dividendAllocation: string;
}

interface Props {
    settings: Settings;
}

const FIELD_META: { key: keyof Settings; label: string; hint: string; prefix?: string; suffix?: string }[] = [
    { key: 'lendingRate',        label: 'Lending Interest Rate',        hint: 'Monthly interest rate applied to regular loans.',              suffix: '% / month' },
    { key: 'caRate',             label: 'CA Interest Rate',             hint: 'Monthly interest rate for cash advances.',                     suffix: '% / month' },
    { key: 'latePenalty',        label: 'Late Payment Penalty',         hint: 'Fixed penalty charged per missed payment.',                    prefix: '₱' },
    { key: 'managerLimit',       label: 'Manager Loan Limit',           hint: 'Maximum loan amount a branch manager can approve directly.',   prefix: '₱' },
    { key: 'bodThreshold',       label: 'BOD Approval Threshold',       hint: 'Loan amounts at or above this require board of directors approval.', prefix: '₱' },
    { key: 'migsMinScore',       label: 'MIGS Minimum Score',           hint: 'Minimum MIGS credit score required for loan eligibility.',     suffix: ' pts' },
    { key: 'dividendAllocation', label: 'Dividend Allocation Split',    hint: 'Percentage split of net surplus allocated as member dividends.', suffix: '% to members' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SuperadminSettings({ settings }: Props) {
    const [message, setMessage] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<Settings>({
        lendingRate:        settings.lendingRate,
        caRate:             settings.caRate,
        latePenalty:        settings.latePenalty,
        managerLimit:       settings.managerLimit,
        bodThreshold:       settings.bodThreshold,
        migsMinScore:       settings.migsMinScore,
        dividendAllocation: settings.dividendAllocation,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/superadmin/settings', {
            onSuccess: () => setMessage('Settings saved successfully.'),
        });
    }

    function handleReset() {
        reset();
        setMessage(null);
    }

    return (
        <>
            <Head title="System Settings" />

            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                        System Settings
                    </p>
                    <h1 className="text-2xl font-bold text-[#2d5a27]">Interest &amp; Penalties</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Configure the cooperative's financial parameters. Changes take effect on the next billing cycle.
                    </p>
                </div>

                {message && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        {message}
                        <button onClick={() => setMessage(null)} className="ml-4 text-green-500 hover:text-green-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <p className="text-sm font-semibold text-zinc-700">Financial Parameters</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            These values govern loan computations, penalties, and dividend distributions system-wide.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {FIELD_META.map(({ key, label, hint, prefix, suffix }) => (
                                <div key={key} className="grid gap-1.5">
                                    <Label htmlFor={key}>{label}</Label>
                                    <div className="flex items-center gap-1.5">
                                        {prefix && (
                                            <span className="shrink-0 text-sm text-zinc-500 font-medium w-5 text-right">
                                                {prefix}
                                            </span>
                                        )}
                                        <Input
                                            id={key}
                                            value={data[key]}
                                            onChange={(e) => setData(key, e.target.value)}
                                            className="flex-1"
                                        />
                                        {suffix && (
                                            <span className="shrink-0 text-sm text-zinc-400">{suffix}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-400">{hint}</p>
                                    <InputError message={errors[key]} />
                                </div>
                            ))}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving…' : 'Save Settings'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={processing}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-xs text-zinc-400 text-center">
                    Changes to financial parameters are logged in the Audit Log.
                </p>
            </div>
        </>
    );
}
