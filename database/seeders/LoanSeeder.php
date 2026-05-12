<?php

namespace Database\Seeders;

use App\Http\Controllers\LoanRequestController;
use App\Models\Loan;
use App\Models\LoanRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class LoanSeeder extends Seeder
{
    public function run(): void
    {
        $juan  = User::where('email', '09171234567@kscf.local')->first();
        $pedro = User::where('email', '09190001111@kscf.local')->first();
        $admin = User::where('role', 'admin')->first();

        if (! $juan || ! $pedro) {
            $this->command->warn('Member users not found — run MemberSeeder first.');
            return;
        }

        // ── Juan's active loan ────────────────────────────────────────────────
        $request1 = LoanRequest::create([
            'requested_by' => $juan->id,
            'amount'       => 50000.00,
            'purpose'      => 'Fertilizer and Seed Procurement',
            'term_months'  => 12,
            'interest_rate'=> 3.00,
            'status'       => LoanRequest::STATUS_APPROVED,
            'requested_at' => now()->subMonths(2)->toDateString(),
            'reviewed_by'  => $admin?->id,
            'reviewed_at'  => now()->subMonths(2)->addDays(2),
        ]);

        $loan1 = Loan::create([
            'member_id'         => $juan->id,
            'loan_request_id'   => $request1->id,
            'principal_amount'  => 50000.00,
            'interest_rate'     => 3.00,
            'term_months'       => 12,
            'total_payable'     => 52500.00,
            'remaining_balance' => 35000.00,
            'status'            => 'active',
        ]);

        // Generate amortization schedule for Juan's loan
        try {
            app(LoanRequestController::class)->generateAmortizationPublic($loan1);
        } catch (\Exception $e) {
            $this->command->warn('Could not generate amortization: ' . $e->getMessage());
        }

        // ── Pedro's defaulted loan ────────────────────────────────────────────
        $request2 = LoanRequest::create([
            'requested_by' => $pedro->id,
            'amount'       => 20000.00,
            'purpose'      => 'Personal Expense',
            'term_months'  => 24,
            'interest_rate'=> 10.00,
            'status'       => LoanRequest::STATUS_APPROVED,
            'requested_at' => now()->subMonths(6)->toDateString(),
            'reviewed_by'  => $admin?->id,
            'reviewed_at'  => now()->subMonths(6)->addDays(1),
        ]);

        Loan::create([
            'member_id'         => $pedro->id,
            'loan_request_id'   => $request2->id,
            'principal_amount'  => 20000.00,
            'interest_rate'     => 10.00,
            'term_months'       => 24,
            'total_payable'     => 22000.00,
            'remaining_balance' => 22000.00,
            'status'            => 'arrears',
        ]);
    }
}
