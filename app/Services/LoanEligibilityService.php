<?php

namespace App\Services;

use App\Models\Member;

class LoanEligibilityService
{
    const MIN_CAPITAL_SHARE = 20000;
    const MIN_MONTHS_MEMBER = 3;
    const MIN_MIGS_SCORE    = 50;

    public function check(Member $member): array
    {
        $reasons  = [];
        $eligible = true;

        // 1. Capital share check
        $capitalShare = $member->share_capital ?? 0;
        $capitalOk    = $capitalShare >= self::MIN_CAPITAL_SHARE;
        if (!$capitalOk) {
            $eligible  = false;
            $needed    = self::MIN_CAPITAL_SHARE - $capitalShare;
            $reasons[] = [
                'code'     => 'insufficient_capital',
                'message'  => 'Capital share must be at least ₱' . number_format(self::MIN_CAPITAL_SHARE, 2) . '. Current: ₱' . number_format($capitalShare, 2) . '. Need ₱' . number_format($needed, 2) . ' more.',
                'current'  => $capitalShare,
                'required' => self::MIN_CAPITAL_SHARE,
            ];
        }

        // 2. Membership maturity check
        $monthsAsMember = (int) $member->created_at->diffInMonths(now());
        $maturityOk     = $monthsAsMember >= self::MIN_MONTHS_MEMBER;
        if (!$maturityOk) {
            $eligible  = false;
            $remaining = self::MIN_MONTHS_MEMBER - $monthsAsMember;
            $reasons[] = [
                'code'     => 'insufficient_maturity',
                'message'  => 'Must be a member for at least ' . self::MIN_MONTHS_MEMBER . ' months. Current: ' . $monthsAsMember . ' month(s). ' . $remaining . ' more month(s) needed.',
                'current'  => $monthsAsMember,
                'required' => self::MIN_MONTHS_MEMBER,
            ];
        }

        // 3. No active loan check — query directly instead of relationship
        $hasActiveLoan = \App\Models\Loan::where('member_id', $member->user_id)
            ->whereIn('status', ['active', 'approved'])
            ->exists();

        $hasPendingRequest = \App\Models\LoanRequest::where('requested_by', $member->user_id)
            ->whereIn('status', ['pending', 'for_bod_approval'])
            ->exists();

        if ($hasActiveLoan) {
            $eligible  = false;
            $reasons[] = [
                'code'    => 'has_active_loan',
                'message' => 'You already have an active loan. Please settle your current loan before applying for a new one.',
            ];
        }

        if ($hasPendingRequest) {
            $eligible  = false;
            $reasons[] = [
                'code'    => 'has_pending_request',
                'message' => 'You have a pending loan request being reviewed. Please wait for the decision.',
            ];
        }

        // 4. Member status check
        $statusOk = in_array($member->status, ['approved', 'active']);
        if (!$statusOk) {
            $eligible  = false;
            $reasons[] = [
                'code'    => 'not_approved',
                'message' => 'Your membership must be fully approved before applying for a loan.',
            ];
        }

        // 5. MIGS score check
        $migsScore = $member->migs_score ?? 0;
        $migsOk    = $migsScore >= self::MIN_MIGS_SCORE;
        if (!$migsOk) {
            $eligible  = false;
            $reasons[] = [
                'code'     => 'insufficient_migs',
                'message'  => 'MIGS score must be at least ' . self::MIN_MIGS_SCORE . '. Current score: ' . $migsScore . '/100.',
                'current'  => $migsScore,
                'required' => self::MIN_MIGS_SCORE,
            ];
        }

        return [
            'eligible'        => $eligible,
            'reasons'         => $reasons,
            'capital_share'   => $capitalShare,
            'months_member'   => $monthsAsMember,
            'migs_score'      => $migsScore,
            'has_active_loan' => $hasActiveLoan,
            'checks' => [
                'capital'  => ['pass' => $capitalOk,   'value' => $capitalShare,   'required' => self::MIN_CAPITAL_SHARE],
                'maturity' => ['pass' => $maturityOk,  'value' => $monthsAsMember, 'required' => self::MIN_MONTHS_MEMBER],
                'no_loan'  => ['pass' => !$hasActiveLoan && !$hasPendingRequest],
                'status'   => ['pass' => $statusOk],
                'migs'     => ['pass' => $migsOk,      'value' => $migsScore,      'required' => self::MIN_MIGS_SCORE],
            ],
        ];
    }
}