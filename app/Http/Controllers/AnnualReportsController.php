<?php

namespace App\Http\Controllers;

use App\Models\AnnualMeeting;
use App\Models\Seminar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnualReportsController extends Controller
{
    public function index(): Response
    {
        $totalMembers = \App\Models\Member::count();

        $meetings = AnnualMeeting::with('seminar')
            ->withCount('actionItems')
            ->orderByDesc('date')
            ->orderByDesc('time_start')
            ->get();

        $total     = $meetings->count();
        $completed = $meetings->where('status', 'completed');

        $mappedMeetings = $meetings->map(function ($m) use ($totalMembers) {
            // Attendance is tracked on MemberRegistration.seminar_id + status.
            // seminar_participants pivot is unused — the Seminar Tracking page
            // marks presence by advancing the registration status past 'seminar_attended'.
            $attendedStatuses = ['seminar_attended', 'for_bod_approval', 'approved'];
            $presentCount = $m->seminar_id
                ? \App\Models\MemberRegistration::where('seminar_id', $m->seminar_id)
                    ->whereIn('status', $attendedStatuses)
                    ->count()
                : 0;

            return [
                'id'               => $m->id,
                'topic'            => $m->topic,
                'host'             => $m->host,
                'date'             => $m->date,
                'time_start'       => $m->time_start,
                'time_end'         => $m->time_end,
                'status'           => $m->status,
                'overview'         => $m->overview,
                'is_pinned'        => $m->is_pinned,
                'seminar_id'       => $m->seminar_id,
                'seminar_title'    => $m->seminar?->title,
                'participants_count' => $presentCount,
                'action_items_count' => $m->action_items_count,
                'attendance_pct'   => $totalMembers > 0
                    ? round(($presentCount / $totalMembers) * 100)
                    : 0,
            ];
        })->values();

        $completedMapped = $mappedMeetings->where('status', 'completed');

        // avgDuration — only meaningful for completed meetings
        $avgDuration = $completed->filter(fn ($m) => $m->duration !== null)
            ->avg(fn ($m) => $m->duration);

        // Attendance % — average across ALL meetings that have a linked seminar,
        // regardless of status. Using completed-only would show 0% while meetings
        // are still in "scheduled" state.
        $linkedMeetings = $mappedMeetings->filter(fn ($m) => ($m['participants_count'] ?? 0) > 0);
        $attendancePct  = $linkedMeetings->count() > 0
            ? round($linkedMeetings->avg('attendance_pct'))
            : 0;

        // Engagement % — meetings with at least one action item logged / total meetings
        $meetingsWithItems = $mappedMeetings->filter(fn ($m) => ($m['action_items_count'] ?? 0) > 0)->count();
        $engagementPct     = $mappedMeetings->count() > 0
            ? round(($meetingsWithItems / $mappedMeetings->count()) * 100)
            : 0;

        // Chart — meeting frequency per week of current month
        $startOfMonth = now()->copy()->startOfMonth();
        $weeksInMonth = [];
        for ($week = 1; $week <= 5; $week++) {
            $weekStart      = $startOfMonth->copy()->addWeeks($week - 1);
            $weekEnd        = $weekStart->copy()->endOfWeek();
            $weeksInMonth[] = [
                'week'     => "Week {$week}",
                'meetings' => $meetings->filter(
                    fn ($m) => $m->date >= $weekStart && $m->date <= $weekEnd
                )->count(),
            ];
        }

        // Available seminars to link — participant count from MemberRegistration
        $attendedStatuses = ['seminar_attended', 'for_bod_approval', 'approved'];
        $seminars = Seminar::latest('scheduled_at')
            ->get()
            ->map(fn ($s) => [
                'id'                 => $s->id,
                'title'              => $s->title,
                'scheduled_at'       => $s->scheduled_at,
                'participants_count' => \App\Models\MemberRegistration::where('seminar_id', $s->id)
                    ->whereIn('status', $attendedStatuses)
                    ->count(),
            ])
            ->values();

        return Inertia::render('AnnualMeetingReports/index', [
            'meetings'  => $mappedMeetings,
            'seminars'  => $seminars,
            'stats'     => [
                'total'         => $total,
                'avgDuration'   => $avgDuration ? (int) round($avgDuration) : null,
                'attendancePct' => $attendancePct,
                'engagementPct' => $engagementPct,
                'totalMembers'  => $totalMembers,
            ],
            'chartData' => $weeksInMonth,
        ]);
    }

    public function linkSeminar(Request $request, AnnualMeeting $meeting): RedirectResponse
    {
        $validated = $request->validate([
            'seminar_id' => ['required', 'exists:seminars,id'],
        ]);

        $meeting->update(['seminar_id' => $validated['seminar_id']]);

        activity()->causedBy(auth()->user())
            ->performedOn($meeting)
            ->log('Annual meeting linked to seminar #' . $validated['seminar_id']);

        return back()->with('success', 'Seminar linked. Attendance pulled automatically.');
    }

    public function markCompleted(int $id): RedirectResponse
    {
        $meeting = AnnualMeeting::findOrFail($id);

        abort_if($meeting->status === 'completed', 422, 'Meeting is already completed.');

        $meeting->update(['status' => 'completed']);

        activity()->causedBy(auth()->user())
            ->performedOn($meeting)
            ->log('Annual meeting marked as completed');

        return back()->with('success', 'Meeting marked as completed.');
    }

    public function show(int $id): JsonResponse
    {
        $meeting = AnnualMeeting::with([
            'keyPoints',
            'actionItems',
            'nextSteps',
            'seminar',
        ])->findOrFail($id);

        // Pull attendance from MemberRegistration linked to this seminar.
        // seminar_participants pivot is unused — Seminar Tracking advances the
        // registration status instead of writing to the pivot table.
        $attendedStatuses = ['seminar_attended', 'for_bod_approval', 'approved'];
        if ($meeting->seminar_id) {
            $participants = \App\Models\MemberRegistration::where('seminar_id', $meeting->seminar_id)
                ->whereIn('status', $attendedStatuses)
                ->get()
                ->map(fn ($r) => [
                    'id'   => $r->id,
                    'name' => trim($r->first_name . ' ' . $r->last_name),
                    'role' => 'Member',
                ]);
        } else {
            $participants = $meeting->participants()->get(['id', 'name', 'role']);
        }

        return response()->json(array_merge($meeting->toArray(), [
            'participants' => $participants,
        ]));
    }

    public function pin(int $id): RedirectResponse
    {
        $meeting            = AnnualMeeting::findOrFail($id);
        $meeting->is_pinned = ! $meeting->is_pinned;
        $meeting->save();

        return back();
    }

    public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'topic'      => ['required', 'string', 'max:255'],
        'host'       => ['required', 'string', 'max:255'],
        'date'       => ['required', 'date'],
        'time_start' => ['required', 'date_format:H:i'],
        'time_end'   => ['nullable', 'date_format:H:i', 'after:time_start'],
        'status'     => ['required', 'in:scheduled,completed,cancelled'],
        'overview'   => ['nullable', 'string'],
    ]);

    AnnualMeeting::create($validated);

    activity()->causedBy(auth()->user())
        ->log('Annual meeting report created: ' . $validated['topic']);

    return back()->with('success', 'Annual meeting report created successfully.');
    }

   public function superadminIndex(): Response
{
    return Inertia::render('Superadmin/AnnualReports', [
        'meetings' => AnnualMeeting::latest('date')->paginate(10),
    ]);
}
}

