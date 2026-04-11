<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnnualMeeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic',
        'host',
        'date',
        'time_start',
        'time_end',
        'status',
        'overview',
        'is_pinned',
    ];

    protected $casts = [
        'date'      => 'date',
        'is_pinned' => 'boolean',
    ];

    public function keyPoints(): HasMany
    {
        return $this->hasMany(AnnualMeetingKeyPoint::class);
    }

    public function actionItems(): HasMany
    {
        return $this->hasMany(AnnualMeetingActionItem::class);
    }

    public function nextSteps(): HasMany
    {
        return $this->hasMany(AnnualMeetingNextStep::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(AnnualMeetingParticipant::class);
    }

    /** Duration in minutes between time_start and time_end. */
    public function getDurationAttribute(): ?int
    {
        if (! $this->time_start || ! $this->time_end) {
            return null;
        }

        $start = \Carbon\Carbon::parse($this->time_start);
        $end   = \Carbon\Carbon::parse($this->time_end);

        return (int) $start->diffInMinutes($end);
    }
}
