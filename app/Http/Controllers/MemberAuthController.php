<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanRequest;
use App\Models\SavingsAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MemberAuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Attempt authentication
        if (Auth::attempt($credentials, false)) {
            $user = Auth::user();

            // Only allow users with the 'member' role
            if ($user->role !== 'member') {
                Auth::logout();

                return back()->withErrors([
                    'auth' => 'Invalid credentials. Please contact staff if you need help.',
                ])->onlyInput('email');
            }

            $request->session()->regenerate();

            return redirect()->intended(route('member.dashboard'));
        }

        return back()->withErrors([
            'auth' => 'Invalid credentials. Please contact staff if you need help.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        $activeLoanCount = Loan::where('member_id', $user->id)
            ->where('status', 'active')
            ->count();

        $pendingPayments = Loan::where('member_id', $user->id)
            ->where('status', 'active')
            ->sum('remaining_balance');

        $savingsBalance = SavingsAccount::where('user_id', $user->id)
            ->sum('balance');

        $loanRequests = LoanRequest::where('requested_by', $user->id)
            ->orderByDesc('requested_at')
            ->get()
            ->map(function (LoanRequest $loanRequest) {
                return [
                    'id' => $loanRequest->id,
                    'amount' => (string) $loanRequest->amount,
                    'purpose' => $loanRequest->purpose,
                    'status' => $loanRequest->status,
                    'requested_at' => $loanRequest->requested_at?->toDateString(),
                    'term_months' => $loanRequest->term_months,
                    'interest_rate' => $loanRequest->interest_rate,
                    'requested_by' => [
                        'id' => $loanRequest->requestedBy?->id,
                        'name' => $loanRequest->requestedBy?->name,
                        'email' => $loanRequest->requestedBy?->email,
                    ],
                ];
            });

        return inertia('member/dashboard', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'activeLoanCount' => $activeLoanCount,
            'pendingPayments' => $pendingPayments,
            'savingsBalance' => $savingsBalance,
            'loanRequests' => $loanRequests,
        ]);
    }
}
