<?php

namespace App\Http\Requests\B3Storage;

use App\Models\B3Storage\B3StorageInitiatorDepartment;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveB3StorageInitiatorDepartmentRequest extends FormRequest
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
        $department = $this->route('initiatorDepartment');
        $ignoreId = $department instanceof B3StorageInitiatorDepartment ? $department->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('m_b3_storage_initiator_departments', 'name')->ignore($ignoreId),
            ],
            'order_no' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
