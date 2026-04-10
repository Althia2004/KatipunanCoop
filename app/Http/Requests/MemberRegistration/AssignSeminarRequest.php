<?php

namespace App\Http\Requests\MemberRegistration;

use Illuminate\Foundation\Http\FormRequest;

class AssignSeminarRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'seminar_id' => ['required', 'exists:seminars,id'],
        ];
    }
}
