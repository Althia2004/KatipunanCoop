<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class LoanAmortization extends Model
{
    protected $fillable = [
        'loan_id',
        'due_date',
        'amount_to_pay',
        'principal_part',
        'interest_part',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'paid_at'  => 'datetime',
            'due_date' => 'date',
        ];
    }

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(LoanPayment::class, 'loan_amortization_id');
    }
}