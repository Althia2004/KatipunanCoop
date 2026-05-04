<?php

namespace App\Http\Controllers;

use App\Models\MemberRegistration;
use App\Models\Seminar;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'total_members'     => MemberRegistration::count(),
            'pending_approvals' => MemberRegistration::where('status', MemberRegistration::STATUS_FOR_BOD_APPROVAL)->count(),
            'upcoming_seminars' => Seminar::where('scheduled_at', '>=', now())->count(),
            'active_loans'      => 0,
        ]);
    }
}
