<?php

namespace App\Http\Controllers;

use App\Models\LoanRequest;
use App\Models\MemberRegistration;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SuperadminController extends Controller
{
    public function dashboard()
    {
        $staff = User::whereNot('role', 'member')
            ->select(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at'])
            ->orderBy('name')
            ->get();

        $pendingLoans = LoanRequest::where('status', LoanRequest::STATUS_PENDING)
            ->with('requestedBy:id,name')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($lr) => [
                'id'          => $lr->id,
                'type'        => 'Loan Approval',
                'requestedBy' => $lr->requestedBy?->name ?? 'Unknown',
                'date'        => $lr->created_at->format('M d, Y'),
                'priority'    => 'medium',
            ]);

        $pendingRegs = MemberRegistration::where('status', MemberRegistration::STATUS_PENDING)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($mr) => [
                'id'          => $mr->id,
                'type'        => 'Member Registration',
                'requestedBy' => trim("{$mr->first_name} {$mr->last_name}"),
                'date'        => $mr->created_at->format('M d, Y'),
                'priority'    => 'low',
            ]);

        return inertia('Superadmin/Dashboard', [
            'stats' => [
                'totalMembers'     => User::where('role', 'member')->count(),
                'pendingApprovals' => LoanRequest::where('status', LoanRequest::STATUS_PENDING)->count()
                    + MemberRegistration::where('status', MemberRegistration::STATUS_PENDING)->count(),
                'activeStaff'      => $staff->count(),
                'systemAlerts'     => 0,
            ],
            'staff'           => $staff,
            'recentApprovals' => $pendingLoans->merge($pendingRegs)->take(5)->values(),
            'recentAudit'     => [],
        ]);
    }

    public function staff()
    {
        return inertia('Superadmin/Staff', [
            'staff' => User::whereNot('role', 'member')
                ->select(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function storeStaff(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', 'in:admin,manager,board,bookkeeper,hr,staff,superadmin'],
        ]);

        User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'password'          => $validated['password'],
            'role'              => $validated['role'],
            'email_verified_at' => now(),
        ]);

        activity()->causedBy(auth()->user())
            ->withProperties(['role' => $validated['role']])
            ->log('Staff account created');

        return back()->with('success', 'Staff member added successfully.');
    }

    public function updateStaff(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role'  => ['required', 'in:admin,manager,board,bookkeeper,hr,staff,superadmin'],
        ]);

        $user->update($validated);

        activity()->causedBy(auth()->user())
            ->performedOn($user)
            ->withProperties(['changes' => $request->only(['name', 'email', 'role'])])
            ->log('Staff account updated');

        return back()->with('success', 'Staff member updated successfully.');
    }

    public function destroyStaff(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        if ($user->role === 'superadmin' && User::where('role', 'superadmin')->count() <= 1) {
            return back()->withErrors(['error' => 'Cannot delete the last superadmin account.']);
        }

        $userName = $user->name;
        $user->delete();

        activity()->causedBy(auth()->user())
            ->withProperties(['deleted_user' => $userName])
            ->log('Staff account deleted');

        return back()->with('success', 'Staff member removed successfully.');
    }

    public function approvals()
    {
        $pendingLoans = LoanRequest::where('status', LoanRequest::STATUS_PENDING)
            ->with('requestedBy:id,name')
            ->latest()
            ->get()
            ->map(fn ($lr) => [
                'id'          => $lr->id,
                'type'        => 'Loan Approval',
                'requestedBy' => $lr->requestedBy?->name ?? 'Unknown',
                'date'        => $lr->created_at->format('M d, Y'),
                'priority'    => 'medium',
            ]);

        $pendingRegs = MemberRegistration::where('status', MemberRegistration::STATUS_PENDING)
            ->latest()
            ->get()
            ->map(fn ($mr) => [
                'id'          => $mr->id,
                'type'        => 'Member Registration',
                'requestedBy' => trim("{$mr->first_name} {$mr->last_name}"),
                'date'        => $mr->created_at->format('M d, Y'),
                'priority'    => 'low',
            ]);

        return inertia('Superadmin/Approvals', [
            'approvals' => $pendingLoans->merge($pendingRegs)->values(),
        ]);
    }

    public function settings()
    {
        return inertia('Superadmin/Settings', [
            'settings' => [
                'lendingRate'        => 3,
                'caRate'             => 2,
                'latePenalty'        => 50,
                'managerLimit'       => 50000,
                'bodThreshold'       => 80,
                'migsMinScore'       => 50,
                'dividendAllocation' => 70,
            ],
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'lendingRate'        => ['required', 'numeric', 'min:0', 'max:100'],
            'caRate'             => ['required', 'numeric', 'min:0', 'max:100'],
            'latePenalty'        => ['required', 'numeric', 'min:0'],
            'managerLimit'       => ['required', 'numeric', 'min:0'],
            'bodThreshold'       => ['required', 'numeric', 'min:0', 'max:100'],
            'migsMinScore'       => ['required', 'numeric', 'min:0'],
            'dividendAllocation' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        // TODO: persist to system_settings table when created
        activity()->causedBy(auth()->user())
            ->log('System settings updated');

        return back()->with('success', 'Settings saved successfully.');
    }

    public function audit(Request $request)
    {
        $query = \Spatie\Activitylog\Models\Activity::with('causer')
            ->latest();

        if ($request->filled('action') && $request->action !== 'all') {
            $query->where('description', 'like', '%' . $request->action . '%');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('causer', fn ($q) => $q->where('email', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%"));
            });
        }

        $logs = $query->paginate(20)->through(function ($log) {
            return [
                'id'           => $log->id,
                'action'       => $log->description,
                'performed_by' => $log->causer?->email ?? 'System',
                'target'       => $log->subject_type
                    ? class_basename($log->subject_type) . ' #' . $log->subject_id
                    : 'System',
                'ip_address'   => request()->ip(),
                'created_at'   => $log->created_at->format('M d, Y h:i A'),
                'type'         => $this->getLogType($log->description),
            ];
        });

        return inertia('Superadmin/Audit', [
            'logs'    => $logs,
            'filters' => $request->only(['search', 'action']),
        ]);
    }

    private function getLogType(string $description): string
    {
        $lower = strtolower($description);
        if (str_contains($lower, 'created') || str_contains($lower, 'registered') || str_contains($lower, 'approved')) return 'created';
        if (str_contains($lower, 'updated') || str_contains($lower, 'changed')) return 'updated';
        if (str_contains($lower, 'deleted') || str_contains($lower, 'removed')) return 'deleted';
        return 'login';
    }

    public function annualReports()
    {
        return inertia('Superadmin/AnnualReports', [
            'meetings' => \App\Models\AnnualMeeting::latest('date')->get(),
        ]);
    }

    public function storeAnnualReport(Request $request)
    {
        $validated = $request->validate([
            'topic'      => ['required', 'string', 'max:255'],
            'host'       => ['required', 'string', 'max:255'],
            'date'       => ['required', 'date'],
            'time_start' => ['required', 'date_format:H:i'],
            'time_end'   => ['nullable', 'date_format:H:i', 'after:time_start'],
            'status'     => ['required', 'in:scheduled,completed,cancelled'],
            'overview'   => ['nullable', 'string'],
        ]);

        \App\Models\AnnualMeeting::create($validated);

        return redirect()->route('superadmin.reports.annual')
            ->with('success', 'Annual meeting report created.');
    }

    public function downloadAnnualReport(\App\Models\AnnualMeeting $meeting)
    {
        $content  = "KSCFMPC Annual Meeting Report\n";
        $content .= "========================\n\n";
        $content .= "Topic:      {$meeting->topic}\n";
        $content .= "Host:       {$meeting->host}\n";
        $content .= "Date:       {$meeting->date->format('F d, Y')}\n";
        $content .= "Time:       {$meeting->time_start}" . ($meeting->time_end ? " – {$meeting->time_end}" : '') . "\n";
        $content .= "Status:     " . ucfirst($meeting->status) . "\n";
        if ($meeting->overview) {
            $content .= "\nOverview:\n{$meeting->overview}\n";
        }

        $filename = 'annual-meeting-' . $meeting->date->format('Y-m-d') . '.txt';

        return response($content, 200, [
            'Content-Type'        => 'text/plain',
            'Content-Disposition' => "attachment; filename={$filename}",
        ]);
    }

    public function financialReports(Request $request)
    {
        $year = (int) $request->input('year', now()->year);

        // Total loans released (sum of principal across all loans)
        $totalLoansReleased = \App\Models\Loan::sum('principal_amount');

        // Total collections (all loan payments received)
        $totalCollections = \App\Models\LoanPayment::sum('amount_paid');

        // TODO: wire once Member model has savings_balance column
        $totalSavings = 0;

        // TODO: wire once Member model has share_capital column
        $totalCapitalShares = 0;

        // Monthly summary for selected year (only months with activity)
        $monthlySummary = collect(range(1, 12))->map(function ($month) use ($year) {
            $loansReleased = \App\Models\Loan::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('principal_amount');
            $collections = \App\Models\LoanPayment::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('amount_paid');
            return [
                'month'          => \Carbon\Carbon::create($year, $month)->format('M Y'),
                'loans_released' => (float) $loansReleased,
                'collections'    => (float) $collections,
                'net'            => (float) $collections - (float) $loansReleased,
            ];
        })->filter(fn ($m) => $m['loans_released'] > 0 || $m['collections'] > 0)->values();

        // Loan status breakdown (from LoanRequest — has pending/approved/rejected statuses)
        $loanStatusBreakdown = [
            'pending'      => \App\Models\LoanRequest::where('status', 'pending')->count(),
            'approved'     => \App\Models\LoanRequest::where('status', 'approved')->count(),
            'rejected'     => \App\Models\LoanRequest::where('status', 'rejected')->count(),
            'bod_approval' => \App\Models\LoanRequest::where('status', 'for_bod_approval')->count(),
        ];

        // Recent loan payments (last 10)
        $recentPayments = \App\Models\LoanPayment::with(['loan.borrower'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($p) => [
                'id'             => $p->id,
                'member_name'    => optional(optional($p->loan)->borrower)->name ?? '—',
                'principal_amount' => optional($p->loan)->principal_amount ?? 0,
                'amount_paid'    => $p->amount_paid,
                'payment_date'   => $p->payment_date,
            ]);

        // Available years for the year filter
        $availableYears = range(now()->year, max(now()->year - 3, 2020));

        return inertia('Superadmin/FinancialReports', [
            'totalLoansReleased'  => (float) $totalLoansReleased,
            'totalCollections'    => (float) $totalCollections,
            'totalSavings'        => (float) $totalSavings,
            'totalCapitalShares'  => (float) $totalCapitalShares,
            'monthlySummary'      => $monthlySummary,
            'loanStatusBreakdown' => $loanStatusBreakdown,
            'recentPayments'      => $recentPayments,
            'currentYear'         => $year,
            'availableYears'      => $availableYears,
        ]);
    }

    public function members()
    {
        return inertia('Superadmin/Members', [
            'members' => User::where('role', 'member')
                ->select(['id', 'name', 'email', 'email_verified_at', 'created_at'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function loans()
    {
        return inertia('Superadmin/Loans', []);
    }
}
