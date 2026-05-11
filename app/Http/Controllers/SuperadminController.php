<?php

namespace App\Http\Controllers;

use App\Models\Loan;
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

        $pendingRegs = MemberRegistration::whereIn('status', [
                MemberRegistration::STATUS_SEMINAR_ATTENDED,
                'for_bod_approval',
            ])
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

        $totalSavings   = (float) \App\Models\Member::whereIn('status', ['approved', 'active'])->sum('savings_balance');
        $totalCapital   = (float) \App\Models\Member::whereIn('status', ['approved', 'active'])->sum('share_capital');
        $annualRate     = 0.03;
        $monthlyInterest = round($totalSavings * ($annualRate / 12), 2);

        $monthlySavingsSummary = collect(range(1, 12))->map(function ($month) {
            $year = now()->year;
            $deposits    = \App\Models\SavingsTransaction::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->whereIn('type', ['deposit', 'credit'])
                ->sum('amount');
            $withdrawals = \App\Models\SavingsTransaction::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->whereIn('type', ['withdrawal', 'debit'])
                ->sum('amount');
            return [
                'month'       => \Carbon\Carbon::create($year, $month)->format('M'),
                'deposits'    => (float) $deposits,
                'withdrawals' => (float) $withdrawals,
                'net'         => (float) $deposits - (float) $withdrawals,
            ];
        })->values();

        $recentSavings = \App\Models\SavingsTransaction::with('member:id,name')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($t) => [
                'id'          => $t->id,
                'member_name' => $t->member?->name ?? '—',
                'type'        => $t->type,
                'amount'      => (float) $t->amount,
                'created_at'  => $t->created_at->format('M d, Y'),
            ]);

        return inertia('Superadmin/Dashboard', [
            'stats' => [
                'totalMembers'     => User::where('role', 'member')->count(),
                'pendingApprovals' => LoanRequest::where('status', LoanRequest::STATUS_PENDING)->count()
                    + MemberRegistration::whereIn('status', [
                        MemberRegistration::STATUS_SEMINAR_ATTENDED,
                        'for_bod_approval',
                    ])->count(),
                'activeStaff'      => $staff->count(),
                'systemAlerts'     => 0,
                'totalSavings'     => $totalSavings,
                'totalCapital'     => $totalCapital,
                'monthlyInterest'  => $monthlyInterest,
            ],
            'monthlySavingsSummary' => $monthlySavingsSummary,
            'recentSavings'         => $recentSavings,
            'staff'           => $staff,
            'recentApprovals' => $pendingLoans->toBase()->concat($pendingRegs->toBase())->take(5)->values(),
            'recentAudit' => \Spatie\Activitylog\Models\Activity::with('causer')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($log) => [
                    'id'          => $log->id,
                    'action'      => $log->description,
                    'performedBy' => $log->causer?->email ?? 'System',
                    'target'      => $log->subject_type
                        ? class_basename($log->subject_type) . ' #' . $log->subject_id
                        : 'System',
                    'datetime'    => $log->created_at->format('M d, Y h:i A'),
                    'type'        => $this->getLogType($log->description),
                ]),
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
                'amount'      => $lr->principal_amount,
                'requestedBy' => $lr->requestedBy?->name ?? 'Unknown',
                'date'        => $lr->created_at->format('M d, Y'),
            ]);

        $pendingRegs = MemberRegistration::whereIn('status', [
                MemberRegistration::STATUS_SEMINAR_ATTENDED,
                'for_bod_approval',
            ])
            ->latest()
            ->get()
            ->map(fn ($mr) => [
                'id'         => $mr->id,
                'full_name'  => trim("{$mr->first_name} {$mr->last_name}"),
                'address'    => trim("{$mr->address_street}, {$mr->address_barangay}, {$mr->address_city}"),
                'income'     => $mr->source_of_income,
                'date'       => $mr->created_at->format('M d, Y'),
                'status'     => $mr->status,
            ]);

        return inertia('Superadmin/Approvals', [
            'pendingLoans'         => $pendingLoans->values(),
            'pendingRegistrations' => $pendingRegs->values(),
            'pendingDeletions'     => \App\Models\Member::where('status', \App\Models\Member::STATUS_PENDING_DELETION)
                ->latest()
                ->get()
                ->map(fn ($m) => [
                    'id'      => $m->id,
                    'name'    => $m->name,
                    'contact' => $m->memberRegistration?->contact_number ?? '—',
                    'date'    => $m->updated_at->format('M d, Y'),
                    'priority' => 'High',
                ])->values(),
        ]);
    }

    public function approveRegistration(MemberRegistration $memberRegistration)
    {
        abort_if(
            !in_array($memberRegistration->status, [MemberRegistration::STATUS_SEMINAR_ATTENDED, 'for_bod_approval']),
            422,
            'Registration must have completed the seminar before approving.'
        );

        $memberRegistration->update(['status' => MemberRegistration::STATUS_APPROVED]);

        // Ensure a Member record exists and set it to approved
        \App\Models\Member::updateOrCreate(
            ['member_registration_id' => $memberRegistration->id],
            [
                'name'              => trim("{$memberRegistration->first_name} {$memberRegistration->last_name}"),
                'gender'            => $memberRegistration->gender ?? null,
                'status'            => \App\Models\Member::STATUS_APPROVED,
                'membership_status' => \App\Models\Member::MEMBERSHIP_GOOD,
                'standing'          => 'active',
                'start_date'        => now()->toDateString(),
            ]
        );

        // Create User account only if one does not already exist
        $email = preg_replace('/\s+/', '', $memberRegistration->contact_number) . '@kscf.local';
        $user  = User::where('email', $email)->first();
        if (! $user) {
            $user = User::create([
                'name'              => trim("{$memberRegistration->first_name} {$memberRegistration->last_name}"),
                'email'             => $email,
                'password'          => 'Member@' . date('Y'),
                'role'              => 'member',
                'email_verified_at' => now(),
            ]);
        }

        activity()->causedBy(auth()->user())
            ->performedOn($memberRegistration)
            ->log('Member registration approved');

        // Recalculate MIGS score and link user_id for the newly approved member
        $newMember = \App\Models\Member::where('member_registration_id', $memberRegistration->id)->first();
        if ($newMember) {
            $newMember->update(['user_id' => $user->id]);
            app(\App\Services\MigsScoreService::class)->recalculate($newMember);
        }

        return back()->with('success', 'Registration approved. Member account created.');
    }

    public function rejectRegistration(Request $request, MemberRegistration $memberRegistration)
    {
        abort_if(
            !in_array($memberRegistration->status, [MemberRegistration::STATUS_SEMINAR_ATTENDED, 'for_bod_approval']),
            422,
            'Only seminar-attended registrations can be rejected.'
        );

        $memberRegistration->update([
            'status' => MemberRegistration::STATUS_REJECTED,
            'notes'  => $request->input('reason'),
        ]);

        activity()->log("Member registration rejected: {$memberRegistration->first_name} {$memberRegistration->last_name}");

        return back()->with('success', 'Registration rejected.');
    }

    public function approveDeletion(\App\Models\Member $member)
    {
        $name = $member->name;
        $member->delete();

        activity()->causedBy(auth()->user())
            ->log('Member deletion approved — ' . $name . ' permanently removed');

        return back()->with('success', 'Member ' . $name . ' deleted successfully.');
    }

    public function rejectDeletion(\App\Models\Member $member)
    {
        $member->update(['status' => \App\Models\Member::STATUS_APPROVED]);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Member deletion rejected — ' . $member->name . ' restored to approved');

        return back()->with('success', 'Deletion request rejected. Member restored to active.');
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

        $totalSavings       = (float) \App\Models\Member::whereIn('status', ['approved', 'active'])->sum('savings_balance');
        $totalCapitalShares = (float) \App\Models\Member::whereIn('status', ['approved', 'active'])->sum('share_capital');

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
        $members = \App\Models\Member::with([
                'user',
                'memberRegistration.coMaker',
                'memberRegistration.beneficiaries',
            ])
            ->whereNotIn('status', [\App\Models\Member::STATUS_PENDING, \App\Models\Member::STATUS_REJECTED])
            ->latest()
            ->get()
            ->map(function ($m) {
                $reg  = $m->memberRegistration;
                $user = $m->user;

                // Always pass the real email — the UI decides how to display placeholder addresses
                $displayEmail = $user?->email ?? '—';

                // Account status based on real email_verified_at
                $accountStatus = $user?->email_verified_at ? 'verified'
                    : ($user ? 'unverified' : 'no_account');

                return [
                    'id'               => $m->id,
                    'name'             => $m->name,
                    'first_name'       => $reg?->first_name ?? '',
                    'last_name'        => $reg?->last_name ?? '',
                    'email'            => $displayEmail,
                    'user_id'          => $user?->id,
                    'contact_number'   => $reg?->contact_number ?? '—',
                    'source_of_income' => $reg?->source_of_income ?? '—',
                    'gender'           => $reg?->gender ?? $m->gender ?? '—',
                    'date_of_birth'    => $reg?->date_of_birth
                        ? \Carbon\Carbon::parse($reg->date_of_birth)->format('M d, Y')
                        : '—',
                    'address'          => $reg
                        ? trim(implode(', ', array_filter([
                            $reg->address_street,
                            $reg->address_barangay,
                            $reg->address_city,
                        ])))
                        : '—',
                    'member_since'     => $m->start_date?->format('M d, Y') ?? $m->created_at->format('M d, Y'),

                    // Financial — real columns from members table
                    'share_capital'    => (float) ($m->share_capital ?? 0),
                    'savings_balance'  => (float) ($m->savings_balance ?? 0),

                    // MIGS Score — real value from members table
                    'migs_score'       => $m->migs_score ?? 0,
                    'classification'   => $m->migs_classification ?? 'non_migs',

                    // Member status from members table (approved/active/suspended/…)
                    'status'           => $m->status,
                    'membership_status' => $m->membership_status,
                    'standing'         => $m->standing,

                    // Account status (verified/unverified/no_account)
                    'account_status'   => $accountStatus,

                    'co_makers'        => $reg?->coMaker ? [[
                        'id'             => $reg->coMaker->id,
                        'first_name'     => $reg->coMaker->first_name ?? '',
                        'last_name'      => $reg->coMaker->last_name ?? '',
                        'contact_number' => $reg->coMaker->contact_number ?? '—',
                        'relationship'   => $reg->coMaker->relationship ?? '—',
                    ]] : [],
                    'beneficiaries'    => $reg?->beneficiaries->map(fn ($b) => [
                        'id'             => $b->id,
                        'first_name'     => $b->first_name ?? '',
                        'last_name'      => $b->last_name ?? '',
                        'contact_number' => $b->contact_number ?? '—',
                        'relationship'   => $b->relationship ?? '—',
                    ])->toArray() ?? [],
                ];
            });

        return inertia('Superadmin/Members', [
            'members' => $members->values(),
        ]);
    }

    public function updateMember(Request $request, \App\Models\Member $member)
    {
        $reg  = $member->memberRegistration;
        $contactEmail = $reg
            ? preg_replace('/\s+/', '', $reg->contact_number) . '@kscf.local'
            : null;
        $user = $contactEmail ? User::where('email', $contactEmail)->first() : null;

        $validated = $request->validate([
            'first_name'     => 'required|string|max:255',
            'last_name'      => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email'          => ['required', 'email', Rule::unique('users', 'email')->ignore($user?->id)],
            'password'       => 'nullable|min:8',
        ]);

        // Update member's stored full name
        $fullName = trim($validated['first_name'] . ' ' . $validated['last_name']);
        $member->update(['name' => $fullName]);

        // Update registration fields
        if ($reg) {
            $reg->update([
                'first_name'     => $validated['first_name'],
                'last_name'      => $validated['last_name'],
                'contact_number' => $validated['contact_number'],
            ]);
        }

        // Update linked user account
        if ($user) {
            $accountData = ['email' => $validated['email']];
            if (!empty($validated['password'])) {
                $accountData['password'] = $validated['password'];
            }
            $user->update($accountData);
        }

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Member record updated by superadmin');

        // Recalculate MIGS after member data changes
        app(\App\Services\MigsScoreService::class)->recalculate($member);

        return back()->with('success', 'Member updated successfully.');
    }

    public function updateMemberAccount(Request $request, \App\Models\Member $member)
    {
        $user = $member->user;

        $validated = $request->validate([
            'email'    => ['required', 'email', Rule::unique('users', 'email')->ignore($user?->id)],
            'password' => 'nullable|min:8',
        ]);

        if ($user) {
            $updateData = ['email' => $validated['email']];
            if (!empty($validated['password'])) {
                $updateData['password'] = $validated['password'];
            }
            $user->update($updateData);
            activity()->causedBy(auth()->user())
                ->performedOn($member)
                ->log('Member account credentials updated by superadmin');
        }

        return back()->with('success', 'Member account updated successfully.');
    }

    public function deleteMember(\App\Models\Member $member)
    {
        $name = $member->name;

        // Find and delete linked user account
        $reg = $member->memberRegistration;
        if ($reg) {
            $email = preg_replace('/\s+/', '', $reg->contact_number) . '@kscf.local';
            User::where('email', $email)->delete();
        }

        $member->delete();

        activity()->causedBy(auth()->user())
            ->log('Member permanently deleted by superadmin — ' . $name);

        return back()->with('success', $name . ' has been permanently deleted.');
    }

    public function loans(Request $request)
    {
        $query = Loan::with(['borrower', 'loanRequest'])->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('borrower', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $loans = $query->paginate(15)->through(fn ($l) => [
            'id'            => $l->id,
            'member_name'   => $l->borrower?->name ?? 'Unknown',
            'member_id'     => $l->member_id,
            'amount'        => (float) $l->principal_amount,
            'purpose'       => $l->loanRequest?->purpose ?? '—',
            'status'        => $l->status,
            'interest_rate' => (float) $l->interest_rate,
            'term_months'   => $l->term_months,
            'balance'       => (float) $l->remaining_balance,
            'released_at'   => $l->created_at->format('M d, Y'),
        ]);

        $allLoans = Loan::all();
        $stats = [
            'total'          => $allLoans->count(),
            'active'         => $allLoans->where('status', 'active')->count(),
            'pending'        => LoanRequest::where('status', LoanRequest::STATUS_PENDING)->count(),
            'closed'         => $allLoans->where('status', 'fully_paid')->count(),
            'total_released' => (float) $allLoans->sum('principal_amount'),
        ];

        return inertia('Superadmin/Loans', [
            'loans'   => $loans,
            'stats'   => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function showLoan(Request $request, Loan $loan)
    {
        $loan->load(['borrower', 'loanRequest', 'amortizations', 'payments']);

        return response()->json([
            'id'            => $loan->id,
            'member_name'   => $loan->borrower?->name ?? 'Unknown',
            'purpose'       => $loan->loanRequest?->purpose ?? '—',
            'amount'        => (float) $loan->principal_amount,
            'term_months'   => $loan->term_months,
            'interest_rate' => (float) $loan->interest_rate,
            'total_payable' => (float) $loan->total_payable,
            'balance'       => (float) $loan->remaining_balance,
            'status'        => $loan->status,
            'released_at'   => $loan->created_at->format('M d, Y'),
            'total_paid'    => (float) $loan->payments->sum('amount_paid'),
            'amortizations' => $loan->amortizations->map(fn ($a) => [
                'id'            => $a->id,
                'due_date'      => $a->due_date,
                'amount_to_pay' => (float) $a->amount_to_pay,
                'principal_part'=> (float) $a->principal_part,
                'interest_part' => (float) $a->interest_part,
                'status'        => $a->status,
            ]),
            'payments' => $loan->payments->map(fn ($p) => [
                'id'               => $p->id,
                'amount_paid'      => (float) $p->amount_paid,
                'payment_date'     => $p->payment_date,
                'payment_method'   => $p->payment_method,
                'reference_number' => $p->reference_number,
                'remarks'          => $p->remarks,
            ]),
        ]);
    }

    public function updateLoan(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'status'        => ['required', Rule::in(['active', 'fully_paid', 'defaulted'])],
            'interest_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'term_months'   => ['required', 'integer', 'min:1', 'max:360'],
        ]);

        $loan->update($validated);

        activity()->causedBy(auth()->user())
            ->performedOn($loan)
            ->log('Loan updated by superadmin — status: ' . $validated['status']);

        return back()->with('success', 'Loan updated successfully.');
    }

    public function deleteLoan(Loan $loan)
    {
        $memberName = $loan->borrower?->name ?? 'Unknown';
        $amount     = number_format($loan->principal_amount, 2);

        $loan->delete();

        activity()->causedBy(auth()->user())
            ->log("Loan #{$loan->id} (₱{$amount}) for {$memberName} permanently deleted by superadmin");

        return back()->with('success', 'Loan deleted successfully.');
    }

    // ── MIGS Score ────────────────────────────────────────────────────────────

    public function recalculateMigs(\App\Models\Member $member)
    {
        $updated = app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('MIGS score recalculated: ' . $updated->migs_score . '/100 (' . $updated->migs_classification . ')');

        return back()->with('success', 'MIGS score updated to ' . $updated->migs_score . '/100 for ' . $member->name);
    }

    public function recalculateAllMigs()
    {
        app(\App\Services\MigsScoreService::class)->recalculateAll();

        activity()->causedBy(auth()->user())
            ->log('MIGS scores recalculated for all members');

        return back()->with('success', 'MIGS scores recalculated for all members.');
    }

    // ── Announcements ─────────────────────────────────────────────────────────

    public function announcements()
    {
        $announcements = \App\Models\Announcement::with('creator')
            ->latest()
            ->get()
            ->map(fn ($a) => [
                'id'                => $a->id,
                'title'             => $a->title,
                'content'           => $a->content,
                'category'          => $a->category,
                'status'            => $a->status,
                'announcement_date' => $a->announcement_date->format('M d, Y'),
                'created_by'        => $a->creator?->name ?? 'System',
                'created_at'        => $a->created_at->format('M d, Y'),
            ]);

        return inertia('Superadmin/Announcements', [
            'announcements' => $announcements,
            'stats' => [
                'total'     => \App\Models\Announcement::count(),
                'published' => \App\Models\Announcement::where('status', 'published')->count(),
                'draft'     => \App\Models\Announcement::where('status', 'draft')->count(),
            ],
        ]);
    }

    public function storeAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'title'             => 'required|string|max:255',
            'content'           => 'required|string',
            'category'          => 'required|in:general,meeting,copra,seminar',
            'status'            => 'required|in:draft,published',
            'announcement_date' => 'required|date',
        ]);

        $validated['created_by'] = auth()->id();

        $announcement = \App\Models\Announcement::create($validated);

        activity()->causedBy(auth()->user())
            ->performedOn($announcement)
            ->log('Announcement created: ' . $announcement->title);

        return back()->with('success', 'Announcement created successfully.');
    }

    public function updateAnnouncement(Request $request, \App\Models\Announcement $announcement)
    {
        $validated = $request->validate([
            'title'             => 'required|string|max:255',
            'content'           => 'required|string',
            'category'          => 'required|in:general,meeting,copra,seminar',
            'status'            => 'required|in:draft,published',
            'announcement_date' => 'required|date',
        ]);

        $announcement->update($validated);

        activity()->causedBy(auth()->user())
            ->performedOn($announcement)
            ->log('Announcement updated: ' . $announcement->title);

        return back()->with('success', 'Announcement updated successfully.');
    }

    public function deleteAnnouncement(\App\Models\Announcement $announcement)
    {
        $title = $announcement->title;
        $announcement->delete();

        activity()->causedBy(auth()->user())
            ->log('Announcement deleted: ' . $title);

        return back()->with('success', 'Announcement deleted.');
    }

    public function toggleAnnouncement(\App\Models\Announcement $announcement)
    {
        $newStatus = $announcement->status === 'published' ? 'draft' : 'published';
        $announcement->update(['status' => $newStatus]);

        activity()->causedBy(auth()->user())
            ->performedOn($announcement)
            ->log('Announcement ' . $newStatus . ': ' . $announcement->title);

        return back()->with('success', 'Announcement ' . $newStatus . '.');
    }

    // ── Copra Sales ───────────────────────────────────────────────────────────

    public function coproSales(Request $request)
    {
        $year = $request->query('year', now()->year);

        $members = \App\Models\Member::with(['memberRegistration', 'copraSales' => function ($q) use ($year) {
            $q->whereYear('sale_date', $year)->orderByDesc('sale_date');
        }])
        ->whereIn('status', ['approved', 'active'])
        ->orderBy('name')
        ->get()
        ->map(function ($m) use ($year) {
            $sales = $m->copraSales;
            return [
                'id'             => $m->id,
                'name'           => $m->name,
                'ytd_gross'      => (float) $sales->sum('gross_amount'),
                'ytd_net'        => (float) $sales->sum('net_amount'),
                'ytd_kilos'      => (float) $sales->sum('kilos'),
                'sales'          => $sales->map(fn ($s) => [
                    'id'               => $s->id,
                    'sale_date'        => $s->sale_date->format('M d, Y'),
                    'kilos'            => (float) $s->kilos,
                    'price_per_kilo'   => (float) $s->price_per_kilo,
                    'gross_amount'     => (float) $s->gross_amount,
                    'deduction_amount' => (float) $s->deduction_amount,
                    'deduction_type'   => $s->deduction_type,
                    'net_amount'       => (float) $s->net_amount,
                    'remarks'          => $s->remarks,
                ])->values(),
            ];
        });

        $totalGross = \App\Models\CopraSale::whereYear('sale_date', $year)->sum('gross_amount');
        $totalNet   = \App\Models\CopraSale::whereYear('sale_date', $year)->sum('net_amount');
        $totalKilos = \App\Models\CopraSale::whereYear('sale_date', $year)->sum('kilos');
        $totalTxns  = \App\Models\CopraSale::whereYear('sale_date', $year)->count();

        return inertia('Superadmin/CoproSales', [
            'members'     => $members,
            'year'        => (int) $year,
            'years'       => range(now()->year, max(2020, now()->year - 5)),
            'stats'       => [
                'total_gross'        => (float) $totalGross,
                'total_net'          => (float) $totalNet,
                'total_kilos'        => (float) $totalKilos,
                'total_transactions' => (int) $totalTxns,
            ],
        ]);
    }

    public function storeCoproSale(Request $request, \App\Models\Member $member)
    {
        $validated = $request->validate([
            'sale_date'        => 'required|date',
            'kilos'            => 'required|numeric|min:0.01',
            'price_per_kilo'   => 'required|numeric|min:0.01',
            'deduction_amount' => 'nullable|numeric|min:0',
            'deduction_type'   => 'nullable|string|in:loan_payment,savings,manual',
            'remarks'          => 'nullable|string|max:500',
        ]);

        $gross      = round($validated['kilos'] * $validated['price_per_kilo'], 2);
        $deduction  = (float) ($validated['deduction_amount'] ?? 0);
        $net        = max(0, $gross - $deduction);

        $sale = $member->copraSales()->create([
            'sale_date'        => $validated['sale_date'],
            'kilos'            => $validated['kilos'],
            'price_per_kilo'   => $validated['price_per_kilo'],
            'gross_amount'     => $gross,
            'deduction_amount' => $deduction,
            'deduction_type'   => $validated['deduction_type'] ?? null,
            'net_amount'       => $net,
            'remarks'          => $validated['remarks'] ?? null,
            'recorded_by'      => auth()->id(),
        ]);

        // Update member's copra_sales_ytd
        $ytd = $member->copraSales()->whereYear('sale_date', now()->year)->sum('gross_amount');
        $member->update(['copra_sales_ytd' => $ytd]);

        app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log("Copra sale recorded: {$validated['kilos']} kg @ ₱{$validated['price_per_kilo']}/kg = ₱{$gross} gross");

        return back()->with('success', 'Copra sale recorded.');
    }

    public function deleteCoproSale(\App\Models\CopraSale $copraSale)
    {
        $member = $copraSale->member;
        $copraSale->delete();

        // Recalculate YTD
        $ytd = $member->copraSales()->whereYear('sale_date', now()->year)->sum('gross_amount');
        $member->update(['copra_sales_ytd' => $ytd]);

        app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Copra sale deleted');

        return back()->with('success', 'Copra sale deleted.');
    }

    // ── Savings & Capital ─────────────────────────────────────────────────────

    public function savingsOverview()
    {
        $members = \App\Models\Member::with(['memberRegistration'])
            ->whereIn('status', ['approved', 'active'])
            ->orderBy('name')
            ->get()
            ->map(fn ($m) => [
                'id'              => $m->id,
                'name'            => $m->name,
                'savings_balance' => (float) ($m->savings_balance ?? 0),
                'share_capital'   => (float) ($m->share_capital ?? 0),
            ]);

        $totalSavings = \App\Models\Member::whereIn('status', ['approved', 'active'])->sum('savings_balance');
        $totalCapital = \App\Models\Member::whereIn('status', ['approved', 'active'])->sum('share_capital');
        $totalMembers = $members->count();

        return inertia('Superadmin/SavingsOverview', [
            'members' => $members,
            'stats'   => [
                'total_savings' => (float) $totalSavings,
                'total_capital' => (float) $totalCapital,
                'total_members' => (int) $totalMembers,
            ],
        ]);
    }

    public function savingsDeposit(Request $request, \App\Models\Member $member)
    {
        $validated = $request->validate([
            'amount'  => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string|max:500',
        ]);

        $newBalance = (float) ($member->savings_balance ?? 0) + (float) $validated['amount'];

        \App\Models\SavingsTransaction::create([
            'member_id'     => $member->id,
            'type'          => 'deposit',
            'amount'        => $validated['amount'],
            'balance_after' => $newBalance,
            'remarks'       => $validated['remarks'] ?? null,
            'recorded_by'   => auth()->id(),
        ]);

        $member->update(['savings_balance' => $newBalance]);
        app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log("Savings deposit: ₱{$validated['amount']}. New balance: ₱{$newBalance}");

        return back()->with('success', 'Savings deposit recorded.');
    }

    public function savingsWithdraw(Request $request, \App\Models\Member $member)
    {
        $validated = $request->validate([
            'amount'  => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string|max:500',
        ]);

        $currentBalance = (float) ($member->savings_balance ?? 0);
        if ((float) $validated['amount'] > $currentBalance) {
            return back()->withErrors(['amount' => 'Withdrawal amount exceeds savings balance.']);
        }

        $newBalance = $currentBalance - (float) $validated['amount'];

        \App\Models\SavingsTransaction::create([
            'member_id'     => $member->id,
            'type'          => 'withdrawal',
            'amount'        => $validated['amount'],
            'balance_after' => $newBalance,
            'remarks'       => $validated['remarks'] ?? null,
            'recorded_by'   => auth()->id(),
        ]);

        $member->update(['savings_balance' => $newBalance]);
        app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log("Savings withdrawal: ₱{$validated['amount']}. New balance: ₱{$newBalance}");

        return back()->with('success', 'Savings withdrawal recorded.');
    }

    public function capitalAdjust(Request $request, \App\Models\Member $member)
    {
        $validated = $request->validate([
            'type'    => 'required|in:credit,debit',
            'amount'  => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string|max:500',
        ]);

        $current = (float) ($member->share_capital ?? 0);
        $newBalance = $validated['type'] === 'credit'
            ? $current + (float) $validated['amount']
            : max(0, $current - (float) $validated['amount']);

        \App\Models\CapitalShareTransaction::create([
            'member_id'     => $member->id,
            'type'          => $validated['type'],
            'amount'        => $validated['amount'],
            'balance_after' => $newBalance,
            'remarks'       => $validated['remarks'] ?? null,
            'recorded_by'   => auth()->id(),
        ]);

        $member->update(['share_capital' => $newBalance]);
        app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log("Capital share {$validated['type']}: ₱{$validated['amount']}. New balance: ₱{$newBalance}");

        return back()->with('success', 'Capital share updated.');
    }

    public function savingsHistory(\App\Models\Member $member)
    {
        $savings = $member->savingsTransactions()
            ->with('recorder:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($t) => [
                'id'            => $t->id,
                'type'          => $t->type,
                'amount'        => (float) $t->amount,
                'balance_after' => (float) $t->balance_after,
                'remarks'       => $t->remarks,
                'recorded_by'   => $t->recorder?->name ?? '—',
                'created_at'    => $t->created_at->format('M d, Y h:i A'),
            ]);

        $capital = $member->capitalShareTransactions()
            ->with('recorder:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($t) => [
                'id'            => $t->id,
                'type'          => $t->type,
                'amount'        => (float) $t->amount,
                'balance_after' => (float) $t->balance_after,
                'remarks'       => $t->remarks,
                'recorded_by'   => $t->recorder?->name ?? '—',
                'created_at'    => $t->created_at->format('M d, Y h:i A'),
            ]);

        return response()->json([
            'member_name'     => $member->name,
            'savings_balance' => (float) ($member->savings_balance ?? 0),
            'share_capital'   => (float) ($member->share_capital ?? 0),
            'savings'         => $savings,
            'capital'         => $capital,
        ]);
    }

    // ── BOD Loan Request Approval ─────────────────────────────────────────────

    public function loanRequests(\Illuminate\Http\Request $request)
    {
        $query = \App\Models\LoanRequest::with(['requestedBy', 'reviewer'])->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('requestedBy', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('purpose', 'like', "%{$search}%");
        }

        $requests = $query->paginate(15)->through(fn ($lr) => [
            'id'               => $lr->id,
            'member_name'      => $lr->requestedBy?->name ?? '—',
            'member_id'        => $lr->requested_by,
            'amount'           => (float) $lr->amount,
            'purpose'          => $lr->purpose,
            'term_months'      => $lr->term_months,
            'interest_rate'    => $lr->interest_rate,
            'status'           => $lr->status,
            'rejection_reason' => $lr->rejection_reason,
            'escalation_notes' => $lr->escalation_notes,
            'reviewed_by'      => $lr->reviewer?->name,
            'reviewed_at'      => $lr->reviewed_at
                ? \Carbon\Carbon::parse($lr->reviewed_at)->format('M d, Y')
                : null,
            'created_at'       => $lr->created_at->format('M d, Y'),
            'is_bod_required'  => (float) $lr->amount > 50000,
        ]);

        return inertia('Superadmin/LoanRequests', [
            'requests' => $requests,
            'filters'  => $request->only(['search', 'status']),
            'stats'    => [
                'total'    => \App\Models\LoanRequest::count(),
                'pending'  => \App\Models\LoanRequest::where('status', 'pending')->count(),
                'for_bod'  => \App\Models\LoanRequest::where('status', 'for_bod_approval')->count(),
                'approved' => \App\Models\LoanRequest::where('status', 'approved')->count(),
                'rejected' => \App\Models\LoanRequest::where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function approveLoanRequest(\Illuminate\Http\Request $request, \App\Models\LoanRequest $loanRequest)
    {
        if ($loanRequest->status === 'approved') {
            return back()->withErrors(['error' => 'Already approved.']);
        }

        $loanRequest->update([
            'status'      => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        $loan = \App\Models\Loan::create([
            'member_id'         => $loanRequest->requested_by,
            'loan_request_id'   => $loanRequest->id,
            'principal_amount'  => $loanRequest->amount,
            'remaining_balance' => $loanRequest->amount,
            'interest_rate'     => $loanRequest->interest_rate ?? 3,
            'term_months'       => $loanRequest->term_months ?? 12,
            'total_payable'     => $this->computeLoanTotalPayable(
                (float) $loanRequest->amount,
                (float) ($loanRequest->interest_rate ?? 3),
                (int)   ($loanRequest->term_months ?? 12)
            ),
            'status'            => 'active',
        ]);

        app(\App\Http\Controllers\LoanRequestController::class)->generateAmortizationPublic($loan);

        $member = \App\Models\Member::where('user_id', $loanRequest->requested_by)->first();
        if ($member) {
            app(\App\Services\MigsScoreService::class)->recalculate($member);
        }

        activity()->causedBy(auth()->user())
            ->performedOn($loanRequest)
            ->log('BOD approved Loan Request #' . $loanRequest->id . ' — ₱' . number_format($loanRequest->amount, 2));

        return back()->with('success', 'Loan approved by BOD and activated.');
    }

    public function rejectLoanRequest(\Illuminate\Http\Request $request, \App\Models\LoanRequest $loanRequest)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:10|max:500',
        ]);

        $loanRequest->update([
            'status'           => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'reviewed_by'      => auth()->id(),
            'reviewed_at'      => now(),
        ]);

        activity()->causedBy(auth()->user())
            ->performedOn($loanRequest)
            ->log('BOD rejected Loan Request #' . $loanRequest->id . ' — Reason: ' . $validated['rejection_reason']);

        return back()->with('success', 'Loan request rejected by BOD.');
    }

    private function computeLoanTotalPayable(float $principal, float $monthlyRate, int $termMonths): float
    {
        $rate = $monthlyRate / 100;
        if ($rate > 0) {
            $monthly = $principal * ($rate * pow(1 + $rate, $termMonths))
                / (pow(1 + $rate, $termMonths) - 1);
        } else {
            $monthly = $principal / $termMonths;
        }

        return round($monthly * $termMonths, 2);
    }
}

