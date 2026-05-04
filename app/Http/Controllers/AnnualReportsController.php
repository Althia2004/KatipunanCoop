<?php

namespace App\Http\Controllers;

use App\Models\AnnualMeeting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AnnualReportsController extends Controller
{
    public function index(): Response
    {
        $meetings = AnnualMeeting::orderByDesc('date')->orderByDesc('time_start')->get();

        // --- Stats ---
        $total = $meetings->count();

        $completed = $meetings->where('status', 'completed');

        $avgDuration = $completed->filter(fn ($m) => $m->duration !== null)
            ->avg(fn ($m) => $m->duration);

        // Attendance % = meetings with at least 1 participant / total completed
        $withParticipants = $completed->filter(function ($m) {
            return AnnualMeeting::where('id', $m->id)->withCount('participants')->first()->participants_count > 0;
        })->count();
        $attendancePct = $completed->count() > 0
            ? round(($withParticipants / $completed->count()) * 100, 1)
            : 0;

        // Participant engagement % = meetings with action items / total completed
        $withActionItems = $completed->filter(function ($m) {
            return AnnualMeeting::where('id', $m->id)->withCount('actionItems')->first()->action_items_count > 0;
        })->count();
        $engagementPct = $completed->count() > 0
            ? round(($withActionItems / $completed->count()) * 100, 1)
            : 0;

        // Meeting frequency per week of current month (for chart)
        $now          = now();
        $weeksInMonth = [];
        $startOfMonth = $now->copy()->startOfMonth();
        for ($week = 1; $week <= 5; $week++) {
            $weekStart = $startOfMonth->copy()->addWeeks($week - 1);
            $weekEnd   = $weekStart->copy()->endOfWeek();
            $count     = $meetings->filter(function ($m) use ($weekStart, $weekEnd) {
                return $m->date >= $weekStart && $m->date <= $weekEnd;
            })->count();
            $weeksInMonth[] = ['week' => "Week {$week}", 'meetings' => $count];
        }

        return Inertia::render('AnnualMeetingReports/index', [
            'meetings'      => $meetings->values(),
            'stats'         => [
                'total'         => $total,
                'avgDuration'   => $avgDuration ? (int) round($avgDuration) : null,
                'attendancePct' => $attendancePct,
                'engagementPct' => $engagementPct,
            ],
            'chartData'     => $weeksInMonth,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $meeting = AnnualMeeting::with([
            'keyPoints',
            'actionItems',
            'nextSteps',
            'participants',
        ])->findOrFail($id);

        return response()->json($meeting);
    }

    public function pin(int $id): RedirectResponse
    {
        $meeting           = AnnualMeeting::findOrFail($id);
        $meeting->is_pinned = ! $meeting->is_pinned;
        $meeting->save();

        return back();
    }
}
