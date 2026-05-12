<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanAmortization;
use App\Models\LoanRequest;
use App\Models\Member;
use Illuminate\Http\Request;

class LoanRequestController extends Controller
{
    /**
     * Approve a loan request (Admin — amount ≤ ₱50,000 only).
     */
    public function approve(Request $request, LoanRequest $loanRequest)
    {
        $managerLimit = 50000;

        if ($loanRequest->amount > $managerLimit) {
            return back()->withErrors(['error' => 'This loan exceeds ₱50,000. Please escalate to BOD.']);
        }

        if (! in_array($loanRequest->status, ['pending', 'for_bod_approval'])) {
            return back()->withErrors(['error' => 'This request cannot be approved in its current status.']);
        }

        $loanRequest->update([
            'status'      => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        $loan = Loan::create([
            'member_id'         => $loanRequest->requested_by,
            'loan_request_id'   => $loanRequest->id,
            'principal_amount'  => $loanRequest->amount,
            'remaining_balance' => $loanRequest->amount,
            'interest_rate'     => $loanRequest->interest_rate ?? 3,
            'term_months'       => $loanRequest->term_months ?? 12,
            'total_payable'     => $this->computeTotalPayable(
                $loanRequest->amount,
                $loanRequest->interest_rate ?? 3,
                $loanRequest->term_months ?? 12
            ),
            'status'            => 'active',
        ]);

        $this->generateAmortization($loan);

        $member = Member::where('user_id', $loanRequest->requested_by)->first();
        if ($member) {
            app(\App\Services\MigsScoreService::class)->recalculate($member);
        }

        activity()->causedBy(auth()->user())
            ->performedOn($loanRequest)
            ->log('Loan Request #' . $loanRequest->id . ' approved — ₱' . number_format($loanRequest->amount, 2));

        return back()->with('success', 'Loan approved and activated. Amortization schedule generated.');
    }

    /**
     * Reject a loan request.
     */
    public function reject(Request $request, LoanRequest $loanRequest)
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
            ->log('Loan Request #' . $loanRequest->id . ' rejected — Reason: ' . $validated['rejection_reason']);

        return back()->with('success', 'Loan request rejected.');
    }

    /**
     * Escalate a loan request to BOD.
     */
    public function escalate(Request $request, LoanRequest $loanRequest)
    {
        $validated = $request->validate([
            'escalation_notes' => 'nullable|string|max:500',
        ]);

        $loanRequest->update([
            'status'           => 'for_bod_approval',
            'escalation_notes' => $validated['escalation_notes'] ?? 'Escalated to BOD for review.',
            'reviewed_by'      => auth()->id(),
            'reviewed_at'      => now(),
        ]);

        activity()->causedBy(auth()->user())
            ->performedOn($loanRequest)
            ->log('Loan Request #' . $loanRequest->id . ' escalated to BOD — Amount: ₱' . number_format($loanRequest->amount, 2));

        return back()->with('success', 'Loan request escalated to BOD for approval.');
    }

    /**
     * Admin creates a loan request on behalf of a member.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id'     => 'required|exists:members,id',
            'amount'        => 'required|numeric|min:1000',
            'loan_type'     => 'required|in:regular,emergency,educational,livelihood,housing,agricultural',
            'purpose'       => 'required|string|max:255',
            'term_months'   => 'required|integer|min:1|max:120',
            'interest_rate' => 'required|numeric|min:0|max:100',
        ]);

        $member = Member::find($validated['member_id']);
        if (! $member?->user_id) {
            return back()->withErrors(['member_id' => 'This member does not have a linked user account.']);
        }

        $status = $validated['amount'] > 50000 ? 'for_bod_approval' : 'pending';

        $loanRequest = LoanRequest::create([
            'amount'        => $validated['amount'],
            'loan_type'     => $validated['loan_type'],
            'purpose'       => $validated['purpose'],
            'term_months'   => $validated['term_months'],
            'interest_rate' => $validated['interest_rate'],
            'requested_by'  => $member->user_id,
            'requested_at'  => now()->toDateString(),
            'status'        => $status,
        ]);

        activity()->causedBy(auth()->user())
            ->performedOn($loanRequest)
            ->log('Loan Request created for Member #' . $validated['member_id'] . ' — ₱' . number_format($validated['amount'], 2));

        $msg = 'Loan request created.';
        if ($status === 'for_bod_approval') {
            $msg .= ' Auto-escalated to BOD (amount > ₱50,000).';
        }

        return back()->with('success', $msg);
    }

    /**
     * Public wrapper so SuperadminController can call the same logic.
     */
    public function generateAmortizationPublic(Loan $loan): void
    {
        $this->generateAmortization($loan);
    }

    // ─── Private Helpers ───────────────────────────────────────────────────────

    private function computeTotalPayable(float $principal, float $monthlyRate, int $termMonths): float
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

    private function generateAmortization(Loan $loan): void
    {
        $principal   = (float) $loan->principal_amount;
        $monthlyRate = ((float) ($loan->interest_rate ?? 3)) / 100;
        $termMonths  = (int) ($loan->term_months ?? 12);

        if ($monthlyRate > 0) {
            $monthlyPayment = $principal * ($monthlyRate * pow(1 + $monthlyRate, $termMonths))
                / (pow(1 + $monthlyRate, $termMonths) - 1);
        } else {
            $monthlyPayment = $principal / $termMonths;
        }

        $balance   = $principal;
        $startDate = now()->addMonth();

        for ($i = 1; $i <= $termMonths; $i++) {
            $interestPart  = round($balance * $monthlyRate, 2);
            $principalPart = round($monthlyPayment - $interestPart, 2);

            // Last payment: clear remaining balance to avoid rounding drift
            if ($i === $termMonths) {
                $principalPart = $balance;
            }

            $balance = round($balance - $principalPart, 2);

            LoanAmortization::create([
                'loan_id'       => $loan->id,
                'due_date'      => $startDate->copy()->addMonths($i - 1)->format('Y-m-d'),
                'amount_to_pay' => round($monthlyPayment, 2),
                'principal_part'=> $principalPart,
                'interest_part' => $interestPart,
                'status'        => 'pending',
            ]);
        }
    }
}
