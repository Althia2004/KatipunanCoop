<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnnualMeetingParticipant extends Model
{
    protected $fillable = [
        'annual_meeting_id',
        'name',
        'role',
    ];

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(AnnualMeeting::class, 'annual_meeting_id');
    }
}
