<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Seminar;
use Inertia\Inertia;
use Inertia\Response;

class SeminarController extends Controller
{
    //

    public function index(): Response {
        
        $seminars = Seminar::all();

        return Inertia::render('Loan/SeminarTracking/SeminarTrackingDashboard', ['seminarsFromDb' => $seminars,]);
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
