<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanRequest;
use App\Models\LoanPayment;
use App\Models\CapitalShareTransaction;
use App\Models\Member;
use App\Services\MigsScoreService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LoanManagementController extends Controller
{
    /**
     * Original Loan Management Index
     */
    public function index(): Response
    {
        $loanRequests = LoanRequest::with(['requestedBy', 'reviewer'])->latest()->get()->map(function (LoanRequest $loanRequest) {
            return [
                'id'               => $loanRequest->id,
                'amount'           => $loanRequest->amount,
                'purpose'          => $loanRequest->purpose,
                'status'           => $loanRequest->status,
                'term_months'      => $loanRequest->term_months,
                'interest_rate'    => $loanRequest->interest_rate,
                'rejection_reason' => $loanRequest->rejection_reason,
                'escalation_notes' => $loanRequest->escalation_notes,
                'reviewed_by'      => $loanRequest->reviewer?->name,
                'reviewed_at'      => $loanRequest->reviewed_at
                    ? Carbon::parse($loanRequest->reviewed_at)->format('M d, Y')
                    : null,
                'requested_at'     => $loanRequest->requested_at?->toDateString(),
                'requested_by'     => [
                    'id'    => $loanRequest->requestedBy?->id,
                    'name'  => $loanRequest->requestedBy?->name,
                    'email' => $loanRequest->requestedBy?->email,
                ],
            ];
        });

        $members = Member::with('memberRegistration')
            ->whereIn('status', ['approved', 'active'])
            ->orderBy('name')
            ->get()
            ->map(fn ($m) => [
                'id'   => $m->id,
                'name' => $m->name,
            ]);

        return Inertia::render('Loan/Management', [
            'loanRequestsFromDb' => $loanRequests,
            'members'            => $members,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount'  => ['required', 'numeric', 'min:1'],
            'term'    => ['required', 'integer', 'min:1'],
            'purpose' => ['nullable', 'string', 'max:500'],
        ]);

        LoanRequest::create([
            'amount'        => $request->input('amount'),
            'purpose'       => $request->input('purpose'),
            'term_months'   => $request->input('term'),
            'requested_by'  => $request->user()->id,
            'requested_at'  => now()->toDateString(),
            'status'        => LoanRequest::STATUS_PENDING,
            'interest_rate' => 1.00,
        ]);

        return redirect()->route('loan.management');
    }

    /**
     * Original Approval Logic
     */
    public function approve(LoanRequest $loanRequest, Request $request)
    {
        $user = $request->user();

        abort_unless($user?->isSuperadmin(), 403);
        abort_unless($loanRequest->status === LoanRequest::STATUS_PENDING, 403);

        $validated = $request->validate([
            'interest_rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $status = (float) $loanRequest->amount <= 50000
            ? LoanRequest::STATUS_APPROVED
            : LoanRequest::STATUS_FOR_BOD_APPROVAL;

        $loanRequest->update([
            'status'        => $status,
            'interest_rate' => $validated['interest_rate'],
        ]);

        if ($status === LoanRequest::STATUS_APPROVED) {
            $loanRequest->createLoanFromRequest();
        }

        return redirect()->route('loan.management');
    }

    public function reject(LoanRequest $loanRequest, Request $request)
    {
        abort_unless($request->user()?->isSuperadmin(), 403);
        
        abort_unless(in_array($loanRequest->status, [
            LoanRequest::STATUS_PENDING, 
            LoanRequest::STATUS_FOR_BOD_APPROVAL
        ]), 403);

        $loanRequest->update([
            'status' => 'rejected',
        ]);

        return redirect()->route('loan.management');
    }

    /**
     * Original Active Loans View
     */
    public function active(): Response
    {
        $user = request()->user();
        abort_unless($user?->isSuperadmin() || $user?->isAdmin(), 403);

        $activeLoans = Loan::with(['borrower', 'loanRequest'])
            ->where('status', 'active')
            ->get()
            ->map(function (Loan $loan) {
                return [
                    'id'                => $loan->id,
                    'member'            => [
                        'id'    => $loan->borrower?->id,
                        'name'  => $loan->borrower?->name,
                        'email' => $loan->borrower?->email,
                    ],
                    'loan_request_id'   => $loan->loan_request_id,
                    'principal_amount'  => $loan->principal_amount,
                    'interest_rate'     => $loan->interest_rate,
                    'total_payable'     => $loan->total_payable,
                    'remaining_balance' => $loan->remaining_balance,
                    'status'            => $loan->status,
                ];
            });

        return Inertia::render('Loan/ActiveLoans', ['activeLoansFromDb' => $activeLoans]);
    }

    /* -------------------------------------------------------------------------- */
    /* UNIFIED PAYMENT & CAPITAL SHARE METHODS                                    */
    /* -------------------------------------------------------------------------- */

    public function paymentDashboard(Request $request): Response
    {
        $search = $request->input('search', '');
        $method = $request->input('method', '');
        $perPage = 20;
        $page    = (int) $request->input('page', 1);

        $loanPayments    = LoanPayment::with(['loan.borrower', 'recordedBy'])->latest()->get();
        $capitalPayments = CapitalShareTransaction::with(['member', 'recorder'])->latest()->get();

        $stats = [
            'total'   => $loanPayments->count() + $capitalPayments->count(),
            'collected' => (float) $loanPayments->sum('amount_paid') + (float) $capitalPayments->sum('amount'),
            'onsite'  => $loanPayments->where('payment_method', 'Cash')->count()
                       + $capitalPayments->where('type', 'credit')->count(),
            'online'  => $loanPayments->whereIn('payment_method', ['GCash', 'Maya', 'BPI', 'Credit Card', 'Debit Card'])->count(),
        ];

        $allTransactions = $loanPayments->map(fn ($p) => [
            'id'               => $p->id,
            'loan_id'          => $p->loan_id,
            'member_name'      => $p->loan?->borrower?->name ?? 'N/A',
            'amount_paid'      => (float) $p->amount_paid,
            'payment_date'     => $p->payment_date ?? $p->created_at->toDateString(),
            'payment_method'   => $p->payment_method ?? 'Cash',
            'payment_type'     => $p->payment_type ?? 'onsite',
            'reference_number' => $p->reference_number,
            'remarks'          => $p->remarks,
            'recorded_by_name' => $p->recordedBy?->name ?? 'System',
            'updated_by_name'  => null,
            'recorded_at'      => $p->created_at->format('M d, Y'),
            'updated_at'       => $p->updated_at->format('M d, Y'),
            'category'         => 'loan',
        ])->concat($capitalPayments->map(fn ($c) => [
            'id'               => 'cs-' . $c->id,
            'loan_id'          => null,
            'member_name'      => $c->member?->name ?? 'N/A',
            'amount_paid'      => (float) $c->amount,
            'payment_date'     => $c->created_at->toDateString(),
            'payment_method'   => 'Cash',
            'payment_type'     => 'onsite',
            'reference_number' => null,
            'remarks'          => $c->remarks,
            'recorded_by_name' => $c->recorder?->name ?? 'System',
            'updated_by_name'  => null,
            'recorded_at'      => $c->created_at->format('M d, Y'),
            'updated_at'       => $c->updated_at->format('M d, Y'),
            'category'         => 'capital_share',
        ]));

        if ($search) {
            $allTransactions = $allTransactions->filter(
                fn ($t) => str_contains(strtolower($t['member_name']), strtolower($search))
            );
        }
        if ($method) {
            $allTransactions = $allTransactions->filter(fn ($t) => $t['payment_method'] === $method);
        }

        $sorted = $allTransactions->sortByDesc('payment_date')->values();
        $total  = $sorted->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $sliced   = $sorted->slice(($page - 1) * $perPage, $perPage)->values();

        $baseUrl = url('/user/payments');
        $links   = [];
        for ($i = 1; $i <= $lastPage; $i++) {
            $links[] = [
                'url'    => $baseUrl . '?page=' . $i . ($search ? '&search=' . urlencode($search) : '') . ($method ? '&method=' . urlencode($method) : ''),
                'label'  => (string) $i,
                'active' => $i === $page,
            ];
        }

        $paginated = [
            'data'         => $sliced,
            'current_page' => $page,
            'last_page'    => $lastPage,
            'total'        => $total,
            'links'        => $links,
        ];

        $members = Member::whereIn('status', ['approved', 'active'])
            ->with(['loans' => fn ($q) => $q->where('status', 'active')->select('id', 'member_id', 'remaining_balance', 'status')])
            ->orderBy('name')
            ->get()
            ->map(fn ($m) => [
                'id'            => $m->id,
                'name'          => $m->name,
                'share_capital' => (float) ($m->share_capital ?? 0),
                'loans'         => $m->loans,
            ]);

        return Inertia::render('User/PaymentDashboard', [
            'stats'    => $stats,
            'payments' => $paginated,
            'members'  => $members,
            'filters'  => ['search' => $search, 'method' => $method],
        ]);
    }

    public function storePayment(Request $request)
    {
        $validated = $request->validate([
            'loan_id'          => 'required|exists:loans,id',
            'amount_paid'      => 'required|numeric|min:0.01',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|string',
            'payment_type'     => 'nullable|in:onsite,online',
            'reference_number'=> 'nullable|string|max:100',
            'remarks'          => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated, $request) {
            LoanPayment::create([
                'loan_id'          => $validated['loan_id'],
                'amount_paid'      => $validated['amount_paid'],
                'payment_method'   => $validated['payment_method'],
                'payment_date'     => $validated['payment_date'],
                'payment_type'     => $validated['payment_type'] ?? 'onsite',
                'reference_number' => $validated['reference_number'] ?? null,
                'remarks'          => $validated['remarks'] ?? null,
                'recorded_by'      => $request->user()->id,
            ]);

            Loan::find($validated['loan_id'])
                ->decrement('remaining_balance', $validated['amount_paid']);
        });

        return back()->with('success', 'Loan payment recorded successfully.');
    }

    public function storeCapitalShare(Request $request)
    {
        $validated = $request->validate([
            'member_id'       => 'required|exists:members,id',
            'amount'          => 'required|numeric|min:0.01',
            'payment_date'    => 'nullable|date',
            'payment_method'  => 'nullable|string',
            'payment_type'    => 'nullable|in:onsite,online',
            'reference_number'=> 'nullable|string|max:100',
            'remarks'         => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $member       = Member::find($validated['member_id']);
            $balanceAfter = (float) $member->share_capital + (float) $validated['amount'];

            CapitalShareTransaction::create([
                'member_id'    => $validated['member_id'],
                'amount'       => $validated['amount'],
                'type'         => 'credit',
                'balance_after'=> $balanceAfter,
                'remarks'      => $validated['remarks'] ?? null,
                'recorded_by'  => $request->user()->id,
            ]);

            $member->increment('share_capital', $validated['amount']);

            if (class_exists(MigsScoreService::class)) {
                app(MigsScoreService::class)->calculate($validated['member_id']);
            }
        });

        return back()->with('success', 'Capital share deposit recorded successfully.');
    }

    public function updatePayment(Request $request, LoanPayment $payment)
    {
        $validated = $request->validate([
            'amount_paid'      => 'required|numeric|min:0.01',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|string',
            'payment_type'     => 'nullable|in:onsite,online',
            'reference_number' => 'nullable|string|max:100',
            'remarks'          => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated, $request, $payment) {
            $diff = (float) $validated['amount_paid'] - (float) $payment->amount_paid;

            $payment->update([
                'amount_paid'      => $validated['amount_paid'],
                'payment_date'     => $validated['payment_date'],
                'payment_method'   => $validated['payment_method'],
                'payment_type'     => $validated['payment_type'] ?? $payment->payment_type,
                'reference_number' => $validated['reference_number'] ?? null,
                'remarks'          => $validated['remarks'] ?? null,
                'updated_by'       => $request->user()->id,
            ]);

            if ($diff !== 0.0 && $payment->loan_id) {
                Loan::find($payment->loan_id)->decrement('remaining_balance', $diff);
            }
        });

        return back()->with('success', 'Payment updated successfully.');
    }

    public function downloadReceipt(LoanPayment $payment)
    {
        $payment->load(['loan.borrower', 'recordedBy']);

        $loan   = $payment->loan;
        $member = $loan?->borrower;

        $data = [
            'payment_id'       => $payment->id,
            'member_name'      => $member?->name ?? 'N/A',
            'loan_id'          => $payment->loan_id,
            'amount_paid'      => number_format((float) $p->amount_paid, 2),
            'payment_date'     => $payment->payment_date,
            'payment_method'   => $payment->payment_method,
            'payment_type'     => $payment->payment_type,
            'reference_number' => $payment->reference_number,
            'remarks'          => $payment->remarks,
            'recorded_by'      => $payment->recordedBy?->name ?? 'System',
            'recorded_at'      => $payment->created_at->format('M d, Y h:i A'),
            'cooperative_name' => config('app.name', 'KSCFMPC'),
        ];

        $html = view('receipts.payment', $data)->render();

        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'inline; filename="receipt-' . $payment->id . '.html"');
    }
}