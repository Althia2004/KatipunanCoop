<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Seminar extends Model
{
    use HasFactory;

    protected $fillable = ['team_id',
    'title',
    'description',
    'speaker_name',
    'scheduled_at',
    'location',
    'capacity',
    'status'
    ];


    protected $casts = [
        'scheduled_at' => 'datetime',
        'capacity' => 'integer'
    ];

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'seminar_participants')
            ->withPivot('attended_at', 'status')
            ->withTimestamps();
    }

    public function memberRegistrations(): HasMany
    {
        return $this->hasMany(MemberRegistration::class);
    }

}
