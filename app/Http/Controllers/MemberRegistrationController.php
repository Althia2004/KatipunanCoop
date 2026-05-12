<?php

namespace App\Http\Controllers;

use App\Http\Requests\MemberRegistration\AssignSeminarRequest;
use App\Http\Requests\MemberRegistration\StoreMemberRegistrationRequest;
use App\Models\MemberRegistration;
use App\Models\Member;
use App\Models\Seminar;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
     * Also creates a pending Member record for superadmin approval.
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

        // Create a pending Member record for superadmin approval workflow
        Member::create([
            'member_registration_id' => $registration->id,
            'name' => $registration->full_name,
            'gender' => $validated['gender'] ?? null,
            'status' => Member::STATUS_PENDING,
            'membership_status' => Member::MEMBERSHIP_GOOD,
            'standing' => 'active',
            'start_date' => now()->toDateString(),
        ]);

        return redirect()
            ->route('loan.member-registration.show', $registration)
            ->with('message', 'Registration submitted successfully. Awaiting superadmin approval.');
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

        // Check if a portal account already exists for this member
        $user = User::where('role', 'member')
            ->where('name', trim("{$memberRegistration->first_name} {$memberRegistration->last_name}"))
            ->first();

        return Inertia::render('Loan/MemberRegistration/MemberRegistrationShow', [
            'registration'      => $memberRegistration,
            'availableSeminars' => $availableSeminars,
            'has_account'       => $user !== null,
            'account_email'     => $user?->email,
        ]);
    }

    /**
     * Assign a seminar to a registration → status becomes "seminar_scheduled".
     * Allows pending, approved, and previously scheduled registrations.
     */
    public function assignSeminar(AssignSeminarRequest $request, MemberRegistration $memberRegistration): RedirectResponse
    {
        $blocked = [MemberRegistration::STATUS_REJECTED, MemberRegistration::STATUS_SEMINAR_ATTENDED];
        abort_if(
            in_array($memberRegistration->status, $blocked),
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
        $allowed = [
            MemberRegistration::STATUS_SEMINAR_SCHEDULED,
            MemberRegistration::STATUS_PENDING,
            MemberRegistration::STATUS_APPROVED,
        ];
        abort_if(
            !in_array($memberRegistration->status, $allowed),
            422,
            'Cannot mark attendance. Current status: ' . $memberRegistration->status
        );

        $memberRegistration->markSeminarAttended();

        // Recalculate MIGS — seminar attendance adds points
        $member = Member::where('member_registration_id', $memberRegistration->id)->first();
        if ($member) {
            app(\App\Services\MigsScoreService::class)->recalculate($member);
        }

        activity()->causedBy(auth()->user())
            ->performedOn($memberRegistration)
            ->log('Seminar attendance confirmed for ' . $memberRegistration->first_name . ' ' . $memberRegistration->last_name);

        return back()->with('message', $memberRegistration->first_name . ' ' . $memberRegistration->last_name . ' marked as attended.');
    }

    /**
     * Assign a member portal account (email + password).
     */
    public function assignAccount(Request $request, MemberRegistration $memberRegistration): RedirectResponse
    {
        $validated = $request->validate([
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        User::create([
            'name'              => trim("{$memberRegistration->first_name} {$memberRegistration->last_name}"),
            'email'             => $validated['email'],
            'password'          => Hash::make($validated['password']),
            'role'              => 'member',
            'email_verified_at' => now(),
        ]);

        activity()->causedBy(auth()->user())
            ->performedOn($memberRegistration)
            ->log('Member portal account created');

        return back()->with('message', 'Portal account created successfully.');
    }
}
