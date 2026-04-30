<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveUserRequest extends FormRequest
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
        $user = $this->route('user');
        $ignoreId = $user instanceof User ? $user->id : null;

        return [
            'external_id' => [
                'required',
                'string',
                'max:100',
                Rule::unique('users', 'external_id')->ignore($ignoreId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'department_id' => ['nullable', 'integer', 'exists:m_departments,id'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
