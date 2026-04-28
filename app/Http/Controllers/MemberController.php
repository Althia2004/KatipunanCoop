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
}
