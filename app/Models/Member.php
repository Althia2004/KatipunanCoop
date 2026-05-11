<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasFactory;

    // Status constants
    const STATUS_PENDING          = 'pending';
    const STATUS_APPROVED         = 'approved';
    const STATUS_REJECTED         = 'rejected';
    const STATUS_ACTIVE           = 'active';
    const STATUS_SUSPENDED        = 'suspended';
    const STATUS_PENDING_DELETION = 'pending_deletion';

    // Membership Status constants
    const MEMBERSHIP_GOOD = 'good';
    const MEMBERSHIP_WARNING = 'warning';
    const MEMBERSHIP_NON_COMPLIANT = 'non-compliant';

    protected $fillable = [
        'user_id',
        'member_registration_id',
        'name',
        'gender',
        'status',
        'membership_status',
        'standing',
        'start_date',
        'last_login',
        'savings_balance',
        'share_capital',
        'copra_sales_ytd',
        'patronage_amount',
        'migs_score',
        'migs_classification',
        'migs_breakdown',
        'migs_calculated_at',
    ];

    protected $casts = [
        'start_date'         => 'date',
        'last_login'         => 'datetime',
        'created_at'         => 'datetime',
        'updated_at'         => 'datetime',
        'migs_breakdown'     => 'array',
        'migs_calculated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the member registration associated with this member.
     */
    public function memberRegistration(): BelongsTo
    {
        return $this->belongsTo(MemberRegistration::class);
    }

    public function copraSales(): HasMany
    {
        return $this->hasMany(CopraSale::class);
    }

    public function savingsTransactions(): HasMany
    {
        return $this->hasMany(SavingsTransaction::class);
    }

    public function capitalShareTransactions(): HasMany
    {
        return $this->hasMany(CapitalShareTransaction::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'member_id', 'user_id');
    }
}
