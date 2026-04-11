<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnnualMeetingActionItem extends Model
{
    protected $fillable = [
        'annual_meeting_id',
        'assignee_name',
        'task',
    ];

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(AnnualMeeting::class, 'annual_meeting_id');
    }
}
