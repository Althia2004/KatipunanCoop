<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DividendRecord extends Model
{
    const STATUS_TENTATIVE = 'tentative';
    const STATUS_VERIFIED  = 'verified';
    const STATUS_RELEASED  = 'released';

    protected $fillable = [
        'member_id',
        'year',
        'share_capital',
        'capital_pct',
        'dividend_amount',
        'status',
        'verified_by',
        'verified_at',
        'released_by',
        'released_at',
        'remarks',
    ];

    protected $casts = [
        'year'            => 'integer',
        'share_capital'   => 'decimal:2',
        'capital_pct'     => 'decimal:4',
        'dividend_amount' => 'decimal:2',
        'verified_at'     => 'datetime',
        'released_at'     => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }
}
