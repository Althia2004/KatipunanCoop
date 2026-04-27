<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LoanRequest extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_FOR_BOD_APPROVAL = 'for_bod_approval';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'amount',
        'requested_by',
        'requested_at',
        'status',
        'purpose', // Recommended for BOD review
        'term_months',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'requested_at' => 'date',
    ];

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function loan(): HasOne
    {
        return $this->hasOne(Loan::class);
    }

    public function createLoanFromRequest(): Loan
    {
        return $this->loan()->firstOrCreate([
            'member_id' => $this->requested_by,
            'loan_request_id' => $this->id,
        ], [
            'principal_amount' => $this->amount,
            'interest_rate' => 0.00,
            'total_payable' => $this->amount,
            'remaining_balance' => $this->amount,
            'status' => 'active',
        ]);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isForBodApproval(): bool
    {
        return $this->status === self::STATUS_FOR_BOD_APPROVAL;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }
}
