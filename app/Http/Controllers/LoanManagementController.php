<?php

namespace App\Http\Controllers;

use App\Models\LoanRequest;
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
}
