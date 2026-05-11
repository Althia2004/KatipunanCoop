<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Loan;
use App\Models\LoanAmortization;
use App\Models\LoanPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    /**
     * Index: Get approved members only (ADMIN USE)
     */
    public function index(): JsonResponse
    {
        $members = Member::where('status', Member::STATUS_APPROVED)
            ->latest()
            ->get();

        return response()->json([
            'data' => $members,
        ]);
    }

    /**
     * Pending: Get pending members only (SUPERADMIN USE)
     */
    public function pending(): JsonResponse
    {
        $members = Member::where('status', Member::STATUS_PENDING)
            ->latest()
            ->get();

        return response()->json([
            'data' => $members,
        ]);
    }

    /**
     * Store: Create a new member (status = pending)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female,other',
            'start_date' => 'nullable|date',
            'standing' => 'required|string|max:255',
            'membership_status' => 'required|in:good,warning,non-compliant',
        ]);

        $member = Member::create([
            ...$validated,
            'status' => Member::STATUS_PENDING,
        ]);

        return response()->json([
            'data' => $member,
            'message' => 'Member created successfully.',
        ], 201);
    }

    /**
     * Update: Update an existing member
     */
    public function update(Request $request, Member $member): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'gender' => 'sometimes|in:male,female,other',
            'start_date' => 'sometimes|nullable|date',
            'standing' => 'sometimes|string|max:255',
            'membership_status' => 'sometimes|in:good,warning,non-compliant',
        ]);

        $member->update($validated);

        return response()->json([
            'data' => $member,
            'message' => 'Member updated successfully.',
        ]);
    }

    /**
     * Destroy: Delete a member
     */
    public function destroy(Member $member): JsonResponse
    {
        $member->delete();

        return response()->json([
            'message' => 'Member deleted successfully.',
        ]);
    }

    /**
     * Approve: Set status to approved
     */
    public function approve(Member $member): JsonResponse
    {
        $member->update(['status' => Member::STATUS_APPROVED]);

        return response()->json([
            'data' => $member,
            'message' => 'Member approved successfully.',
        ]);
    }

    /**
     * Reject: Set status to rejected
     */
    public function reject(Member $member): JsonResponse
    {
        $member->update(['status' => Member::STATUS_REJECTED]);

        return response()->json([
            'data' => $member,
            'message' => 'Member rejected successfully.',
        ]);
    }

    // ── Inertia page ──────────────────────────────────────────────────────────

    /**
     * Render the Member Management Inertia page with member data as props.
     */
    public function memberManagement(): Response
    {
        $members = Member::whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])
            ->with('memberRegistration:id,first_name,last_name,contact_number,source_of_income,date_of_birth,address_street,address_barangay,address_city,gender')
            ->latest()
            ->get()
            ->map(fn ($m) => [
                'id'                  => $m->id,
                'name'                => $m->name,
                'first_name'          => $m->memberRegistration?->first_name ?? '',
                'last_name'           => $m->memberRegistration?->last_name ?? '',
                'contact_number'      => $m->memberRegistration?->contact_number ?? '',
                'source_of_income'    => $m->memberRegistration?->source_of_income ?? '',
                'date_of_birth'       => $m->memberRegistration?->date_of_birth?->format('M d, Y') ?? null,
                'address'             => $m->memberRegistration
                    ? trim(implode(', ', array_filter([
                        $m->memberRegistration->address_street,
                        $m->memberRegistration->address_barangay,
                        $m->memberRegistration->address_city,
                    ])))
                    : '',
                'gender'              => $m->memberRegistration?->gender ?? $m->gender ?? '—',
                'status'              => $m->status,
                'membership_status'   => $m->membership_status,
                'standing'            => $m->standing,
                'start_date'          => $m->start_date?->format('M d, Y'),
                'last_login'          => $m->last_login?->format('M d, Y g:i A'),

                // ── Real-time financial data ──
                'migs_score'          => (int) ($m->migs_score ?? 0),
                'migs_classification' => $m->migs_classification ?? 'non_migs',
                'share_capital'       => (float) ($m->share_capital ?? 0),
                'savings_balance'     => (float) ($m->savings_balance ?? 0),
                'copra_sales_ytd'     => (float) ($m->copra_sales_ytd ?? 0),

                // ── Loan history ──
                'loans' => Loan::where('member_id', $m->user_id ?? 0)
                    ->select('id', 'principal_amount', 'remaining_balance', 'status', 'created_at')
                    ->latest()
                    ->get()
                    ->map(fn ($l) => [
                        'id'                => $l->id,
                        'principal_amount'  => (float) $l->principal_amount,
                        'remaining_balance' => (float) $l->remaining_balance,
                        'status'            => $l->status,
                        'created_at'        => $l->created_at->format('M d, Y'),
                    ]),
            ]);

        return Inertia::render('User/MemberManagement', [
            'members' => $members->values(),
        ]);
    }

    /**
     * Update member's editable fields (Inertia PATCH).
     */
    public function updateMember(Request $request, Member $member): RedirectResponse
    {
        $validated = $request->validate([
            'first_name'       => 'required|string|max:255',
            'last_name'        => 'required|string|max:255',
            'contact_number'   => 'required|string|max:20',
            'source_of_income' => 'nullable|string|max:255',
        ]);

        $fullName = trim($validated['first_name'] . ' ' . $validated['last_name']);
        $member->update(['name' => $fullName]);

        if ($member->memberRegistration) {
            $member->memberRegistration->update([
                'first_name'       => $validated['first_name'],
                'last_name'        => $validated['last_name'],
                'contact_number'   => $validated['contact_number'],
                'source_of_income' => $validated['source_of_income'],
            ]);
        }

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Member record updated');

        return back()->with('success', 'Member updated successfully.');
    }

    public function updateMigsScore(Request $request, Member $member): RedirectResponse
    {
        $validated = $request->validate([
            'migs_score'          => 'required|integer|min:0|max:100',
            'migs_classification' => 'required|in:migs,non_migs',
        ]);

        $member->update([
            'migs_score'          => $validated['migs_score'],
            'migs_classification' => $validated['migs_classification'],
            'migs_calculated_at'  => now(),
        ]);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('MIGS score manually updated to ' . $validated['migs_score'] . '/100 (' . $validated['migs_classification'] . ')');

        return back()->with('success', 'MIGS score updated to ' . $validated['migs_score'] . '/100.');
    }

    public function recalculateMigsScore(Member $member): RedirectResponse
    {
        $result = app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('MIGS score recalculated: ' . $result->migs_score . '/100');

        return back()->with('success', 'MIGS score recalculated: ' . $result->migs_score . '/100.');
    }

    /**
     * Toggle member status between active and suspended (Inertia PATCH).
     */
    public function toggleStatus(Member $member): RedirectResponse
    {
        $newStatus = $member->status === Member::STATUS_SUSPENDED
            ? Member::STATUS_ACTIVE
            : Member::STATUS_SUSPENDED;

        $member->update(['status' => $newStatus]);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Member status changed to ' . $newStatus);

        return back()->with('success', 'Member status updated to ' . $newStatus . '.');
    }

    /**
     * Request member deletion — sets status to pending_deletion (Inertia PATCH).
     */
    public function requestDeletion(Member $member): RedirectResponse
    {
        abort_if($member->status === Member::STATUS_PENDING_DELETION, 422, 'Deletion already requested.');

        $member->update(['status' => Member::STATUS_PENDING_DELETION]);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Member deletion requested — awaiting superadmin approval');

        return back()->with('success', 'Deletion request submitted. Awaiting Superadmin approval.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AMORTIZATION SCHEDULES
    // ─────────────────────────────────────────────────────────────────────────

    public function amortization(Request $request): Response
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = LoanAmortization::with(['loan.borrower'])
            ->orderBy('due_date', 'asc');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->whereHas('loan.borrower', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $amortizations = $query->paginate(20)->through(fn ($a) => [
            'id'             => $a->id,
            'loan_id'        => $a->loan_id,
            'member_name'    => $a->loan?->borrower?->name ?? '—',
            'due_date'       => $a->due_date,
            'amount_to_pay'  => $a->amount_to_pay,
            'principal_part' => $a->principal_part,
            'interest_part'  => $a->interest_part,
            'status'         => $a->status,
            'paid_at'        => $a->updated_at?->format('M d, Y'),
        ]);

        $stats = [
            'total'   => LoanAmortization::count(),
            'pending' => LoanAmortization::where('status', 'pending')->count(),
            'paid'    => LoanAmortization::where('status', 'paid')->count(),
            'overdue' => LoanAmortization::where('status', 'overdue')->count(),
        ];

        return Inertia::render('User/Amortization', [
            'amortizations' => $amortizations,
            'stats'         => $stats,
            'filters'       => ['search' => $search, 'status' => $status],
        ]);
    }

    public function downloadAmortization(): HttpResponse
    {
        $rows = LoanAmortization::with(['loan.borrower'])->orderBy('due_date')->get();

        $csv = implode(',', ['Member Name', 'Loan ID', 'Due Date', 'Amount Due', 'Principal Part', 'Interest Part', 'Status', 'Paid At']) . "\n";
        foreach ($rows as $a) {
            $csv .= implode(',', [
                '"' . ($a->loan?->borrower?->name ?? '') . '"',
                $a->loan_id,
                $a->due_date,
                $a->amount_to_pay,
                $a->principal_part,
                $a->interest_part,
                $a->status,
                $a->status === 'paid' ? $a->updated_at?->format('Y-m-d') : '',
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="amortization_schedules.csv"',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SAVINGS INTEREST
    // ─────────────────────────────────────────────────────────────────────────

    public function savingsInterest(Request $request): Response
    {
        $year   = (int) $request->input('year', now()->year);
        $caRate = 2;

        $members = Member::with('memberRegistration')
            ->whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])
            ->get()
            ->map(fn ($m) => [
                'id'              => $m->id,
                'name'            => $m->name,
                'savings_balance' => (float) $m->savings_balance,
                'share_capital'   => (float) $m->share_capital,
                'interest_earned' => round((float) $m->savings_balance * ($caRate / 100), 2),
                'year'            => $year,
                'status'          => $m->status,
            ]);

        return Inertia::render('User/SavingsInterest', [
            'members'          => $members->values(),
            'year'             => $year,
            'caRate'           => $caRate,
            'totalMembers'     => $members->count(),
            'totalSavings'     => $members->sum('savings_balance'),
            'totalInterest'    => $members->sum('interest_earned'),
            'availableYears'   => range(now()->year, now()->year - 5),
        ]);
    }

    public function downloadSavingsInterest(Request $request): HttpResponse
    {
        $year   = (int) $request->input('year', now()->year);
        $caRate = 2;
        $rows   = Member::whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])->get();

        $csv = implode(',', ['Member Name', 'Savings Balance', 'Interest Rate (%)', 'Interest Earned', 'Status', 'Year']) . "\n";
        foreach ($rows as $m) {
            $interest = round((float) $m->savings_balance * ($caRate / 100), 2);
            $csv .= implode(',', [
                '"' . $m->name . '"',
                $m->savings_balance,
                $caRate,
                $interest,
                $m->status,
                $year,
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"savings_interest_{$year}.csv\"",
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DIVIDEND REPORTS
    // ─────────────────────────────────────────────────────────────────────────

    public function dividendReports(Request $request): Response
    {
        $year         = (int) $request->input('year', now()->year);
        $totalCapital = (float) (Member::sum('share_capital') ?? 0);

        $members = Member::with('memberRegistration')
            ->whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])
            ->get()
            ->map(fn ($m) => [
                'id'              => $m->id,
                'name'            => $m->name,
                'share_capital'   => (float) $m->share_capital,
                'capital_pct'     => $totalCapital > 0
                    ? round(((float) $m->share_capital / $totalCapital) * 100, 2)
                    : 0,
                'dividend_amount' => 0,
                'status'          => 'tentative',
                'year'            => $year,
            ]);

        return Inertia::render('User/DividendReports', [
            'members'        => $members->values(),
            'year'           => $year,
            'totalCapital'   => $totalCapital,
            'totalMembers'   => $members->count(),
            'availableYears' => range(now()->year, now()->year - 5),
        ]);
    }

    public function downloadDividendReports(Request $request): HttpResponse
    {
        $year         = (int) $request->input('year', now()->year);
        $totalCapital = (float) (Member::sum('share_capital') ?? 0);
        $rows         = Member::whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])->get();

        $csv = implode(',', ['Member Name', 'Share Capital', 'Capital %', 'Dividend Amount', 'Year', 'Status']) . "\n";
        foreach ($rows as $m) {
            $pct = $totalCapital > 0 ? round(((float) $m->share_capital / $totalCapital) * 100, 2) : 0;
            $csv .= implode(',', [
                '"' . $m->name . '"',
                $m->share_capital,
                $pct,
                0,
                $year,
                'tentative',
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"dividend_reports_{$year}.csv\"",
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATRONAGE REPORTS
    // ─────────────────────────────────────────────────────────────────────────

    public function patronageReports(Request $request): Response
    {
        $year        = (int) $request->input('year', now()->year);
        $totalCopra  = (float) (Member::sum('copra_sales_ytd') ?? 0);

        $members = Member::with('memberRegistration')
            ->whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])
            ->get()
            ->map(fn ($m) => [
                'id'               => $m->id,
                'name'             => $m->name,
                'share_capital'    => (float) $m->share_capital,
                'copra_sales'      => (float) $m->copra_sales_ytd,
                'patronage_amount' => (float) $m->patronage_amount,
                'status'           => 'tentative',
                'year'             => $year,
            ]);

        return Inertia::render('User/PatronageReports', [
            'members'        => $members->values(),
            'year'           => $year,
            'totalPatronage' => (float) (Member::sum('patronage_amount') ?? 0),
            'totalCopra'     => $totalCopra,
            'totalMembers'   => $members->count(),
            'isReleased'     => false,
            'availableYears' => range(now()->year, now()->year - 5),
        ]);
    }

    public function requestPatronageRelease(Request $request): RedirectResponse
    {
        activity()->causedBy(auth()->user())
            ->log('Patronage annual release requested for year ' . now()->year);

        return back()->with('success', 'Annual patronage release request submitted successfully.');
    }

    public function downloadPatronage(Request $request): HttpResponse
    {
        $year = (int) $request->input('year', now()->year);
        $rows = Member::whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])->get();

        $csv = implode(',', ['Member Name', 'Share Capital', 'Copra Sales YTD', 'Patronage Amount', 'Year', 'Status']) . "\n";
        foreach ($rows as $m) {
            $csv .= implode(',', [
                '"' . $m->name . '"',
                $m->share_capital,
                $m->copra_sales_ytd,
                $m->patronage_amount,
                $year,
                'tentative',
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"patronage_reports_{$year}.csv\"",
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAYMENT DASHBOARD
    // ─────────────────────────────────────────────────────────────────────────

    public function payments(Request $request): Response
    {
        $search = $request->input('search', '');
        $method = $request->input('method', '');

        // Build both name maps from a single Member query
        $allMembers = Member::with('memberRegistration')->get();

        // user_id → name  (for loan payments: loans.member_id = users.id)
        $nameByUserId = $allMembers
            ->whereNotNull('user_id')
            ->mapWithKeys(function ($m) {
                $name = trim(
                    ($m->memberRegistration?->first_name ?? '') . ' ' .
                    ($m->memberRegistration?->last_name  ?? '')
                ) ?: $m->name;
                return [$m->user_id => $name];
            });

        // member_id → name  (for capital share: cst.member_id = members.id)
        $nameByMemberId = $allMembers->mapWithKeys(function ($m) {
            $name = trim(
                ($m->memberRegistration?->first_name ?? '') . ' ' .
                ($m->memberRegistration?->last_name  ?? '')
            ) ?: $m->name;
            return [$m->id => $name];
        });

        // ── Loan Payments ──
        $loanQuery = LoanPayment::with(['loan', 'recordedBy', 'updatedBy'])
            ->orderBy('payment_date', 'desc');

        if ($method && $method !== 'all') {
            $loanQuery->where('payment_method', $method);
        }

        if ($search) {
            $matchedUserIds = $nameByUserId
                ->filter(fn ($n) => str_contains(strtolower($n), strtolower($search)))
                ->keys();
            $loanQuery->whereHas('loan', fn ($q) => $q->whereIn('member_id', $matchedUserIds));
        }

        $loanRows = $loanQuery->get()->map(fn ($p) => [
            'id'               => $p->id,
            'loan_id'          => $p->loan_id,
            'member_name'      => $nameByUserId[$p->loan?->member_id] ?? '—',
            'amount_paid'      => (float) $p->amount_paid,
            'payment_date'     => $p->payment_date ?? '1970-01-01',
            'payment_method'   => $p->payment_method,
            'payment_type'     => $p->payment_type,
            'reference_number' => $p->reference_number,
            'remarks'          => $p->remarks,
            'recorded_by_name' => $p->recordedBy?->name ?? '—',
            'updated_by_name'  => $p->updatedBy?->name,
            'recorded_at'      => $p->created_at?->format('M d, Y g:i A'),
            'updated_at'       => $p->updated_at?->format('M d, Y g:i A'),
            'category'         => 'loan',
        ]);

        // ── Capital Share Transactions ──
        $capitalRows = collect();
        try {
            $cstQuery = \App\Models\CapitalShareTransaction::with('recorder')
                ->where('type', 'credit')
                ->latest();

            if ($search) {
                $matchedMemberIds = $nameByMemberId
                    ->filter(fn ($n) => str_contains(strtolower($n), strtolower($search)))
                    ->keys();
                $cstQuery->whereIn('member_id', $matchedMemberIds);
            }

            $capitalRows = $cstQuery->get()->map(fn ($t) => [
                'id'               => $t->id,
                'loan_id'          => null,
                'member_name'      => $nameByMemberId[$t->member_id] ?? '—',
                'amount_paid'      => (float) $t->amount,
                'payment_date'     => $t->created_at->toDateString(),
                'payment_method'   => 'Cash',
                'payment_type'     => 'onsite',
                'reference_number' => null,
                'remarks'          => $t->remarks,
                'recorded_by_name' => $t->recorder?->name ?? 'Staff',
                'updated_by_name'  => null,
                'recorded_at'      => $t->created_at->format('M d, Y g:i A'),
                'updated_at'       => null,
                'category'         => 'capital_share',
            ]);
        } catch (\Exception $e) {}

        // ── Merge, sort descending, format date, paginate ──
        $allRows = collect([...$loanRows, ...$capitalRows])
            ->sortByDesc('payment_date')
            ->values()
            ->map(fn ($p) => array_merge($p, [
                'payment_date' => \Carbon\Carbon::parse($p['payment_date'])->format('M d, Y'),
            ]));

        $page     = max(1, (int) $request->input('page', 1));
        $perPage  = 20;
        $total    = $allRows->count();
        $lastPage = (int) ceil($total / $perPage) ?: 1;
        $slice    = $allRows->forPage($page, $perPage)->values();

        // ── Stats ──
        $totalCollected = LoanPayment::sum('amount_paid');
        $onsite         = LoanPayment::where('payment_type', 'onsite')->count();
        $online         = LoanPayment::where('payment_type', 'online')->count();

        $capitalTotal = 0;
        $capitalCount = 0;
        try {
            $capitalTotal = \App\Models\CapitalShareTransaction::where('type', 'credit')->sum('amount');
            $capitalCount = \App\Models\CapitalShareTransaction::where('type', 'credit')->count();
        } catch (\Exception $e) {}

        // ── Members for dialog dropdown ──
        $borrowers = $allMembers
            ->whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])
            ->map(function ($m) {
                $name = trim(
                    ($m->memberRegistration?->first_name ?? '') . ' ' .
                    ($m->memberRegistration?->last_name  ?? '')
                ) ?: $m->name;

                $loans = Loan::where('member_id', $m->user_id ?? 0)
                    ->whereNotIn('status', ['fully_paid', 'rejected'])
                    ->select('id', 'remaining_balance', 'principal_amount', 'status')
                    ->get()
                    ->map(fn ($l) => [
                        'id'                => $l->id,
                        'remaining_balance' => (float) $l->remaining_balance,
                        'principal_amount'  => (float) $l->principal_amount,
                        'status'            => $l->status,
                    ]);

                return [
                    'id'              => $m->id,
                    'name'            => $name,
                    'share_capital'   => (float) ($m->share_capital ?? 0),
                    'savings_balance' => (float) ($m->savings_balance ?? 0),
                    'loans'           => $loans,
                ];
            })
            ->filter(fn ($m) => !empty($m['name']))
            ->values();

        return Inertia::render('User/PaymentDashboard', [
            'payments' => [
                'data'         => $slice,
                'current_page' => $page,
                'last_page'    => $lastPage,
                'total'        => $total,
                'links'        => [],
            ],
            'stats' => [
                'total'     => LoanPayment::count() + $capitalCount,
                'collected' => (float) $totalCollected + (float) $capitalTotal,
                'onsite'    => $onsite,
                'online'    => $online,
            ],
            'members' => $borrowers,
            'filters' => ['search' => $search, 'method' => $method],
        ]);
    }

    public function recordPayment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'loan_id'          => 'required|exists:loans,id',
            'amount_paid'      => 'required|numeric|min:0.01',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|in:Cash,GCash,Maya,BPI,Credit Card,Debit Card',
            'payment_type'     => 'required|in:onsite,online',
            'reference_number' => 'nullable|string|max:100',
            'remarks'          => 'nullable|string|max:500',
        ]);

        // Fetch loan first so we can check member eligibility
        $loan = Loan::findOrFail($validated['loan_id']);

        // loans.member_id = users.id → find member via user_id
        $member = Member::where('user_id', $loan->member_id)->first();

        // ── Server-side capital share check ──
        if ($member && ($member->share_capital ?? 0) < 20000) {
            return back()->withErrors([
                'loan_id' => 'Cannot record loan payment. Member\'s capital share (₱' .
                    number_format($member->share_capital ?? 0, 2) .
                    ') is below the required ₱20,000.00 minimum.',
            ]);
        }

        $validated['recorded_by'] = auth()->id();
        $payment = LoanPayment::create($validated);

        $newBalance = max(0, ((float) $loan->remaining_balance) - ((float) $validated['amount_paid']));
        $loan->update([
            'remaining_balance' => $newBalance,
            'status'            => $newBalance <= 0 ? 'fully_paid' : $loan->status,
        ]);

        if ($member) {
            app(\App\Services\MigsScoreService::class)->recalculate($member);
        }

        activity()->causedBy(auth()->user())
            ->performedOn($payment)
            ->log('Payment of ₱' . number_format($validated['amount_paid'], 2) .
                ' recorded for Loan #' . $validated['loan_id'] .
                ' via ' . $validated['payment_method']);

        return back()->with('success', 'Payment recorded successfully.');
    }

    public function recordCapitalPayment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id'        => 'required|integer|exists:members,id',
            'amount_paid'      => 'required|numeric|min:0.01',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|in:Cash,GCash,Maya,BPI,Credit Card,Debit Card',
            'payment_type'     => 'required|in:onsite,online',
            'reference_number' => 'nullable|string|max:100',
            'remarks'          => 'nullable|string|max:500',
        ]);

        $member     = Member::findOrFail($validated['member_id']);
        $newCapital = (float) ($member->share_capital ?? 0) + (float) $validated['amount_paid'];

        \App\Models\CapitalShareTransaction::create([
            'member_id'     => $member->id,
            'type'          => 'credit',
            'amount'        => $validated['amount_paid'],
            'balance_after' => $newCapital,
            'remarks'       => $validated['remarks'] ?? null,
            'recorded_by'   => auth()->id(),
        ]);

        $member->update(['share_capital' => $newCapital]);
        app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Capital share payment of ₱' . number_format($validated['amount_paid'], 2) .
                ' recorded for member #' . $member->id .
                ' via ' . $validated['payment_method']);

        return back()->with('success', 'Capital share payment recorded successfully.');
    }

    public function updatePayment(Request $request, LoanPayment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'amount_paid'      => 'required|numeric|min:0.01',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|in:Cash,GCash,Maya,BPI,Credit Card,Debit Card',
            'payment_type'     => 'required|in:onsite,online',
            'reference_number' => 'nullable|string|max:100',
            'remarks'          => 'nullable|string|max:500',
        ]);

        $payment->update(array_merge($validated, ['updated_by' => auth()->id()]));

        activity()->causedBy(auth()->user())
            ->performedOn($payment)
            ->log('Payment #' . $payment->id . ' edited by ' . auth()->user()->name);

        return back()->with('success', 'Payment updated successfully.');
    }

    public function downloadReceipt(Request $request, $id): HttpResponse
    {
        $category = $request->input('type', 'loan');

        // ── Capital Share Receipt ──
        if ($category === 'capital_share') {
            $t = \App\Models\CapitalShareTransaction::with(['member.memberRegistration'])->findOrFail($id);

            $reg        = $t->member?->memberRegistration;
            $memberName = $reg
                ? trim($reg->first_name . ' ' . $reg->last_name)
                : ($t->member?->name ?? 'N/A');
            $recorder   = \App\Models\User::find($t->recorded_by)?->name ?? 'Staff';

            $receipt = implode("\n", [
                '================================================',
                '  KATIPUNAN SMALL COCONUT FARMERS MPC',
                '      CAPITAL SHARE PAYMENT RECEIPT',
                '================================================',
                'Receipt No:     CS-' . str_pad($t->id, 6, '0', STR_PAD_LEFT),
                'Date:           ' . now()->format('M d, Y'),
                '------------------------------------------------',
                'Member:         ' . $memberName,
                'Type:           Capital Share Contribution',
                'Amount Paid:    ₱' . number_format($t->amount, 2),
                'New Balance:    ₱' . number_format($t->balance_after, 2),
                'Remarks:        ' . ($t->remarks ?? 'N/A'),
                '------------------------------------------------',
                'Recorded By:    ' . $recorder,
                'Recorded At:    ' . $t->created_at?->format('M d, Y g:i A'),
                '================================================',
                'KSCFMPC - Katipunan, Davao del Norte',
                '================================================',
            ]);

            return response($receipt, 200, [
                'Content-Type'        => 'text/plain',
                'Content-Disposition' => 'attachment; filename="capital-receipt-CS' . str_pad($t->id, 6, '0', STR_PAD_LEFT) . '.txt"',
            ]);
        }

        // ── Loan Payment Receipt ──
        $payment = LoanPayment::with(['loan', 'recordedBy'])->findOrFail($id);

        $memberName = 'N/A';
        try {
            $user       = \App\Models\User::find($payment->loan?->member_id);
            $member     = $user ? Member::where('user_id', $user->id)->with('memberRegistration')->first() : null;
            $reg        = $member?->memberRegistration;
            $memberName = $reg
                ? trim($reg->first_name . ' ' . $reg->last_name)
                : ($user?->name ?? 'N/A');
        } catch (\Exception $e) {}

        $recorder = $payment->recordedBy?->name ?? 'Staff';

        $receipt = implode("\n", [
            '================================================',
            '  KATIPUNAN SMALL COCONUT FARMERS MPC',
            '        OFFICIAL PAYMENT RECEIPT',
            '================================================',
            'Receipt No:     ' . str_pad($payment->id, 6, '0', STR_PAD_LEFT),
            'Date:           ' . now()->format('M d, Y'),
            '------------------------------------------------',
            'Member:         ' . $memberName,
            'Loan ID:        #' . $payment->loan_id,
            'Amount Paid:    ₱' . number_format($payment->amount_paid, 2),
            'Method:         ' . strtoupper($payment->payment_method ?? 'CASH'),
            'Type:           ' . strtoupper($payment->payment_type ?? 'ONSITE'),
            'Reference:      ' . ($payment->reference_number ?? 'N/A'),
            'Remarks:        ' . ($payment->remarks ?? 'N/A'),
            '------------------------------------------------',
            'Recorded By:    ' . $recorder,
            'Recorded At:    ' . $payment->created_at?->format('M d, Y g:i A'),
            '================================================',
            'KSCFMPC - Katipunan, Davao del Norte',
            '================================================',
        ]);

        return response($receipt, 200, [
            'Content-Type'        => 'text/plain',
            'Content-Disposition' => 'attachment; filename="receipt-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT) . '.txt"',
        ]);
    }
}
