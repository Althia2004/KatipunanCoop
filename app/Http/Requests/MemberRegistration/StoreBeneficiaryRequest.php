<?php

namespace App\Http\Requests\MemberRegistration;

use Illuminate\Foundation\Http\FormRequest;

class StoreBeneficiaryRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'first_name'       => ['required', 'string', 'max:100'],
            'middle_name'      => ['nullable', 'string', 'max:100'],
            'last_name'        => ['required', 'string', 'max:100'],
            'contact_number'   => ['required', 'string', 'max:20'],
            'address_street'   => ['required', 'string', 'max:255'],
            'address_barangay' => ['required', 'string', 'max:100'],
            'address_city'     => ['required', 'string', 'max:100'],
            'address_province' => ['required', 'string', 'max:100'],
            'relationship'     => ['required', 'string', 'max:100'],
        ];
    }
}
