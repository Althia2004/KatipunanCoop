<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ShareTransaction extends Model
{
    protected $fillable = [
        'share_account_id',
        'type',
        'amount',
        'reference_number',
        'remarks',
        'processed_at'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'processed_at' => 'datetime',
        'amount' => 'integer',
    ];

    /**
     * Get the account that owns the transaction.
     */
    public function shareAccount(): BelongsTo
    {
        return $this->belongsTo(ShareAccount::class);
    }

    /**
     * Accessor: Convert centavos to PHP for display.
     * Usage: $transaction->amount_in_pesos
     */
    protected function amountInPesos(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->amount / 100,
        );
    }

    /**
     * Accessor: Format the amount with the Philippine Peso symbol.
     * Usage: $transaction->formatted_amount
     */
    protected function formattedAmount(): Attribute
    {
        return Attribute::make(
            get: fn () => '₱' . number_format($this->amount / 100, 2),
        );
    }
}