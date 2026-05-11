<?php

namespace Database\Seeders;

use App\Models\Loan;
use App\Models\LoanRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class LoanSeeder extends Seeder
{
    public function run(): void
    {
        $juan = User::where('email', '09171234567@kscf.local')->first();
        $pedro = User::where('email', '09190001111@kscf.local')->first();

        if (!$juan || !$pedro) return;

        // 1. ACTIVE LOAN
        $request1 = LoanRequest::create([
            'requested_by' => $juan->id, // Match migration column name
            'amount' => 50000.00,
            'purpose' => 'Fertilizer and Seed Procurement',
            'term_months' => 12,
            'status' => 'approved',
            'requested_at' => now(),    // Required by migration
        ]);

        Loan::create([
            'member_id' => $juan->id,
            'loan_request_id' => $request1->id,
            'principal_amount' => 50000.00,
            'interest_rate' => 5.00,
            'term_months' => 12,
            'total_payable' => 52500.00,
            'remaining_balance' => 35000.00,
            'status' => 'active',
        ]);

        // 2. DEFAULTED LOAN
        $request2 = LoanRequest::create([
            'requested_by' => $pedro->id, // Match migration column name
            'amount' => 20000.00,
            'purpose' => 'Personal Expense',
            'term_months' => 24,
            'status' => 'approved',
            'requested_at' => now()->subMonths(6),
        ]);

        Loan::create([
            'member_id' => $pedro->id,
            'loan_request_id' => $request2->id,
            'principal_amount' => 20000.00,
            'interest_rate' => 10.00,
            'term_months' => 24,
            'total_payable' => 22000.00,
            'remaining_balance' => 22000.00,
            'status' => 'defaulted',
        ]);
    }
}