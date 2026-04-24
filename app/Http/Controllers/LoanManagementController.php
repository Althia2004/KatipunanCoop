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
            'requested_at' => ['required', 'date'],
        ]);

        LoanRequest::create([
            'amount' => $request->input('amount'),
            'requested_by' => $request->user()->id,
            'requested_at' => $request->input('requested_at'),
            'status' => LoanRequest::STATUS_PENDING,
        ]);

        return redirect()->route('loan.management');
    }
}
