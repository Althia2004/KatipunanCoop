<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanRequest extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_FOR_BOD_APPROVAL = 'for_bod_approval';
    const STATUS_APPROVED = 'approved';

    protected $fillable = [
        'amount',
        'requested_by',
        'requested_at',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'requested_at' => 'date',
    ];

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
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
