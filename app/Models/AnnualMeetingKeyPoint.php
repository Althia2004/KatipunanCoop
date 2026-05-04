<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnnualMeetingKeyPoint extends Model
{
    protected $fillable = [
        'annual_meeting_id',
        'type',    // discussion_point | challenge
        'content',
    ];

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(AnnualMeeting::class, 'annual_meeting_id');
    }
}
