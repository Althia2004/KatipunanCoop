<?php

namespace App\Services;

use App\Models\Member;
use Illuminate\Support\Facades\DB;

class MigsScoreService
{
    const MAX_SCORE       = 100;
    const MIGS_THRESHOLD  = 50;

    // Points per category (must sum to MAX_SCORE)
    const POINTS_SEMINAR_ATTENDED  = 20;
    const POINTS_ANNUAL_MEETING    = 10; // per meeting, max 2 → 20 pts
    const POINTS_MAX_MEETINGS      = 20;
    const POINTS_HAS_SAVINGS       = 20;
    const POINTS_HAS_CAPITAL_SHARE = 20;
    const POINTS_GOOD_LOAN_STANDING = 20; // no overdue amortizations, or no active loans

    /**
     * Calculate MIGS score for a member and return the result array.
     * Does NOT persist to DB.
     */
    public function calculate(Member $member): array
    {
        $member->loadMissing('memberRegistration');

        $breakdown   = [];
        $totalScore  = 0;

        // ── 1. Seminar Attendance (20 pts) ───────────────────────
        $seminarAttended = in_array(
            $member->memberRegistration?->status,
            ['seminar_attended', 'for_bod_approval', 'approved']
        );
        $seminarPoints = $seminarAttended ? self::POINTS_SEMINAR_ATTENDED : 0;
        $breakdown['seminar_attended'] = $seminarAttended;
        $breakdown['seminar_points']   = $seminarPoints;
        $totalScore += $seminarPoints;

        // ── 2. Annual Meeting Attendance (10 pts each, max 20) ──
        // annual_meeting_participants.name is a plain string — match against member.name
        $meetingsAttended = 0;
        try {
            $meetingsAttended = DB::table('annual_meeting_participants')
                ->where('name', $member->name)
                ->distinct('annual_meeting_id')
                ->count('annual_meeting_id');
        } catch (\Throwable $e) {
            // table or column doesn't exist yet
        }
        $meetingPoints = min($meetingsAttended * self::POINTS_ANNUAL_MEETING, self::POINTS_MAX_MEETINGS);
        $breakdown['annual_meetings_attended'] = $meetingsAttended;
        $breakdown['meeting_points']           = $meetingPoints;
        $totalScore += $meetingPoints;

        // ── 3. Savings Balance > 0 (20 pts) ─────────────────────
        $hasSavings    = (float) ($member->savings_balance ?? 0) > 0;
        $savingsPoints = $hasSavings ? self::POINTS_HAS_SAVINGS : 0;
        $breakdown['has_savings']    = $hasSavings;
        $breakdown['savings_amount'] = (float) ($member->savings_balance ?? 0);
        $breakdown['savings_points'] = $savingsPoints;
        $totalScore += $savingsPoints;

        // ── 4. Share Capital > 0 (20 pts) ───────────────────────
        $hasCapital    = (float) ($member->share_capital ?? 0) > 0;
        $capitalPoints = $hasCapital ? self::POINTS_HAS_CAPITAL_SHARE : 0;
        $breakdown['has_capital_share'] = $hasCapital;
        $breakdown['capital_amount']    = (float) ($member->share_capital ?? 0);
        $breakdown['capital_points']    = $capitalPoints;
        $totalScore += $capitalPoints;

        // ── 5. Good Loan Standing (20 pts) ──────────────────────
        // Loans are on users (not members directly).
        // Find the user linked to this member via contact@kscf.local pattern.
        $loanPoints = self::POINTS_GOOD_LOAN_STANDING; // default: full points if no loans
        $hasOverdue = false;
        $activeLoanCount = 0;

        try {
            $reg = $member->memberRegistration;
            if ($reg?->contact_number) {
                $email  = preg_replace('/\s+/', '', $reg->contact_number) . '@kscf.local';
                $userId = DB::table('users')->where('email', $email)->value('id');

                if ($userId) {
                    $loanIds = DB::table('loans')
                        ->where('member_id', $userId)
                        ->whereIn('status', ['active', 'approved'])
                        ->pluck('id');

                    $activeLoanCount = $loanIds->count();

                    if ($activeLoanCount > 0) {
                        $overdueCount = DB::table('loan_amortizations')
                            ->whereIn('loan_id', $loanIds)
                            ->where('status', 'overdue')
                            ->count();

                        $hasOverdue = $overdueCount > 0;
                        $loanPoints = $hasOverdue ? 0 : self::POINTS_GOOD_LOAN_STANDING;
                    }
                }
            }
        } catch (\Throwable $e) {
            // graceful fallback: keep full points
        }

        $breakdown['active_loan_count']   = $activeLoanCount;
        $breakdown['has_overdue_payments'] = $hasOverdue;
        $breakdown['loan_points']          = $loanPoints;
        $totalScore += $loanPoints;

        // ── Final Result ─────────────────────────────────────────
        $finalScore     = min($totalScore, self::MAX_SCORE);
        $classification = $finalScore >= self::MIGS_THRESHOLD ? 'migs' : 'non_migs';

        $breakdown['total_score']    = $finalScore;
        $breakdown['classification'] = $classification;
        $breakdown['calculated_at']  = now()->toDateTimeString();

        return [
            'score'          => $finalScore,
            'classification' => $classification,
            'breakdown'      => $breakdown,
        ];
    }

    /**
     * Calculate and persist MIGS score for a single member.
     */
    public function recalculate(Member $member): Member
    {
        $result = $this->calculate($member);

        $member->update([
            'migs_score'          => $result['score'],
            'migs_classification' => $result['classification'],
            'migs_breakdown'      => $result['breakdown'],
            'migs_calculated_at'  => now(),
        ]);

        return $member->fresh();
    }

    /**
     * Recalculate MIGS scores for all members.
     */
    public function recalculateAll(): void
    {
        Member::all()->each(fn ($m) => $this->recalculate($m));
    }
}
