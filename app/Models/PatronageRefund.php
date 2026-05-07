<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatronageRefund extends Model
{
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_RELEASED = 'released';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'member_id',
        'fiscal_year',
        'gross_patronage',
        'tax_amount',
        'net_refund',
        'status',
        'payment_date',
    ];

    protected $casts = [
        'gross_patronage' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'net_refund' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    /**
     * The member this patronage refund belongs to.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
