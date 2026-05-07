<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    /**
     * Index: Get approved members only (ADMIN USE)
     */
    public function index(): JsonResponse
    {
        $members = Member::where('status', Member::STATUS_APPROVED)
            ->latest()
            ->get();

        return response()->json([
            'data' => $members,
        ]);
    }

    /**
     * Pending: Get pending members only (SUPERADMIN USE)
     */
    public function pending(): JsonResponse
    {
        $members = Member::where('status', Member::STATUS_PENDING)
            ->latest()
            ->get();

        return response()->json([
            'data' => $members,
        ]);
    }

    /**
     * Store: Create a new member (status = pending)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female,other',
            'start_date' => 'nullable|date',
            'standing' => 'required|string|max:255',
            'membership_status' => 'required|in:good,warning,non-compliant',
        ]);

        $member = Member::create([
            ...$validated,
            'status' => Member::STATUS_PENDING,
        ]);

        return response()->json([
            'data' => $member,
            'message' => 'Member created successfully.',
        ], 201);
    }

    /**
     * Update: Update an existing member
     */
    public function update(Request $request, Member $member): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'gender' => 'sometimes|in:male,female,other',
            'start_date' => 'sometimes|nullable|date',
            'standing' => 'sometimes|string|max:255',
            'membership_status' => 'sometimes|in:good,warning,non-compliant',
        ]);

        $member->update($validated);

        return response()->json([
            'data' => $member,
            'message' => 'Member updated successfully.',
        ]);
    }

    /**
     * Destroy: Delete a member
     */
    public function destroy(Member $member): JsonResponse
    {
        $member->delete();

        return response()->json([
            'message' => 'Member deleted successfully.',
        ]);
    }

    /**
     * Approve: Set status to approved
     */
    public function approve(Member $member): JsonResponse
    {
        $member->update(['status' => Member::STATUS_APPROVED]);

        return response()->json([
            'data' => $member,
            'message' => 'Member approved successfully.',
        ]);
    }

    /**
     * Reject: Set status to rejected
     */
    public function reject(Member $member): JsonResponse
    {
        $member->update(['status' => Member::STATUS_REJECTED]);

        return response()->json([
            'data' => $member,
            'message' => 'Member rejected successfully.',
        ]);
    }

    // ── Inertia page ──────────────────────────────────────────────────────────

    /**
     * Render the Member Management Inertia page with member data as props.
     */
    public function memberManagement(): Response
    {
        $members = Member::whereNotIn('status', [Member::STATUS_PENDING, Member::STATUS_REJECTED])
            ->with('memberRegistration:id,first_name,last_name,contact_number,source_of_income,date_of_birth,address_street,address_barangay,address_city')
            ->latest()
            ->get()
            ->map(fn ($m) => [
                'id'               => $m->id,
                'name'             => $m->name,
                'first_name'       => $m->memberRegistration?->first_name ?? '',
                'last_name'        => $m->memberRegistration?->last_name ?? '',
                'contact_number'   => $m->memberRegistration?->contact_number ?? '',
                'source_of_income' => $m->memberRegistration?->source_of_income ?? '',
                'date_of_birth'    => $m->memberRegistration?->date_of_birth?->format('M d, Y') ?? null,
                'address'          => $m->memberRegistration
                    ? trim(implode(', ', array_filter([
                        $m->memberRegistration->address_street,
                        $m->memberRegistration->address_barangay,
                        $m->memberRegistration->address_city,
                    ])))
                    : '',
                'gender'           => $m->gender,
                'status'           => $m->status,
                'membership_status' => $m->membership_status,
                'standing'         => $m->standing,
                'start_date'       => $m->start_date?->format('M d, Y'),
                'last_login'       => $m->last_login?->format('M d, Y g:i A'),
            ]);

        return Inertia::render('User/MemberManagement', [
            'members' => $members->values(),
        ]);
    }

    /**
     * Update member's editable fields (Inertia PATCH).
     */
    public function updateMember(Request $request, Member $member): RedirectResponse
    {
        $validated = $request->validate([
            'first_name'       => 'required|string|max:255',
            'last_name'        => 'required|string|max:255',
            'contact_number'   => 'required|string|max:20',
            'source_of_income' => 'nullable|string|max:255',
        ]);

        $fullName = trim($validated['first_name'] . ' ' . $validated['last_name']);
        $member->update(['name' => $fullName]);

        if ($member->memberRegistration) {
            $member->memberRegistration->update([
                'first_name'       => $validated['first_name'],
                'last_name'        => $validated['last_name'],
                'contact_number'   => $validated['contact_number'],
                'source_of_income' => $validated['source_of_income'],
            ]);
        }

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Member record updated');

        return back()->with('success', 'Member updated successfully.');
    }

    /**
     * Toggle member status between active and suspended (Inertia PATCH).
     */
    public function toggleStatus(Member $member): RedirectResponse
    {
        $newStatus = $member->status === Member::STATUS_SUSPENDED
            ? Member::STATUS_ACTIVE
            : Member::STATUS_SUSPENDED;

        $member->update(['status' => $newStatus]);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Member status changed to ' . $newStatus);

        return back()->with('success', 'Member status updated to ' . $newStatus . '.');
    }

    /**
     * Request member deletion — sets status to pending_deletion (Inertia PATCH).
     */
    public function requestDeletion(Member $member): RedirectResponse
    {
        abort_if($member->status === Member::STATUS_PENDING_DELETION, 422, 'Deletion already requested.');

        $member->update(['status' => Member::STATUS_PENDING_DELETION]);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Member deletion requested — awaiting superadmin approval');

        return back()->with('success', 'Deletion request submitted. Awaiting Superadmin approval.');
    }
}
