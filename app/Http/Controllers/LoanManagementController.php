<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoanManagementController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        abort_unless($user?->isSuperadmin() || $user?->isAdmin(), 403);

        $loanRequests = LoanRequest::with('requestedBy')->get()->map(function (LoanRequest $loanRequest) {
            return [
                'id' => $loanRequest->id,
                'amount' => $loanRequest->amount,
                'purpose' => $loanRequest->purpose,
                'status' => $loanRequest->status,
                'term_months' => $loanRequest->term_months,
                'interest_rate' => $loanRequest->interest_rate, // Now being passed to React
                'requested_at' => $loanRequest->requested_at?->toDateString(),
                'requested_by' => [
                    'id' => $loanRequest->requestedBy?->id,
                    'name' => $loanRequest->requestedBy?->name,
                    'email' => $loanRequest->requestedBy?->email,
                ],
            ];
        });

        return Inertia::render('Loan/Management', ['loanRequestsFromDb' => $loanRequests]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'term' => ['required', 'integer', 'min:1'],
            'purpose' => ['nullable', 'string', 'max:500'],
        ]);

        LoanRequest::create([
            'amount' => $request->input('amount'),
            'purpose' => $request->input('purpose'),
            'term_months' => $request->input('term'),
            'requested_by' => $request->user()->id,
            'requested_at' => now()->toDateString(),
            'status' => LoanRequest::STATUS_PENDING,
            'interest_rate' => 1.00, // Default starting rate
        ]);

        return redirect()->route('member.dashboard', ['tab' => 'loan-application'])
            ->with('success', 'Loan request submitted successfully.');
    }

    public function approve(LoanRequest $loanRequest, Request $request)
    {
        $user = $request->user();

        abort_unless($user?->isSuperadmin() || $user?->isAdmin(), 403);
        abort_unless($loanRequest->status === LoanRequest::STATUS_PENDING, 403);

        $validated = $request->validate([
            'interest_rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $status = (float) $loanRequest->amount <= 50000
            ? LoanRequest::STATUS_APPROVED
            : LoanRequest::STATUS_FOR_BOD_APPROVAL;

        $loanRequest->update([
            'status' => $status,
            'interest_rate' => $validated['interest_rate'], // Save the edited rate
        ]);

        if ($status === LoanRequest::STATUS_APPROVED) {
            $loanRequest->createLoanFromRequest();
        }

        return redirect()->route('loan.management');
    }

    public function active(): Response
    {
        $user = request()->user();
        abort_unless($user?->isSuperadmin() || $user?->isAdmin(), 403);

        $activeLoans = Loan::with(['borrower', 'loanRequest'])
            ->where('status', 'active')
            ->get()
            ->map(function (Loan $loan) {
                return [
                    'id' => $loan->id,
                    'member' => [
                        'id' => $loan->borrower?->id,
                        'name' => $loan->borrower?->name,
                        'email' => $loan->borrower?->email,
                    ],
                    'loan_request_id' => $loan->loan_request_id,
                    'principal_amount' => $loan->principal_amount,
                    'interest_rate' => $loan->interest_rate,
                    'total_payable' => $loan->total_payable,
                    'remaining_balance' => $loan->remaining_balance,
                    'status' => $loan->status,
                ];
            });

        return Inertia::render('Loan/ActiveLoans', ['activeLoansFromDb' => $activeLoans]);
    }
}