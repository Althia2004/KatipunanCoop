<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoMaker extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_registration_id',
        'first_name',
        'middle_name',
        'last_name',
        'contact_number',
        'address_street',
        'address_barangay',
        'address_city',
        'address_province',
        'source_of_income',
        'relationship',
    ];

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    public function memberRegistration(): BelongsTo
    {
        return $this->belongsTo(MemberRegistration::class);
    }
}
