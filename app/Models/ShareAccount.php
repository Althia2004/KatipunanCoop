<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShareAccount extends Model
{
    protected $fillable = ['user_id', 'paid_up_balance'];

    /**
     * Get the member who owns this account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all transaction history for this account.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(ShareTransaction::class)->latest('processed_at');
    }
}