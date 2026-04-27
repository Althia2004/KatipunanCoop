<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanAmortization extends Model
{
    protected $fillable = [
        'loan_id', 
        'due_date', 
        'amount_to_pay', 
        'principal_part', 
        'interest_part', 
        'status'
    ];

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }
}
