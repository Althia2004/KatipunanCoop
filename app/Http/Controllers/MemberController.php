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
    public function index(): JsonResponse
    {
        $members = Member::where('status', Member::STATUS_APPROVED)->latest()->get();
        return response()->json(['data' => $members]);
    }

    public function pending(): JsonResponse
    {
        $members = Member::where('status', Member::STATUS_PENDING)->latest()->get();
        return response()->json(['data' => $members]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'gender'            => 'required|in:male,female,other',
            'start_date'        => 'nullable|date',
            'standing'          => 'required|string|max:255',
            'membership_status' => 'required|in:good,warning,non-compliant',
        ]);

        $member = Member::create([...$validated, 'status' => Member::STATUS_PENDING]);

        return response()->json(['data' => $member, 'message' => 'Member created successfully.'], 201);
    }

    public function update(Request $request, Member $member): JsonResponse
    {
        $validated = $request->validate([
            'name'              => 'sometimes|string|max:255',
            'gender'            => 'sometimes|in:male,female,other',
            'start_date'        => 'sometimes|nullable|date',
            'standing'          => 'sometimes|string|max:255',
            'membership_status' => 'sometimes|in:good,warning,non-compliant',
        ]);

        $member->update($validated);
        return response()->json(['data' => $member, 'message' => 'Member updated successfully.']);
    }

    public function destroy(Member $member): JsonResponse
    {
        $member->delete();
        return response()->json(['message' => 'Member deleted successfully.']);
    }

    public function approve(Member $member): JsonResponse
    {
        $member->update(['status' => Member::STATUS_APPROVED]);
        return response()->json(['data' => $member, 'message' => 'Member approved successfully.']);
    }

    public function reject(Member $member): JsonResponse
    {
        $member->update(['status' => Member::STATUS_REJECTED]);
        return response()->json(['data' => $member, 'message' => 'Member rejected successfully.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MEMBER MANAGEMENT PAGE
    // ─────────────────────────────────────────────────────────────────────────

    public function memberManagement(): Response
    {
        $members = Member::whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])
            ->with([
                'memberRegistration:id,first_name,last_name,contact_number,source_of_income,date_of_birth,address_street,address_barangay,address_city,gender',
                'user',
            ])
            ->latest()
            ->get()
            ->map(fn ($m) => [
                'id'                 => $m->id,
                'name'               => $m->name,
                'first_name'         => $m->memberRegistration?->first_name ?? '',
                'last_name'          => $m->memberRegistration?->last_name ?? '',
                'contact_number'     => $m->memberRegistration?->contact_number ?? '',
                'source_of_income'   => $m->memberRegistration?->source_of_income ?? '',
                'date_of_birth'      => $m->memberRegistration?->date_of_birth?->format('M d, Y') ?? null,
                'address'            => $m->memberRegistration
                    ? trim(implode(', ', array_filter([
                        $m->memberRegistration->address_street,
                        $m->memberRegistration->address_barangay,
                        $m->memberRegistration->address_city,
                    ])))
                    : '',
                'gender'             => $m->memberRegistration?->gender ?? $m->gender ?? '—',
                'status'             => $m->status,
                'membership_status'  => $m->membership_status,
                'standing'           => $m->standing,
                'start_date'         => $m->start_date?->format('M d, Y'),
                'last_login'         => $m->last_login?->format('M d, Y g:i A'),
                // Real-time financial data
                'migs_score'         => (int) ($m->migs_score ?? 0),
                'migs_classification'=> $m->migs_classification ?? 'non_migs',
                'share_capital'      => (float) ($m->share_capital ?? 0),
                'savings_balance'    => (float) ($m->savings_balance ?? 0),
                'copra_sales_ytd'    => (float) ($m->copra_sales_ytd ?? 0),
                // Loan history
                'loans' => Loan::where('member_id', $m->user_id ?? 0)
                    ->select('id', 'principal_amount', 'remaining_balance', 'status', 'created_at')
                    ->latest()
                    ->get()
                    ->map(fn($l) => [
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

        activity()->causedBy(auth()->user())->performedOn($member)->log('Member record updated');

        return back()->with('success', 'Member updated successfully.');
    }

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

        $query = LoanAmortization::with(['loan.borrower'])->orderBy('due_date', 'asc');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->whereHas('loan.borrower', fn($q) => $q->where('name', 'like', "%{$search}%"));
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

        return Inertia::render('User/Amortization', [
            'amortizations' => $amortizations,
            'stats' => [
                'total'   => LoanAmortization::count(),
                'pending' => LoanAmortization::where('status', 'pending')->count(),
                'paid'    => LoanAmortization::where('status', 'paid')->count(),
                'overdue' => LoanAmortization::where('status', 'overdue')->count(),
            ],
            'filters' => ['search' => $search, 'status' => $status],
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
            'members'        => $members->values(),
            'year'           => $year,
            'caRate'         => $caRate,
            'totalMembers'   => $members->count(),
            'totalSavings'   => $members->sum('savings_balance'),
            'totalInterest'  => $members->sum('interest_earned'),
            'availableYears' => range(now()->year, now()->year - 5),
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
        $year       = (int) $request->input('year', now()->year);
        $totalCopra = (float) (Member::sum('copra_sales_ytd') ?? 0);

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

        $query = LoanPayment::with(['loan.borrower', 'recordedBy', 'updatedBy'])
            ->orderBy('payment_date', 'desc');

        if ($method && $method !== 'all') {
            $query->where('payment_method', $method);
        }

        if ($search) {
            $query->whereHas('loan.borrower', fn($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $payments = $query->paginate(20)->through(fn ($p) => [
            'id'               => $p->id,
            'loan_id'          => $p->loan_id,
            'member_name'      => $p->loan?->borrower?->name ?? '—',
            'amount_paid'      => $p->amount_paid,
            'payment_date'     => $p->payment_date,
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

        // ── Fix: Use Member model for real names ──
        $borrowers = Member::with(['memberRegistration'])
            ->whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])
            ->get()
            ->map(fn ($m) => [
                'id'              => $m->id,
                'name'            => trim(
                    ($m->memberRegistration?->first_name ?? '') . ' ' .
                    ($m->memberRegistration?->last_name  ?? '')
                ) ?: $m->name,
                'share_capital'   => (float) ($m->share_capital ?? 0),
                'savings_balance' => (float) ($m->savings_balance ?? 0),
                'loans'           => Loan::where('member_id', $m->user_id ?? 0)
                    ->whereNotIn('status', ['fully_paid', 'rejected'])
                    ->select('id', 'remaining_balance', 'principal_amount', 'status')
                    ->get()
                    ->map(fn($l) => [
                        'id'                => $l->id,
                        'remaining_balance' => (float) $l->remaining_balance,
                        'principal_amount'  => (float) $l->principal_amount,
                        'status'            => $l->status,
                    ]),
            ])
            ->filter(fn ($m) => !empty($m['name']))
            ->values();

        return Inertia::render('User/PaymentDashboard', [
            'payments' => $payments,
            'stats'    => [
                'total'     => LoanPayment::count(),
                'collected' => LoanPayment::sum('amount_paid'),
                'onsite'    => LoanPayment::where('payment_type', 'onsite')->count(),
                'online'    => LoanPayment::where('payment_type', 'online')->count(),
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

        $validated['recorded_by'] = auth()->id();

        $payment  = LoanPayment::create($validated);
        $loan     = Loan::findOrFail($validated['loan_id']);
        $newBalance = max(0, ((float) $loan->remaining_balance) - ((float) $validated['amount_paid']));

        $loan->update([
            'remaining_balance' => $newBalance,
            'status'            => $newBalance <= 0 ? 'fully_paid' : $loan->status,
        ]);

        // Recalculate MIGS using user_id link
        $member = Member::where('user_id', $loan->member_id)->first();
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

    public function recordCapitalSharePayment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id'        => 'required|exists:members,id',
            'amount'           => 'required|numeric|min:1',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|in:Cash,GCash,Maya,BPI,Credit Card,Debit Card',
            'payment_type'     => 'required|in:onsite,online',
            'reference_number' => 'nullable|string|max:100',
            'remarks'          => 'nullable|string|max:500',
        ]);

        $member     = Member::findOrFail($validated['member_id']);
        $newCapital = ($member->share_capital ?? 0) + $validated['amount'];
        $member->update(['share_capital' => $newCapital]);

        // Record capital share transaction if model exists
        try {
            \App\Models\CapitalShareTransaction::create([
                'member_id'        => $member->id,
                'type'             => 'contribution',
                'amount'           => $validated['amount'],
                'balance_after'    => $newCapital,
                'reference'        => $validated['reference_number'] ?? null,
                'notes'            => $validated['remarks'] ?? 'Direct capital share contribution',
                'recorded_by'      => auth()->id(),
                'transaction_date' => $validated['payment_date'],
            ]);
        } catch (\Exception $e) {
            // Table may not exist yet — skip
        }

        // Recalculate MIGS
        app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Capital share payment of ₱' . number_format($validated['amount'], 2) .
                ' recorded for ' . $member->name .
                ' via ' . $validated['payment_method']);

        return back()->with('success', 'Capital share payment recorded. New balance: ₱' . number_format($newCapital, 2));
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

    public function downloadReceipt(LoanPayment $payment): HttpResponse
    {
        $payment->load(['loan.member', 'recordedBy']);
        $memberName = $payment->loan?->member?->name ?? 'N/A';
        $recorder   = $payment->recordedBy?->name ?? 'N/A';

        $receipt = implode("\n", [
            '================================================',
            'KATIPUNAN SMALL COCONUT FARMERS MPC',
            '        OFFICIAL PAYMENT RECEIPT',
            '================================================',
            'Receipt No:     ' . str_pad($payment->id, 6, '0', STR_PAD_LEFT),
            'Date:           ' . now()->format('M d, Y'),
            '------------------------------------------------',
            'Member:         ' . $memberName,
            'Loan ID:        #' . $payment->loan_id,
            'Amount Paid:    ₱' . number_format($payment->amount_paid, 2),
            'Method:         ' . strtoupper($payment->payment_method),
            'Type:           ' . strtoupper($payment->payment_type),
            'Reference:      ' . ($payment->reference_number ?: 'N/A'),
            '------------------------------------------------',
            'Recorded By:    ' . $recorder,
            'Recorded At:    ' . $payment->created_at?->format('M d, Y g:i A'),
            '================================================',
            'KSCFMPC - Katipunan, Davao del Norte',
            '================================================',
        ]);

        return response($receipt, 200, [
            'Content-Type'        => 'text/plain',
            'Content-Disposition' => "attachment; filename=\"receipt_{$payment->id}.txt\"",
        ]);
    }
}