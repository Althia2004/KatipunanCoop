<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Loan;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MemberPortalController extends Controller
{
    private function getMember(): Member
    {
        $member = Member::with('memberRegistration')
            ->where('user_id', auth()->id())
            ->first();

        if (!$member) {
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                redirect()->route('member.login')
                    ->withErrors(['auth' => 'Your account is not yet linked to a member record. Please contact the cooperative office.'])
            );
        }

        return $member;
    }

    public function dashboard()
    {
        $user   = auth()->user();
        $member = $this->getMember();

        $loans = Loan::where('member_id', $user->id)
            ->with(['amortizations' => fn($q) => $q->orderBy('due_date')])
            ->get();

        $activeLoans = $loans->where('status', 'active');

        $nextDue = null;
        foreach ($activeLoans as $loan) {
            $pending = $loan->amortizations
                ->whereIn('status', ['pending', 'overdue'])
                ->sortBy('due_date')
                ->first();
            if ($pending) {
                $nextDue = [
                    'loan_id'  => $loan->id,
                    'due_date' => $pending->due_date instanceof \Carbon\Carbon
                        ? $pending->due_date->format('M d, Y')
                        : \Carbon\Carbon::parse($pending->due_date)->format('M d, Y'),
                    'amount'   => (float) ($pending->amount_to_pay ?? $pending->amount_due ?? 0),
                    'status'   => $pending->status,
                ];
                break;
            }
        }

        $recentPayments = \App\Models\LoanPayment::whereIn(
            'loan_id',
            Loan::where('member_id', $user->id)->pluck('id')
        )
        ->with('loan:id,principal_amount')
        ->orderByDesc('payment_date')
        ->take(5)
        ->get()
        ->map(fn($p) => [
            'id'               => $p->id,
            'payment_date'     => \Carbon\Carbon::parse($p->payment_date)->format('M d, Y'),
            'amount_paid'      => (float) $p->amount_paid,
            'payment_method'   => $p->payment_method,
            'reference_number' => $p->reference_number,
        ]);

        return inertia('member/dashboard', [
            'member' => [
                'name'            => $member->name,
                'migs_score'      => (int) ($member->migs_score ?? 0),
                'classification'  => $member->migs_classification ?? 'non_migs',
                'savings_balance' => (float) ($member->savings_balance ?? 0),
                'share_capital'   => (float) ($member->share_capital ?? 0),
                'copra_sales_ytd' => (float) ($member->copra_sales_ytd ?? 0),
            ],
            'stats' => [
                'active_loans'      => $activeLoans->count(),
                'total_paid'        => \App\Models\LoanPayment::whereIn(
                    'loan_id',
                    Loan::where('member_id', $user->id)->pluck('id')
                )->sum('amount_paid'),
                'remaining_balance' => (float) $activeLoans->sum('remaining_balance'),
            ],
            'next_due'        => $nextDue,
            'recent_payments' => $recentPayments,
            'user'            => ['name' => $user->name, 'email' => $user->email],
        ]);
    }

    public function loans()
    {
        $user   = auth()->user();
        $member = $this->getMember();

        // Check loan eligibility
        $eligibility = app(\App\Services\LoanEligibilityService::class)->check($member);

        $loans = Loan::where('member_id', $user->id)
            ->with([
                'amortizations' => fn($q) => $q->orderBy('due_date'),
                'amortizations.payments',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($loan) => [
                'id'                => $loan->id,
                'principal_amount'  => (float) $loan->principal_amount,
                'term_months'       => $loan->term_months,
                'interest_rate'     => (float) $loan->interest_rate,
                'total_payable'     => (float) ($loan->total_payable ?? $loan->principal_amount),
                'remaining_balance' => (float) $loan->remaining_balance,
                'status'            => $loan->status,
                'created_at'        => $loan->created_at->format('M d, Y'),
                'amortizations'     => $loan->amortizations->map(fn($a) => [
                    'id'            => $a->id,
                    'due_date'      => \Carbon\Carbon::parse($a->due_date)->format('M d, Y'),
                    'amount_to_pay' => (float) ($a->amount_to_pay ?? $a->amount_due ?? 0),
                    'principal_part'=> (float) ($a->principal_part ?? $a->principal_portion ?? 0),
                    'interest_part' => (float) ($a->interest_part ?? $a->interest_portion ?? 0),
                    'status'        => $a->status,
                    'total_paid'    => (float) $a->payments->sum('amount_paid'),
                ])->values(),
            ]);

        return inertia('member/Loans', [
            'loans'       => $loans,
            'eligibility' => $eligibility,
            'member'      => ['name' => $member->name],
            'user'        => ['name' => $user->name],
        ]);
    }

    public function savings()
    {
        $user   = auth()->user();
        $member = $this->getMember();

        $savingsHistory = $member->savingsTransactions()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($t) => [
                'id'               => $t->id,
                'type'             => $t->type,
                'amount'           => (float) $t->amount,
                'balance_after'    => (float) $t->balance_after,
                'transaction_date' => $t->transaction_date
                    ? \Carbon\Carbon::parse($t->transaction_date)->format('M d, Y')
                    : $t->created_at->format('M d, Y'),
                'notes'            => $t->notes ?? $t->remarks ?? null,
                'remarks'          => $t->remarks ?? null,
                'created_at'       => $t->created_at->format('M d, Y'),
            ]);

        $capitalHistory = $member->capitalShareTransactions()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($t) => [
                'id'               => $t->id,
                'type'             => $t->type,
                'amount'           => (float) $t->amount,
                'balance_after'    => (float) $t->balance_after,
                'transaction_date' => $t->transaction_date
                    ? \Carbon\Carbon::parse($t->transaction_date)->format('M d, Y')
                    : $t->created_at->format('M d, Y'),
                'notes'            => $t->notes ?? $t->remarks ?? null,
                'remarks'          => $t->remarks ?? null,
                'created_at'       => $t->created_at->format('M d, Y'),
            ]);

        return inertia('member/Savings', [
            'member' => [
                'name'            => $member->name,
                'savings_balance' => (float) ($member->savings_balance ?? 0),
                'share_capital'   => (float) ($member->share_capital ?? 0),
            ],
            'savings_history'      => $savingsHistory,
            'capital_history'      => $capitalHistory,
            'savings_transactions' => $savingsHistory,
            'capital_transactions' => $capitalHistory,
            'user'                 => ['name' => $user->name, 'email' => $user->email],
        ]);
    }

    public function payments()
    {
        $user   = auth()->user();
        $member = $this->getMember();

        // Loan payments
        $loanPayments = \App\Models\LoanPayment::whereIn(
            'loan_id',
            Loan::where('member_id', $user->id)->pluck('id')
        )
        ->with(['loan', 'recordedBy'])
        ->latest('payment_date')
        ->get()
        ->map(fn($p) => [
            'id'               => $p->id,
            'loan_id'          => $p->loan_id,
            'amount_paid'      => (float) $p->amount_paid,
            'payment_date'     => \Carbon\Carbon::parse($p->payment_date)->format('M d, Y'),
            'payment_method'   => $p->payment_method ?? 'cash',
            'payment_type'     => $p->payment_type ?? 'onsite',
            'reference_number' => $p->reference_number ?? null,
            'remarks'          => $p->remarks ?? null,
            'recorded_by'      => $p->recordedBy?->name ?? 'Staff',
            'category'         => 'loan',
        ]);

        // Capital share contributions
        $capitalPayments = collect();
        try {
            $capitalPayments = \App\Models\CapitalShareTransaction::where('member_id', $member->id)
                ->where('type', 'contribution')
                ->latest('transaction_date')
                ->get()
                ->map(fn($t) => [
                    'id'               => $t->id,
                    'loan_id'          => null,
                    'amount_paid'      => (float) $t->amount,
                    'payment_date'     => \Carbon\Carbon::parse($t->transaction_date)->format('M d, Y'),
                    'payment_method'   => 'cash',
                    'payment_type'     => 'onsite',
                    'reference_number' => $t->reference ?? null,
                    'remarks'          => $t->notes ?? null,
                    'recorded_by'      => 'Staff',
                    'category'         => 'capital_share',
                ]);
        } catch (\Exception $e) {
            // Table may not exist yet
        }

        $allPayments = collect([...$loanPayments, ...$capitalPayments])
            ->sortByDesc('payment_date')
            ->values();

        // Active loans for Make Payment dialog
        $activeLoans = Loan::where('member_id', $user->id)
            ->where('status', 'active')
            ->where('remaining_balance', '>', 0)
            ->get()
            ->map(fn ($l) => [
                'id'                => $l->id,
                'loan_type'         => 'Loan #' . $l->id,
                'remaining_balance' => (float) ($l->remaining_balance ?? 0),
                'principal_amount'  => (float) ($l->principal_amount ?? 0),
            ]);

        return inertia('member/Payments', [
            'member'   => [
                'name'            => $member->name,
                'savings_balance' => (float) ($member->savings_balance ?? 0),
                'share_capital'   => (float) ($member->share_capital ?? 0),
            ],
            'payments' => $allPayments,
            'loans'    => $activeLoans,
            'stats'    => [
                'total_loan_paid'    => $loanPayments->sum('amount_paid'),
                'total_capital_paid' => $capitalPayments->sum('amount_paid'),
                'total_payments'     => $allPayments->count(),
                'last_payment'       => $allPayments->first()['payment_date'] ?? null,
            ],
            'user' => ['name' => $user->name, 'email' => $user->email],
        ]);
    }

    public function storePayment(Request $request)
    {
        $validated = $request->validate([
            'loan_id'          => 'required|integer|exists:loans,id',
            'amount'           => 'required|numeric|min:1',
            'payment_method'   => 'required|in:cash,gcash,maya,bpi,credit_card,debit_card',
            'payment_type'     => 'nullable|in:onsite,online',
            'reference_number' => 'nullable|string|max:100',
            'remarks'          => 'nullable|string|max:500',
        ]);

        // Ensure the loan belongs to the authenticated member
        $loan = Loan::where('id', $validated['loan_id'])
            ->where('member_id', auth()->id())
            ->where('status', 'active')
            ->firstOrFail();

        if ((float) $validated['amount'] > (float) ($loan->remaining_balance ?? 0)) {
            return back()->withErrors(['amount' => 'Payment exceeds the remaining loan balance.']);
        }

        \App\Models\LoanPayment::create([
            'loan_id'          => $loan->id,
            'amount_paid'      => $validated['amount'],
            'payment_date'     => now()->toDateString(),
            'payment_method'   => $validated['payment_method'],
            'payment_type'     => $validated['payment_type'] ?? 'onsite',
            'reference_number' => $validated['reference_number'] ?? null,
            'remarks'          => $validated['remarks'] ?? null,
            'recorded_by'      => auth()->id(),
        ]);

        $loan->decrement('remaining_balance', $validated['amount']);

        activity()->causedBy(auth()->user())
            ->performedOn($loan)
            ->log("Member loan payment: ₱{$validated['amount']} on loan #{$loan->id}");

        return back()->with('success', 'Payment submitted successfully.');
    }

    public function profile()
    {
        $user   = auth()->user();
        $member = $this->getMember();
        $reg    = $member->memberRegistration;

        return inertia('member/Profile', [
            'member' => [
                'name'             => $member->name,
                'gender'           => $reg?->gender ?? $member->gender ?? '—',
                'date_of_birth'    => $reg?->date_of_birth
                    ? \Carbon\Carbon::parse($reg->date_of_birth)->format('M d, Y')
                    : '—',
                'address'          => $reg
                    ? implode(', ', array_filter([
                        $reg->address_street,
                        $reg->address_barangay,
                        $reg->address_city,
                        $reg->address_province,
                    ]))
                    : '—',
                'contact_number'   => $reg?->contact_number ?? '—',
                'source_of_income' => $reg?->source_of_income ?? '—',
                'member_since'     => $member->start_date
                    ? $member->start_date->format('F d, Y')
                    : $member->created_at->format('F d, Y'),
                'status'           => $member->status,
                'standing'         => $member->standing,
                'migs_score'       => (int) ($member->migs_score ?? 0),
                'classification'   => $member->migs_classification ?? 'non_migs',
                'savings_balance'  => (float) ($member->savings_balance ?? 0),
                'share_capital'    => (float) ($member->share_capital ?? 0),
            ],
            'user' => ['name' => $user->name, 'email' => $user->email],
        ]);
    }

    public function announcements()
    {
        $user = auth()->user();

        $announcements = Announcement::where('status', 'published')
            ->latest('announcement_date')
            ->get()
            ->map(fn($a) => [
                'id'                => $a->id,
                'title'             => $a->title,
                'content'           => $a->content,
                'category'          => $a->category,
                'announcement_date' => $a->announcement_date->format('F d, Y'),
            ]);

        return inertia('member/Announcements', [
            'announcements' => $announcements,
            'user'          => ['name' => $user->name],
        ]);
    }

    public function dividends()
    {
        $user   = auth()->user();
        $member = $this->getMember();

        $copraHistory = collect();
        try {
            $copraHistory = $member->copraSales()
                ->orderByDesc('sale_date')
                ->get()
                ->map(fn($s) => [
                    'id'               => $s->id,
                    'sale_date'        => \Carbon\Carbon::parse($s->sale_date)->format('M d, Y'),
                    'kilos'            => (float) ($s->weight_kg ?? $s->kilos ?? 0),
                    'price_per_kilo'   => (float) ($s->price_per_kg ?? $s->price_per_kilo ?? 0),
                    'gross_amount'     => (float) $s->gross_amount,
                    'deduction_amount' => (float) ($s->loan_deduction ?? $s->deduction_amount ?? 0),
                    'net_amount'       => (float) ($s->net_proceeds ?? $s->net_amount ?? 0),
                ]);
        } catch (\Exception $e) {
            // Table may not exist yet
        }

        return inertia('member/Dividends', [
            'member' => [
                'name'             => $member->name,
                'copra_sales_ytd'  => (float) ($member->copra_sales_ytd ?? 0),
                'patronage_amount' => (float) ($member->patronage_amount ?? 0),
            ],
            'copra_history' => $copraHistory,
            'user'          => ['name' => $user->name],
        ]);
    }

    public function settings()
    {
        $user = auth()->user();
        return inertia('member/Settings', [
            'user' => [
                'name'  => $user->name,
                'email' => str_ends_with($user->email ?? '', '@kscf.local') ? null : $user->email,
            ],
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        activity()->causedBy($user)->log('Member changed password');

        return back()->with('success', 'Password updated successfully.');
    }

    public function updateContact(Request $request)
    {
        $validated = $request->validate([
            'contact_number' => 'required|string|max:20',
        ]);

        $member = $this->getMember();
        $reg    = $member->memberRegistration;

        if ($reg) {
            $reg->update(['contact_number' => $validated['contact_number']]);
            activity()->causedBy(auth()->user())
                ->performedOn($member)
                ->log('Member updated contact number');
        }

        return back()->with('success', 'Contact number updated.');
    }

    public function savingsDeposit(Request $request)
    {
        $validated = $request->validate([
            'amount'  => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string|max:500',
        ]);

        $member     = $this->getMember();
        $newBalance = (float) ($member->savings_balance ?? 0) + (float) $validated['amount'];

        \App\Models\SavingsTransaction::create([
            'member_id'     => $member->id,
            'type'          => 'deposit',
            'amount'        => $validated['amount'],
            'balance_after' => $newBalance,
            'remarks'       => $validated['remarks'] ?? null,
            'recorded_by'   => auth()->id(),
        ]);

        $member->update(['savings_balance' => $newBalance]);

        app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log("Member savings deposit: ₱{$validated['amount']}. New balance: ₱{$newBalance}");

        return back()->with('success', 'Savings deposit recorded successfully.');
    }

    public function savingsWithdraw(Request $request)
    {
        $validated = $request->validate([
            'amount'  => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string|max:500',
        ]);

        $member         = $this->getMember();
        $currentBalance = (float) ($member->savings_balance ?? 0);

        if ((float) $validated['amount'] > $currentBalance) {
            return back()->withErrors(['amount' => 'Withdrawal amount exceeds your savings balance.']);
        }

        $newBalance = $currentBalance - (float) $validated['amount'];

        \App\Models\SavingsTransaction::create([
            'member_id'     => $member->id,
            'type'          => 'withdrawal',
            'amount'        => $validated['amount'],
            'balance_after' => $newBalance,
            'remarks'       => $validated['remarks'] ?? null,
            'recorded_by'   => auth()->id(),
        ]);

        $member->update(['savings_balance' => $newBalance]);

        app(\App\Services\MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log("Member savings withdrawal: ₱{$validated['amount']}. New balance: ₱{$newBalance}");

        return back()->with('success', 'Savings withdrawal recorded successfully.');
    }
}