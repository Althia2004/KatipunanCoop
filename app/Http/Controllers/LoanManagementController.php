<?php

namespace App\Http\Controllers;

use App\Models\LoanRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoanManagementController extends Controller
{
    public function index(): Response
    {
        $loanRequests = LoanRequest::with('requestedBy')->get()->map(function (LoanRequest $loanRequest) {
            return [
                'id' => $loanRequest->id,
                'amount' => $loanRequest->amount,
                'purpose' => $loanRequest->purpose,
                'status' => $loanRequest->status,
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
            'purpose' => ['nullable', 'string', 'max:500'],
        ]);

        LoanRequest::create([
            'amount' => $request->input('amount'),
            'purpose' => $request->input('purpose'),
            'requested_by' => $request->user()->id,
            'requested_at' => now()->toDateString(),
            'status' => LoanRequest::STATUS_PENDING,
        ]);

        return redirect()->route('loan.management');
    }

    public function approve(LoanRequest $loanRequest)
    {
        $user = request()->user();

        abort_unless($user?->isSuperadmin(), 403);
        abort_unless($loanRequest->status === LoanRequest::STATUS_PENDING, 403);

        $status = (float) $loanRequest->amount <= 50000
            ? LoanRequest::STATUS_APPROVED
            : LoanRequest::STATUS_FOR_BOD_APPROVAL;

        $loanRequest->update([
            'status' => $status,
        ]);

        return redirect()->route('loan.management');
    }
}
