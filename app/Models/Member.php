<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'member_registration_id',
        'name',
        'gender',
        'status',
        'membership_status',
        'standing',
        'start_date',
        'last_login',
    ];

    protected $casts = [
        'start_date' => 'date',
        'last_login' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the member registration associated with this member.
     */
    public function memberRegistration(): BelongsTo
    {
        return $this->belongsTo(MemberRegistration::class);
    }
}
