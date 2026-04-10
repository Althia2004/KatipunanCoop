<?php

namespace App\Http\Requests\MemberRegistration;

use Illuminate\Foundation\Http\FormRequest;

class StoreMemberRegistrationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            // Personal Information
            'first_name'       => ['required', 'string', 'max:100'],
            'middle_name'      => ['nullable', 'string', 'max:100'],
            'last_name'        => ['required', 'string', 'max:100'],
            'contact_number'   => ['required', 'string', 'max:20'],
            'address_street'   => ['required', 'string', 'max:255'],
            'address_barangay' => ['required', 'string', 'max:100'],
            'address_city'     => ['required', 'string', 'max:100'],
            'address_province' => ['required', 'string', 'max:100'],
            'source_of_income' => ['required', 'string', 'max:255'],
            'date_of_birth'    => ['required', 'date', 'before:today'],
            'gender'           => ['required', 'in:male,female'],
            'id_number'        => ['required', 'string', 'max:100'],
            'notes'            => ['nullable', 'string'],

            // Co-Maker
            'co_maker.first_name'       => ['required', 'string', 'max:100'],
            'co_maker.middle_name'      => ['nullable', 'string', 'max:100'],
            'co_maker.last_name'        => ['required', 'string', 'max:100'],
            'co_maker.contact_number'   => ['required', 'string', 'max:20'],
            'co_maker.address_street'   => ['required', 'string', 'max:255'],
            'co_maker.address_barangay' => ['required', 'string', 'max:100'],
            'co_maker.address_city'     => ['required', 'string', 'max:100'],
            'co_maker.address_province' => ['required', 'string', 'max:100'],
            'co_maker.source_of_income' => ['required', 'string', 'max:255'],
            'co_maker.relationship'     => ['required', 'string', 'max:100'],

            // Beneficiaries (at least one required)
            'beneficiaries'                      => ['required', 'array', 'min:1'],
            'beneficiaries.*.first_name'         => ['required', 'string', 'max:100'],
            'beneficiaries.*.middle_name'        => ['nullable', 'string', 'max:100'],
            'beneficiaries.*.last_name'          => ['required', 'string', 'max:100'],
            'beneficiaries.*.contact_number'     => ['required', 'string', 'max:20'],
            'beneficiaries.*.address_street'     => ['required', 'string', 'max:255'],
            'beneficiaries.*.address_barangay'   => ['required', 'string', 'max:100'],
            'beneficiaries.*.address_city'       => ['required', 'string', 'max:100'],
            'beneficiaries.*.address_province'   => ['required', 'string', 'max:100'],
            'beneficiaries.*.relationship'       => ['required', 'string', 'max:100'],
        ];
    }

    public function attributes(): array
    {
        return [
            'co_maker.first_name'     => 'co-maker first name',
            'co_maker.last_name'      => 'co-maker last name',
            'co_maker.contact_number' => 'co-maker contact number',
            'co_maker.relationship'   => 'co-maker relationship',
            'beneficiaries.*.first_name'   => 'beneficiary first name',
            'beneficiaries.*.last_name'    => 'beneficiary last name',
            'beneficiaries.*.relationship' => 'beneficiary relationship',
        ];
    }
}
