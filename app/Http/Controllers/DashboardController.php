<?php

namespace App\Http\Controllers;

use App\Models\LoanRequest;
use App\Models\MemberRegistration;
use App\Models\Seminar;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $data = [
            'total_members'     => MemberRegistration::count(),
            'pending_approvals' => MemberRegistration::where('status', MemberRegistration::STATUS_SEMINAR_ATTENDED)->count(),
            'upcoming_seminars' => Seminar::where('scheduled_at', '>=', now())->count(),
            'active_loans'      => 0,
        ];

        // Add loan approvals for admin and superadmin users
        if ($user->isAdmin() || $user->isSuperadmin()) {
            $data['pending_loan_approvals'] = LoanRequest::where('status', LoanRequest::STATUS_PENDING)->count();
            $data['recent_loan_requests'] = LoanRequest::where('status', LoanRequest::STATUS_PENDING)
                ->with('requestedBy:id,name')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($lr) => [
                    'id'          => $lr->id,
                    'amount'      => $lr->principal_amount,
                    'requestedBy' => $lr->requestedBy?->name ?? 'Unknown',
                    'date'        => $lr->created_at->format('M d, Y'),
                ]);
        }

        return Inertia::render('dashboard', $data);
    }
}
