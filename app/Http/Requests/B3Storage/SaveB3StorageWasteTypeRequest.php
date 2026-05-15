<?php

namespace App\Http\Requests\B3Storage;

use App\Models\B3Storage\B3StorageWasteType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveB3StorageWasteTypeRequest extends FormRequest
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
        $wasteType = $this->route('wasteType');
        $ignoreId = $wasteType instanceof B3StorageWasteType ? $wasteType->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('m_b3_storage_waste_types', 'name')->ignore($ignoreId),
            ],
            'order_no' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
