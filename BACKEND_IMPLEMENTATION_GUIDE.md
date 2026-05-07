# Backend Implementation Guide - Member API Endpoints

This guide outlines the Laravel controllers and routes needed to support the frontend service layer.

## Setup Instructions

### 1. Create API Routes File
Location: `routes/api.php`

```php
// Member API Routes (grouped, auth required)
Route::prefix('member')->middleware(['auth', 'verified'])->group(function () {
    
    // Loan endpoints
    Route::get('/loans', [MemberLoanController::class, 'index']);
    Route::get('/loans/{loan}', [MemberLoanController::class, 'show']);
    Route::get('/loans/{loan}/amortization', [MemberLoanController::class, 'amortization']);
    Route::get('/loans/{loan}/payments', [MemberLoanController::class, 'payments']);
    Route::post('/loan-requests', [MemberLoanController::class, 'storeLoanRequest']);
    
    // Savings endpoints
    Route::get('/savings', [SavingsController::class, 'show']);
    Route::get('/savings/transactions', [SavingsController::class, 'transactions']);
    Route::post('/savings/deposit', [SavingsController::class, 'deposit']);
    Route::post('/savings/withdrawal', [SavingsController::class, 'withdrawal']);
    
    // Patronage endpoints
    Route::get('/patronage-refunds', [PatronageController::class, 'index']);
    Route::get('/patronage-refunds/{refund}', [PatronageController::class, 'show']);
    Route::get('/patronage-refunds/transactions', [PatronageController::class, 'transactions']);
    
    // Payment endpoints
    Route::post('/payments/intent', [PaymentController::class, 'createIntent']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/loans/{loan}/next-payment', [PaymentController::class, 'nextPaymentDue']);
    Route::post('/payments/{payment}/verify', [PaymentController::class, 'verify']);
    Route::post('/payments/{payment}/cancel', [PaymentController::class, 'cancel']);
    
    // Report endpoints
    Route::post('/reports/generate', [ReportController::class, 'generate']);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/history', [ReportController::class, 'history']);
    Route::delete('/reports/{report}', [ReportController::class, 'destroy']);
});
```

### 2. Create Controllers

**Location**: `app/Http/Controllers/Api/Member/MemberLoanController.php`

```php
<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanAmortization;
use App\Models\LoanPayment;
use App\Models\LoanRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MemberLoanController extends Controller
{
    /**
     * Get all loans for the authenticated member
     */
    public function index(): JsonResponse
    {
        $loans = auth()->user()->loans()->get();
        
        return response()->json([
            'data' => $loans->map(fn($loan) => [
                'id' => $loan->id,
                'principal_amount' => $loan->principal_amount,
                'interest_rate' => $loan->interest_rate,
                'term_months' => $loan->term_months,
                'total_payable' => $loan->total_payable,
                'remaining_balance' => $loan->remaining_balance,
                'status' => $loan->status,
                'created_at' => $loan->created_at->toDateString(),
            ])
        ]);
    }

    /**
     * Get a specific loan with detailed information
     */
    public function show(Loan $loan): JsonResponse
    {
        // Ensure member can only see their own loans
        if ($loan->member_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => [
                'id' => $loan->id,
                'principal_amount' => $loan->principal_amount,
                'interest_rate' => $loan->interest_rate,
                'term_months' => $loan->term_months,
                'total_payable' => $loan->total_payable,
                'remaining_balance' => $loan->remaining_balance,
                'status' => $loan->status,
                'created_at' => $loan->created_at->toDateString(),
                'payments' => $loan->payments()->get()->map(fn($p) => [
                    'id' => $p->id,
                    'amount_paid' => $p->amount_paid,
                    'payment_date' => $p->payment_date->toDateString(),
                    'payment_method' => $p->payment_method,
                    'reference_number' => $p->reference_number,
                ])
            ]
        ]);
    }

    /**
     * Get amortization schedule for a loan
     */
    public function amortization(Loan $loan): JsonResponse
    {
        if ($loan->member_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $amortizations = $loan->amortizations()->get();

        return response()->json([
            'data' => $amortizations->map(fn($a) => [
                'id' => $a->id,
                'due_date' => $a->due_date->toDateString(),
                'principal' => $a->principal_amount,
                'interest' => $a->interest_amount,
                'total' => $a->principal_amount + $a->interest_amount,
                'paid_amount' => $a->paid_amount,
                'status' => $a->status,
            ])
        ]);
    }

    /**
     * Get payment history for a loan
     */
    public function payments(Loan $loan): JsonResponse
    {
        if ($loan->member_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payments = $loan->payments()->get();

        return response()->json([
            'data' => $payments->map(fn($p) => [
                'id' => $p->id,
                'amount_paid' => $p->amount_paid,
                'payment_date' => $p->payment_date->toDateString(),
                'payment_method' => $p->payment_method,
                'reference_number' => $p->reference_number,
                'remarks' => $p->remarks,
            ])
        ]);
    }

    /**
     * Store a new loan request
     */
    public function storeLoanRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'purpose' => 'required|string|max:500',
            'loan_term' => 'required|in:6,12,24,36',
        ]);

        $loanRequest = LoanRequest::create([
            'requested_by' => auth()->id(),
            'amount' => $validated['amount'],
            'purpose' => $validated['purpose'],
            'term_months' => $validated['loan_term'],
            'status' => LoanRequest::STATUS_PENDING,
            'requested_at' => now(),
        ]);

        return response()->json([
            'id' => $loanRequest->id,
            'message' => 'Loan request submitted successfully'
        ], 201);
    }
}
```

