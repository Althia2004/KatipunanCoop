<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CopraSale extends Model
{
    protected $fillable = [
        'member_id',
        'sale_date',
        'kilos',
        'price_per_kilo',
        'total_amount',
        'gross_amount',
        'classification',
        'deduction_amount',
        'deduction_type',
        'net_amount',
        'remarks',
        'recorded_by',
    ];

    protected $casts = [
        'sale_date'        => 'date',
        'kilos'            => 'float',
        'price_per_kilo'   => 'float',
        'total_amount'     => 'float',
        'gross_amount'     => 'float',
        'deduction_amount' => 'float',
        'net_amount'       => 'float',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
