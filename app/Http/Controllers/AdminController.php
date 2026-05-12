<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\SavingsTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Total savings and capital
        $totalSavings = Member::whereIn('status', ['approved', 'active'])->sum('savings_balance');
        $totalCapital = Member::whereIn('status', ['approved', 'active'])->sum('share_capital');
        $totalMembers = Member::whereIn('status', ['approved', 'active'])->count();

        // Monthly savings interest calculation (assuming 3% annual interest)
        $annualInterestRate = 0.03; // 3%
        $monthlyInterestRate = $annualInterestRate / 12;
        $monthlyInterest = $totalSavings * $monthlyInterestRate;

        // Recent savings transactions (deposits/withdrawals)
        $recentSavingsTransactions = SavingsTransaction::with('member')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($t) => [
                'id'            => $t->id,
                'member_name'   => $t->member->name,
                'type'          => $t->type,
                'amount'        => (float) $t->amount,
                'balance_after' => (float) $t->balance_after,
                'remarks'       => $t->remarks,
                'created_at'    => $t->created_at->format('M d, Y'),
            ]);

        // Monthly savings summary for current year
        $currentYear = now()->year;
        $monthlySavingsSummary = collect(range(1, 12))->map(function ($month) use ($currentYear) {
            $deposits = SavingsTransaction::where('type', 'deposit')
                ->whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $month)
                ->sum('amount');

            $withdrawals = SavingsTransaction::where('type', 'withdrawal')
                ->whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $month)
                ->sum('amount');

            return [
                'month'       => \Carbon\Carbon::create($currentYear, $month)->format('M'),
                'deposits'    => (float) $deposits,
                'withdrawals' => (float) $withdrawals,
                'net_change'  => (float) $deposits - (float) $withdrawals,
            ];
        });

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_savings'      => (float) $totalSavings,
                'total_capital'      => (float) $totalCapital,
                'total_members'      => $totalMembers,
                'monthly_interest'   => (float) $monthlyInterest,
                'annual_interest'    => (float) ($totalSavings * $annualInterestRate),
            ],
            'recent_savings_transactions' => $recentSavingsTransactions,
            'monthly_savings_summary'     => $monthlySavingsSummary,
        ]);
    }
}