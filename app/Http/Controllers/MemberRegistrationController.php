<?php

namespace App\Http\Controllers;

use App\Http\Requests\MemberRegistration\AssignSeminarRequest;
use App\Http\Requests\MemberRegistration\StoreMemberRegistrationRequest;
use App\Models\MemberRegistration;
use App\Models\Seminar;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MemberRegistrationController extends Controller
{
    /**
     * Dashboard: list all registrations with filters.
     */
    public function index(): Response
    {
        $registrations = MemberRegistration::with(['seminar', 'registeredBy'])
            ->latest()
            ->get()
            ->map(fn (MemberRegistration $r) => [
                'id'          => $r->id,
                'full_name'   => $r->full_name,
                'contact_number' => $r->contact_number,
                'status'      => $r->status,
                'seminar'     => $r->seminar
                    ? ['id' => $r->seminar->id, 'title' => $r->seminar->title, 'scheduled_at' => $r->seminar->scheduled_at]
                    : null,
                'registered_by' => $r->registeredBy?->name,
                'created_at'  => $r->created_at,
            ]);

        return Inertia::render('Loan/MemberRegistration/MemberRegistrationDashboard', [
            'registrations' => $registrations,
        ]);
    }

    /**
     * Show the multi-section registration form.
     */
    public function create(): Response
    {
        return Inertia::render('Loan/MemberRegistration/MemberRegistrationCreate');
    }

    /**
     * Persist the registration, co-maker, and initial beneficiaries in one transaction.
     */
    public function store(StoreMemberRegistrationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $registration = MemberRegistration::create([
            ...$validated,
            'status'        => MemberRegistration::STATUS_PENDING,
            'registered_by' => auth()->id(),
        ]);

        // Co-Maker
        $registration->coMaker()->create($validated['co_maker']);

        // Beneficiaries
        foreach ($validated['beneficiaries'] as $beneficiary) {
            $registration->beneficiaries()->create($beneficiary);
        }

        return redirect()
            ->route('loan.member-registration.show', $registration)
            ->with('message', 'Registration submitted successfully.');
    }

    /**
     * View full details of a single registration.
     */
    public function show(MemberRegistration $memberRegistration): Response
    {
        $memberRegistration->load(['coMaker', 'beneficiaries', 'seminar', 'registeredBy']);

        // Upcoming and published seminars to assign if still pending
        $availableSeminars = Seminar::whereIn('status', ['draft', 'upcoming'])
            ->orderBy('scheduled_at')
            ->get(['id', 'title', 'scheduled_at', 'location']);

        return Inertia::render('Loan/MemberRegistration/MemberRegistrationShow', [
            'registration'      => $memberRegistration,
            'availableSeminars' => $availableSeminars,
        ]);
    }

    /**
     * Assign a seminar to a pending registration → status becomes "seminar_scheduled".
     */
    public function assignSeminar(AssignSeminarRequest $request, MemberRegistration $memberRegistration): RedirectResponse
    {
        abort_if(
            !in_array($memberRegistration->status, [
                MemberRegistration::STATUS_PENDING,
                MemberRegistration::STATUS_SEMINAR_SCHEDULED,
            ]),
            422,
            'Cannot assign seminar at this stage.'
        );

        $memberRegistration->update([
            'seminar_id' => $request->validated('seminar_id'),
            'status'     => MemberRegistration::STATUS_SEMINAR_SCHEDULED,
        ]);

        return back()->with('message', 'Seminar assigned successfully.');
    }

    /**
     * Admin confirms attendance → status becomes "seminar_attended".
     */
    public function confirmAttendance(MemberRegistration $memberRegistration): RedirectResponse
    {
        abort_if(
            $memberRegistration->status !== MemberRegistration::STATUS_SEMINAR_SCHEDULED,
            422,
            'Attendance can only be confirmed for registrations with a scheduled seminar.'
        );

        $memberRegistration->markSeminarAttended();

        return back()->with('message', 'Attendance confirmed.');
    }

    /**
     * Endorse to BOD → status becomes "for_bod_approval".
     */
    public function endorseToBod(MemberRegistration $memberRegistration): RedirectResponse
    {
        abort_if(
            $memberRegistration->status !== MemberRegistration::STATUS_SEMINAR_ATTENDED,
            422,
            'Registration must have completed the seminar before endorsing to BOD.'
        );

        $memberRegistration->endorseToBod();

        return back()->with('message', 'Registration endorsed to Board of Directors.');
    }
}
