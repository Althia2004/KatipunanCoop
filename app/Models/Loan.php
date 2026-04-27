<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'loan_request_id',
        'principal_amount',
        'interest_rate',
        'total_payable',
        'remaining_balance',
        'status', // active, fully_paid, defaulted
    ];

    public function amortizations(): HasMany
    {
        return $this->hasMany(LoanAmortization::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(LoanPayment::class);
    }

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function loanRequest(): BelongsTo
    {
        return $this->belongsTo(LoanRequest::class);
    }
}
