<?php

namespace App\Http\Controllers;

use App\Http\Requests\MemberRegistration\StoreBeneficiaryRequest;
use App\Models\Beneficiary;
use App\Models\MemberRegistration;
use Illuminate\Http\RedirectResponse;

class BeneficiaryController extends Controller
{
    /**
     * Add a new beneficiary to an existing registration.
     */
    public function store(StoreBeneficiaryRequest $request, MemberRegistration $memberRegistration): RedirectResponse
    {
        $memberRegistration->beneficiaries()->create($request->validated());

        return back()->with('message', 'Beneficiary added successfully.');
    }

    /**
     * Update an existing beneficiary (staff only).
     */
    public function update(StoreBeneficiaryRequest $request, MemberRegistration $memberRegistration, Beneficiary $beneficiary): RedirectResponse
    {
        abort_if($beneficiary->member_registration_id !== $memberRegistration->id, 403);

        $beneficiary->update($request->validated());

        return back()->with('message', 'Beneficiary updated successfully.');
    }

    /**
     * Remove a beneficiary (staff only).
     */
    public function destroy(MemberRegistration $memberRegistration, Beneficiary $beneficiary): RedirectResponse
    {
        abort_if($beneficiary->member_registration_id !== $memberRegistration->id, 403);

        $beneficiary->delete();

        return back()->with('message', 'Beneficiary removed.');
    }
}
