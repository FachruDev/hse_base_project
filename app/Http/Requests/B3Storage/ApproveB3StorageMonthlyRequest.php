<?php

namespace App\Http\Requests\B3Storage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ApproveB3StorageMonthlyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'between:2000,2100'],
            'approval_role' => ['required', 'in:ENVIRONMENT_SUPERVISOR,HSE_DEPARTMENT_HEAD'],
            'signer_user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string'],
        ];
    }
}
