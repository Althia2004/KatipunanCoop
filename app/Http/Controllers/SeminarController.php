<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Seminar;
use App\Models\MemberRegistration;
use Inertia\Inertia;
use Inertia\Response;

class SeminarController extends Controller
{
    //

    public function index(): Response {
        $seminars = Seminar::with('memberRegistrations')->get()->map(function (Seminar $seminar) {
            $participants = $seminar->memberRegistrations->map(fn (MemberRegistration $r) => [
                'id'             => $r->id,
                'name'           => trim("{$r->first_name} " . ($r->middle_name ? "{$r->middle_name} " : '') . "{$r->last_name}"),
                'contact_number' => $r->contact_number,
                'status'         => $r->status,
                'attended'       => in_array($r->status, [
                    MemberRegistration::STATUS_SEMINAR_ATTENDED,
                    MemberRegistration::STATUS_APPROVED,
                ]),
            ]);

            return array_merge($seminar->toArray(), ['participants' => $participants]);
        });

        return Inertia::render('Loan/SeminarTracking/SeminarTrackingDashboard', ['seminarsFromDb' => $seminars]);
    }

    public function create() : Response {
        return Inertia::render('Loan/SeminarTracking/SeminarCreate');
    }

    public function store(Request $request) {
        // $validated = $request->validated([
        //     'title' => 'required|string|max:255',
        //     'location' => 'required|string',
        //     'scheduled_at' => 'required|date',
        //     'capacity' => 'required|integer|min:1',
        // ]); 

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string',
            'scheduled_at' => 'required|date',
            'capacity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'speaker_name' => 'nullable|string|max:255'
        ]);

        Seminar::create($data);

        return redirect()->route('loan.seminar-tracking')
            ->with('message', 'Seminar created successfully');
    }
}
