<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

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
        'recorded_by',
        'updated_by',
        'payment_type',
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

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
