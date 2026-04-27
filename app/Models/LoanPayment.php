<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanPayment extends Model
{
    protected $fillable = [
        'loan_id',
        'loan_amortization_id',
        'amount_paid',
        'payment_date',
        'payment_method',
        'reference_number',
        'remarks',
    ];

    /**
     * The loan this payment belongs to.
     */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * The specific installment this payment is covering (if any).
     */
    public function amortization(): BelongsTo
    {
        return $this->belongsTo(LoanAmortization::class, 'loan_amortization_id');
    }
}
