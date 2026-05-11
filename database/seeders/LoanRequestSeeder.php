<?php

namespace Database\Seeders;

use App\Models\LoanRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class LoanRequestSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch existing users from MemberSeeder
        $juan = User::where('email', '09171234567@kscf.local')->first();
        $pedro = User::where('email', '09190001111@kscf.local')->first();
        $admin = User::where('role', 'admin')->first();

        if (!$juan || !$pedro) return;

        // 1. JUAN: THE EXPANSION REQUEST (Escalated)
        // Juan already has an active loan, but he's applying for a massive one.
        // This demonstrates the "For BOD Approval" business activity.
        LoanRequest::create([
            'requested_by' => $juan->id,
            'amount'       => 750000.00,
            'purpose'      => 'Acquisition of additional 2-hectare coconut farmland',
            'term_months'  => 60,
            'status'       => LoanRequest::STATUS_FOR_BOD_APPROVAL,
            'requested_at' => now()->subDays(3),
            'escalation_notes' => 'Member is in Good Standing, but total exposure exceeds Manager limit.',
            'interest_rate' => 5.00,
        ]);

        // 2. PEDRO: THE FAILED RE-APPLICATION (Rejected)
        // Since Pedro is suspended/delinquent in MemberSeeder, his new request was rejected.
        // This demonstrates the "Reject with Reason" business activity.
        LoanRequest::create([
            'requested_by' => $pedro->id,
            'amount'       => 15000.00,
            'purpose'      => 'Personal loan for household repairs',
            'term_months'  => 12,
            'status'       => LoanRequest::STATUS_REJECTED,
            'requested_at' => now()->subDays(10),
            'reviewed_by'  => $admin?->id,
            'reviewed_at'  => now()->subDays(9),
            'rejection_reason' => 'Application denied due to current suspended membership status and existing defaulted loan.',
            'interest_rate' => 12.00,
        ]);

        // 3. JUAN: THE SMALL TOOLS REQUEST (Pending)
        // A second, smaller request to show how multiple "Pending" items look.
        LoanRequest::create([
            'requested_by' => $juan->id,
            'amount'       => 5000.00,
            'purpose'      => 'Replacement of 10 Harvesting Scythes (Kawit)',
            'term_months'  => 3,
            'status'       => LoanRequest::STATUS_PENDING,
            'requested_at' => now(),
            'interest_rate' => 2.00,
        ]);
    }
}