**Location**: `app/Http/Controllers/Api/Member/SavingsController.php`

```php
<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavingsController extends Controller
{
    /**
     * Get member's savings account
     */
    public function show(): JsonResponse
    {
        $member = auth()->user();
        
        // If no savings account, create one
        $savings = $member->savings_accounts()->firstOrCreate(
            ['member_id' => $member->id],
            ['balance' => 0, 'total_deposited' => 0]
        );

        return response()->json([
            'data' => [
                'id' => $savings->id,
                'member_id' => $savings->member_id,
                'balance' => $savings->balance,
                'total_deposited' => $savings->total_deposited,
                'created_at' => $savings->created_at->toDateString(),
                'updated_at' => $savings->updated_at->toDateString(),
            ]
        ]);
    }

    /**
     * Get savings transaction history
     */
    public function transactions(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 10);
        $member = auth()->user();
        
        $transactions = $member->savings_accounts()
            ->first()
            ?->transactions()
            ->orderBy('transaction_date', 'desc')
            ->limit($limit)
            ->get() ?? collect();

        return response()->json([
            'data' => $transactions->map(fn($t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => $t->amount,
                'description' => $t->description,
                'transaction_date' => $t->transaction_date->toDateTimeString(),
                'reference_number' => $t->reference_number,
            ])
        ]);
    }

    /**
     * Submit deposit request
     */
    public function deposit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:10',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string',
        ]);

        // Create deposit transaction
        $member = auth()->user();
        $savings = $member->savings_accounts()->firstOrCreate(
            ['member_id' => $member->id],
            ['balance' => 0, 'total_deposited' => 0]
        );

        $transaction = $savings->transactions()->create([
            'type' => 'deposit',
            'amount' => $validated['amount'],
            'description' => 'Member deposit - ' . $validated['payment_method'],
            'transaction_date' => now(),
            'reference_number' => $validated['reference_number'],
        ]);

        // Update balance
        $savings->update([
            'balance' => $savings->balance + $validated['amount'],
            'total_deposited' => $savings->total_deposited + $validated['amount'],
        ]);

        return response()->json([
            'id' => $transaction->id,
            'message' => 'Deposit submitted successfully'
        ], 201);
    }

    /**
     * Submit withdrawal request
     */
    public function withdrawal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:10',
            'payment_method' => 'required|string',
        ]);

        $member = auth()->user();
        $savings = $member->savings_accounts()->first();

        if (!$savings || $savings->balance < $validated['amount']) {
            return response()->json(['message' => 'Insufficient balance'], 422);
        }

        $transaction = $savings->transactions()->create([
            'type' => 'withdrawal',
            'amount' => $validated['amount'],
            'description' => 'Member withdrawal - ' . $validated['payment_method'],
            'transaction_date' => now(),
        ]);

        // Update balance
        $savings->update([
            'balance' => $savings->balance - $validated['amount'],
        ]);

        return response()->json([
            'id' => $transaction->id,
            'message' => 'Withdrawal submitted successfully'
        ], 201);
    }
}
```

### 3. Create Model Relationships (Update Existing Models)

Ensure your `User` model has these relationships:

```php
// In User.php model
public function loans()
{
    return $this->hasMany(Loan::class, 'member_id');
}

public function loan_requests()
{
    return $this->hasMany(LoanRequest::class, 'requested_by');
}

public function payments()
{
    return $this->hasMany(LoanPayment::class, 'member_id');
}

public function savings_accounts()
{
    return $this->hasMany(SavingsAccount::class, 'member_id');
}
```

## Implementation Priority

1. **Phase 1**: MemberLoanController (loans list and detail)
2. **Phase 2**: SavingsController (balance and transactions)
3. **Phase 3**: PatronageController (refund tracking)
4. **Phase 4**: PaymentController (payment processing)
5. **Phase 5**: ReportController (report generation)

## Testing

Once controllers are implemented, test with:

```bash
# Test loans endpoint
curl -H "Authorization: Bearer {token}" http://127.0.0.1:8000/api/member/loans

# Test savings endpoint
curl -H "Authorization: Bearer {token}" http://127.0.0.1:8000/api/member/savings

# Test transaction history
curl -H "Authorization: Bearer {token}" http://127.0.0.1:8000/api/member/savings/transactions
```

The frontend will automatically load and display the data once these endpoints are implemented!
