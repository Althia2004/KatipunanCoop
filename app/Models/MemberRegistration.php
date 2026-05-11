<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MemberRegistration extends Model
{
    use HasFactory;

    // Status constants for the registration workflow
    const STATUS_PENDING           = 'pending';
    const STATUS_SEMINAR_SCHEDULED = 'seminar_scheduled';
    const STATUS_SEMINAR_ATTENDED  = 'seminar_attended';
    const STATUS_APPROVED          = 'approved';
    const STATUS_REJECTED          = 'rejected';

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'contact_number',
        'address_street',
        'address_barangay',
        'address_city',
        'address_province',
        'source_of_income',
        'date_of_birth',
        'gender',
        'id_number',
        'status',
        'seminar_id',
        'registered_by',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    // --- Computed Attributes ---

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    // --- Relationships ---

    public function coMaker(): HasOne
    {
        return $this->hasOne(CoMaker::class);
    }

    public function beneficiaries(): HasMany
    {
        return $this->hasMany(Beneficiary::class);
    }

    public function seminar(): BelongsTo
    {
        return $this->belongsTo(Seminar::class);
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    // --- Status Helpers ---

    public function markSeminarAttended(): void
    {
        $this->update(['status' => self::STATUS_SEMINAR_ATTENDED]);
    }

}
