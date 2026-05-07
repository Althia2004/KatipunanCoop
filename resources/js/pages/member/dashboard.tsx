import { useMemo, useState, type ComponentType, type FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Banknote,
    CreditCard,
    Download,
    FileText,
    Loader,
    PiggyBank,
    Plus,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { AppMemberSidebar } from '@/components/app-member-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import type { Auth } from '@/types';
import type { LoanRequest } from '@/types/loan-request';

interface Props {
    activeLoanCount?: number;
    pendingPayments?: number;
    savingsBalance?: number;
    loanRequests?: LoanRequest[];
}

type TabKey =
    | 'overview'
    | 'loan-application'
    | 'loan-tracking'
    | 'view-savings'
    | 'view-patronage'
    | 'reports';

const DEFAULT_TAB: TabKey = 'overview';

const validTabs: TabKey[] = [
    'overview',
    'loan-application',
    'loan-tracking',
    'view-savings',
    'view-patronage',
    'reports',
];

function getTabFromUrl(url: string): TabKey {
    try {
        const currentUrl = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const tab = currentUrl.searchParams.get('tab') as TabKey | null;
        return validTabs.includes(tab as TabKey) ? tab as TabKey : DEFAULT_TAB;
    } catch {
        return DEFAULT_TAB;
    }
}

export default function MemberDashboard({
    activeLoanCount = 0,
    pendingPayments = 0,
    savingsBalance = 0,
    loanRequests = [],
}: Props) {
    const page = usePage<{ auth?: Auth; flash?: { success?: string } }>();
    const { auth, flash } = page.props;
    const currentUser = auth?.user ?? (page.props as any).user;
    const firstName = currentUser?.name?.split(' ')[0] ?? 'Member';
    const activeTab = useMemo(() => {
        return page.url ? getTabFromUrl(page.url) : DEFAULT_TAB;
    }, [page.url]);

    const pendingLoanRequests = loanRequests.filter((request) => request.status === 'pending').length;
    const approvedLoanRequests = loanRequests.filter((request) => request.status === 'approved').length;
    const bodApprovalRequests = loanRequests.filter((request) => request.status === 'for_bod_approval').length;

    return (
        <>
            <Head title="Member Dashboard — KSCFMPC" />
            <SidebarProvider>
                <AppMemberSidebar />
                <SidebarInset>
                    <div className="flex flex-col min-h-screen bg-slate-50">
                        {activeTab === 'overview' && (
                            <>
                                <header className="sticky top-0 z-40 border-b bg-white px-6 py-6 shadow-sm">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                                                Member Dashboard
                                            </p>
                                            <h1 className="text-3xl font-bold text-zinc-900">
                                                Welcome back, {firstName} 👋
                                            </h1>
                                            <p className="mt-1 text-sm text-zinc-600">
                                                Review loan progress, submit new requests, and access savings tools.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                                                <p className="text-xs uppercase tracking-wide text-zinc-400">Active Loans</p>
                                                <p className="mt-3 text-3xl font-semibold text-zinc-900">{activeLoanCount}</p>
                                            </div>
                                            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                                                <p className="text-xs uppercase tracking-wide text-zinc-400">Pending Payments</p>
                                                <p className="mt-3 text-3xl font-semibold text-zinc-900">₱{Number(pendingPayments ?? 0).toLocaleString()}</p>
                                            </div>
                                            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                                                <p className="text-xs uppercase tracking-wide text-zinc-400">Savings Balance</p>
                                                <p className="mt-3 text-3xl font-semibold text-zinc-900">₱{Number(savingsBalance ?? 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </header>
                            </>
                        )}

                        <main className="flex-1 p-6">
                            {activeTab === 'overview' && (
                                <OverviewTab
                                    activeLoanCount={activeLoanCount}
                                    pendingPayments={pendingPayments}
                                    savingsBalance={savingsBalance}
                                    pendingLoanRequests={pendingLoanRequests}
                                    approvedLoanRequests={approvedLoanRequests}
                                    bodApprovalRequests={bodApprovalRequests}
                                />
                            )}
                            {activeTab === 'loan-application' && (
                                <LoanApplicationTab
                                    loanRequests={loanRequests}
                                    flash={flash}
                                />
                            )}
                            {activeTab === 'loan-tracking' && (
                                <LoanTrackingTab
                                    activeLoanCount={activeLoanCount}
                                    pendingPayments={pendingPayments}
                                    loanRequests={loanRequests}
                                />
                            )}
                            {activeTab === 'view-savings' && (
                                <ViewSavingsTab
                                    savingsBalance={savingsBalance}
                                />
                            )}
                            {activeTab === 'view-patronage' && (
                                <ViewPatronageTab />
                            )}
                            {activeTab === 'reports' && (
                                <ReportsTab />
                            )}
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

/**
 * Stat Card Component
 */
function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    color: 'emerald' | 'amber' | 'blue';
}) {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        blue: 'bg-blue-50 text-blue-600',
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`rounded-lg p-3 ${colors[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function OverviewTab({
    activeLoanCount,
    pendingPayments,
    savingsBalance,
    pendingLoanRequests,
    approvedLoanRequests,
    bodApprovalRequests,
}: {
    activeLoanCount: number;
    pendingPayments: number;
    savingsBalance: number;
    pendingLoanRequests: number;
    approvedLoanRequests: number;
    bodApprovalRequests: number;
}) {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">
                        Overview
                    </p>
                    <h2 className="mt-4 text-3xl font-bold text-zinc-900">Everything you need for member banking</h2>
                    <p className="mt-3 text-sm text-zinc-600">
                        Use this dashboard to submit loan requests, monitor approval status, view savings, and access reports.
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Pending Requests</p>
                            <p className="mt-3 text-3xl font-semibold text-zinc-900">{pendingLoanRequests}</p>
                        </div>
                        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Approved</p>
                            <p className="mt-3 text-3xl font-semibold text-zinc-900">{approvedLoanRequests}</p>
                        </div>
                        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Escalated</p>
                            <p className="mt-3 text-3xl font-semibold text-zinc-900">{bodApprovalRequests}</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Balances</p>
                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
                                <div>
                                    <p className="text-sm text-emerald-600">Active Loans</p>
                                    <p className="mt-2 text-2xl font-semibold text-zinc-900">{activeLoanCount}</p>
                                </div>
                                <CreditCard className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4">
                                <div>
                                    <p className="text-sm text-amber-600">Pending Payments</p>
                                    <p className="mt-2 text-2xl font-semibold text-zinc-900">₱{Number(pendingPayments ?? 0).toLocaleString()}</p>
                                </div>
                                <Wallet className="w-7 h-7 text-amber-600" />
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
                                <div>
                                    <p className="text-sm text-blue-600">Savings</p>
                                    <p className="mt-2 text-2xl font-semibold text-zinc-900">₱{Number(savingsBalance ?? 0).toLocaleString()}</p>
                                </div>
                                <PiggyBank className="w-7 h-7 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Quick actions</p>
                        <div className="mt-5 grid gap-3">
                            <Link href="/member/dashboard?tab=loan-application" className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left hover:border-zinc-300 transition">
                                <p className="font-semibold text-zinc-900">Submit Loan Request</p>
                                <p className="mt-1 text-sm text-zinc-500">Send your request to admin and waiting approval.</p>
                            </Link>
                            <Link href="/member/dashboard?tab=loan-tracking" className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left hover:border-zinc-300 transition">
                                <p className="font-semibold text-zinc-900">Track Loan Status</p>
                                <p className="mt-1 text-sm text-zinc-500">See current request progress and approval updates.</p>
                            </Link>
                            <Link href="/member/dashboard?tab=view-savings" className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left hover:border-zinc-300 transition">
                                <p className="font-semibold text-zinc-900">View Savings</p>
                                <p className="mt-1 text-sm text-zinc-500">Check your current savings balance and deposits.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <LoanApplicationTab compact />
                <LoanTrackingTab compact />
                <ViewSavingsTab compact />
                <ViewPatronageTab compact />
                <ReportsTab compact />
            </div>
        </div>
    );
}

function LoanApplicationTab({
    loanRequests = [],
    flash,
    compact = false,
}: {
    loanRequests?: LoanRequest[];
    flash?: { success?: string };
    compact?: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        purpose: '',
        term: '12',
    });
    const [submitted, setSubmitted] = useState(false);

    const pendingLoanRequests = loanRequests.filter((request) => request.status === 'pending').length;
    const approvedLoanRequests = loanRequests.filter((request) => request.status === 'approved').length;
    const bodApprovalRequests = loanRequests.filter((request) => request.status === 'for_bod_approval').length;

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post('/loan/request', {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitted(true);
                reset('amount', 'purpose', 'term');
            },
        });
    }

    return (
        <div className={compact ? 'space-y-6' : 'space-y-10'}>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">Loan Application</p>
                        <h2 className="mt-3 text-2xl font-bold text-zinc-900">Submit a new loan request</h2>
                        <p className="mt-2 text-sm text-zinc-600">
                            Complete the request form below and send it to the admin and superadmin for approval.
                        </p>
                    </div>
                    {!compact && (
                        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                            {loanRequests.length} requests submitted
                        </div>
                    )}
                </div>
            </div>

            {flash?.success && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    {flash.success}
                </div>
            )}
            {submitted && !flash?.success && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    Your loan request is being submitted.
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <Card className="shadow-sm border-zinc-200">
                    <CardHeader>
                        <CardTitle>New Loan Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Loan Amount (₱)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min={1000}
                                    step={100}
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="5,000"
                                />
                                {errors.amount && <InputError message={errors.amount} />}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Purpose</Label>
                                <textarea
                                    id="purpose"
                                    value={data.purpose}
                                    onChange={(e) => setData('purpose', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#2d4734]"
                                    placeholder="Describe why you need this loan"
                                />
                                {errors.purpose && <InputError message={errors.purpose} />}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="term">Loan Term (months)</Label>
                                <select
                                    id="term"
                                    value={data.term}
                                    onChange={(e) => setData('term', e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#2d4734]"
                                >
                                    <option value="6">6 months</option>
                                    <option value="12">12 months</option>
                                    <option value="24">24 months</option>
                                    <option value="36">36 months</option>
                                </select>
                                {errors.term && <InputError message={errors.term} />}
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Submitting...' : 'Submit Loan Request'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => reset('amount', 'purpose', 'term')}>
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Approval flow</p>
                        <div className="mt-4 space-y-3 text-sm text-zinc-600">
                            <p>1. Your loan request is submitted as pending.</p>
                            <p>2. Admin and superadmin review it for approval.</p>
                            <p>3. Approved requests are created as active loans.</p>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Loan request summary</p>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
                                <span className="text-sm text-emerald-700">Approved</span>
                                <span className="text-xl font-semibold text-zinc-900">{approvedLoanRequests}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4">
                                <span className="text-sm text-amber-700">Pending</span>
                                <span className="text-xl font-semibold text-zinc-900">{pendingLoanRequests}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-sky-50 p-4">
                                <span className="text-sm text-sky-700">BOD Review</span>
                                <span className="text-xl font-semibold text-zinc-900">{bodApprovalRequests}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loanRequests.length === 0 ? (
                <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-zinc-600 shadow-sm">
                    <p className="font-semibold text-zinc-900">No loan requests yet.</p>
                    <p className="mt-2 text-sm">Your submitted requests will appear here once sent.</p>
                </div>
            ) : (
                <Card className="shadow-sm border-zinc-200">
                    <CardHeader>
                        <CardTitle>Recent Loan Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50">
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-zinc-500">Request</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-zinc-500">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-zinc-500">Term</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-zinc-500">Status</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-zinc-500">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {loanRequests.map((request) => (
                                        <tr key={request.id} className="bg-white">
                                            <td className="px-4 py-3">{request.purpose || 'Loan request'}</td>
                                            <td className="px-4 py-3">₱{Number(request.amount).toLocaleString()}</td>
                                            <td className="px-4 py-3">{request.term_months} months</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(request.status)}`}>
                                                    {request.status.replace(/_/g, ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{request.requested_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function LoanTrackingTab({
    activeLoanCount,
    pendingPayments,
    loanRequests = [],
    compact = false,
}: {
    activeLoanCount: number;
    pendingPayments: number;
    loanRequests?: LoanRequest[];
    compact?: boolean;
}) {
    return (
        <div className={compact ? 'space-y-6' : 'space-y-10'}>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">Loan Tracking</p>
                <h2 className="mt-3 text-2xl font-bold text-zinc-900">Track your loan request progress</h2>
                <p className="mt-2 text-sm text-zinc-600">
                    Review current active loans and pending approvals in one place.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Active Loans</p>
                        <p className="mt-3 text-3xl font-semibold text-zinc-900">{activeLoanCount}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Pending Payments</p>
                        <p className="mt-3 text-3xl font-semibold text-zinc-900">₱{Number(pendingPayments ?? 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Requests</p>
                        <p className="mt-3 text-3xl font-semibold text-zinc-900">{loanRequests.length}</p>
                    </div>
                </div>
            </div>

            {loanRequests.length === 0 ? (
                <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
                    <p className="font-semibold text-zinc-900">No loan requests to track yet.</p>
                    <p className="mt-2 text-sm text-zinc-600">Create a new request on the Loan Application tab to begin tracking approval progress.</p>
                </div>
            ) : (
                <Card className="shadow-sm border-zinc-200">
                    <CardHeader>
                        <CardTitle>Loan Request History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50">
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-zinc-500">Request</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-zinc-500">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-zinc-500">Status</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-zinc-500">When</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {loanRequests.map((request) => (
                                        <tr key={request.id} className="bg-white">
                                            <td className="px-4 py-3">{request.purpose || 'Loan request'}</td>
                                            <td className="px-4 py-3">₱{Number(request.amount).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(request.status)}`}>
                                                    {request.status.replace(/_/g, ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{request.requested_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!compact && (
                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
                    <p className="text-sm font-semibold text-zinc-900">Need more detail?</p>
                    <p className="mt-2 text-sm text-zinc-600">Your dashboard request history will be updated as admin and superadmin approve your loans.</p>
                </div>
            )}
        </div>
    );
}

function ViewSavingsTab({ compact = false, savingsBalance = 0 }: { compact?: boolean; savingsBalance?: number }) {
    return (
        <div className={compact ? 'space-y-6' : 'space-y-10'}>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">View Savings</p>
                <h2 className="mt-3 text-2xl font-bold text-zinc-900">Savings overview</h2>
                <p className="mt-2 text-sm text-zinc-600">See your current balance and savings activity at a glance.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-zinc-200 bg-blue-50 p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-600">Current Balance</p>
                    <p className="mt-4 text-3xl font-semibold text-zinc-900">₱{Number(savingsBalance ?? 0).toLocaleString()}</p>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Interest Earned</p>
                    <p className="mt-4 text-3xl font-semibold text-zinc-900">₱0.00</p>
                    <p className="mt-2 text-sm text-zinc-500">Interest data will appear once deposits post.</p>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Deposits</p>
                    <p className="mt-4 text-3xl font-semibold text-zinc-900">0</p>
                    <p className="mt-2 text-sm text-zinc-500">Deposit history is available in the savings page.</p>
                </div>
            </div>

            {!compact && (
                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
                    <p className="text-sm font-semibold text-zinc-900">Need to add more savings?</p>
                    <p className="mt-2 text-sm text-zinc-600">Reach out to your coop staff to update deposit records and account statements.</p>
                </div>
            )}
        </div>
    );
}

function ViewPatronageTab({ compact = false }: { compact?: boolean }) {
    return (
        <div className={compact ? 'space-y-6' : 'space-y-10'}>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">View Return Patronage</p>
                <h2 className="mt-3 text-2xl font-bold text-zinc-900">Patronage refund details</h2>
                <p className="mt-2 text-sm text-zinc-600">Track the cooperative patronage return and dividend information.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Latest Patronage</p>
                    <p className="mt-4 text-3xl font-semibold text-zinc-900">₱0.00</p>
                    <p className="mt-2 text-sm text-zinc-500">No patronage payments have been recorded yet.</p>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-slate-50 p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Next payout</p>
                    <p className="mt-4 text-3xl font-semibold text-zinc-900">TBD</p>
                    <p className="mt-2 text-sm text-zinc-500">Admin updates patronage payouts after year-end closing.</p>
                </div>
            </div>

            {!compact && (
                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
                    <p className="text-sm font-semibold text-zinc-900">Patronage status</p>
                    <p className="mt-2 text-sm text-zinc-600">Approved returns will be visible after cooperative distribution.</p>
                </div>
            )}
        </div>
    );
}

function ReportsTab({ compact = false }: { compact?: boolean }) {
    return (
        <div className={compact ? 'space-y-6' : 'space-y-10'}>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">Download Reports</p>
                <h2 className="mt-3 text-2xl font-bold text-zinc-900">Generate the files you need</h2>
                <p className="mt-2 text-sm text-zinc-600">Export loan, savings, and patronage reports for your records.</p>
            </div>

            <Card className="shadow-sm border-zinc-200">
                <CardHeader>
                    <CardTitle>Available reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <ReportDownloadCard
                            title="Loan Statement"
                            description="Complete history of all your loans and payments"
                            format="PDF"
                        />
                        <ReportDownloadCard
                            title="Savings Summary"
                            description="Your savings account transactions and interest"
                            format="PDF"
                        />
                        <ReportDownloadCard
                            title="Patronage Dividend Report"
                            description="Your annual patronage dividends"
                            format="PDF"
                        />
                    </div>
                </CardContent>
            </Card>

            {!compact && (
                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
                    <p className="text-sm font-semibold text-zinc-900">Export and share</p>
                    <p className="mt-2 text-sm text-zinc-600">Use these reports for coop reviews, audits, and financial planning.</p>
                </div>
            )}
        </div>
    );
}

function statusBadgeClass(status: string) {
    switch (status) {
        case 'pending':
            return 'bg-amber-100 text-amber-700';
        case 'approved':
            return 'bg-emerald-100 text-emerald-700';
        case 'for_bod_approval':
            return 'bg-sky-100 text-sky-700';
        default:
            return 'bg-zinc-100 text-zinc-700';
    }
}

/**
 * Quick Action Card
 */
function QuickActionCard({
    icon: Icon,
    title,
    description,
    color,
    onClick,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
    color: 'emerald' | 'blue' | 'amber';
    onClick: () => void;
}) {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
        amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    };

    return (
        <button
            onClick={onClick}
            className={`rounded-lg border border-gray-200 p-4 text-left transition ${colors[color]}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm opacity-75">{description}</p>
                </div>
                <Icon className="w-5 h-5 shrink-0" />
            </div>
        </button>
    );
}

/**
 * Report Download Card
 */
function ReportDownloadCard({
    title,
    description,
    format,
}: {
    title: string;
    description: string;
    format: string;
}) {
    return (
        <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    {format}
                </Button>
            </div>
        </div>
    );
}

