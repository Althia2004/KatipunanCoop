<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LoanRequest extends Model
{
    use HasFactory;

    const STATUS_PENDING         = 'pending';
    const STATUS_FOR_BOD_APPROVAL = 'for_bod_approval';
    const STATUS_APPROVED         = 'approved';
    const STATUS_REJECTED         = 'rejected';

    protected $fillable = [
        'amount',
        'requested_by',
        'requested_at',
        'interest_rate',
        'status',
        'purpose',
        'term_months',
        'rejection_reason',
        'escalation_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'requested_at' => 'date',
    ];

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
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
            'term_months' => $this->term_months,
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
