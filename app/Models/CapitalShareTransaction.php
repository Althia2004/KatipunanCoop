<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CapitalShareTransaction extends Model
{
    protected $fillable = [
        'member_id',
        'type',
        'amount',
        'balance_after',
        'remarks',
        'recorded_by',
    ];

    protected $casts = [
        'amount'        => 'float',
        'balance_after' => 'float',
    ];

    protected static function booted(): void
    {
        static::created(function (self $transaction) {
            $transaction->member?->refresh()->checkAndUpgradeToRegular();
        });
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
