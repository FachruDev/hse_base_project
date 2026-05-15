<?php

namespace App\Http\Requests\B3Storage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateB3StorageLogRequest extends FormRequest
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
            'movement_date' => ['required', Rule::date()->format('Y-m-d')],
            'movement_time' => ['nullable', 'date_format:H:i'],
            'movement_type' => ['required', 'in:MASUK,KELUAR'],
            'waste_type_id' => ['nullable', 'integer', 'exists:m_b3_storage_waste_types,id'],
            'waste_type_other' => ['nullable', 'string', 'max:255'],
            'initiator_department_id' => ['nullable', 'integer', 'exists:m_b3_storage_initiator_departments,id'],
            'initiator_department_other' => ['nullable', 'string', 'max:255'],
            'weight_kg' => ['required', 'numeric', 'gt:0'],
            'document_number' => ['required', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'max:5120'],
            'note' => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $hasWasteTypeId = $this->filled('waste_type_id');
                $hasWasteTypeOther = trim((string) $this->input('waste_type_other', '')) !== '';

                if (! $hasWasteTypeId && ! $hasWasteTypeOther) {
                    $validator->errors()->add('waste_type_id', 'Pilih jenis limbah atau isi opsi yang lain.');
                }

                $hasDepartmentId = $this->filled('initiator_department_id');
                $hasDepartmentOther = trim((string) $this->input('initiator_department_other', '')) !== '';

                if (! $hasDepartmentId && ! $hasDepartmentOther) {
                    $validator->errors()->add('initiator_department_id', 'Pilih dept inisiator atau isi opsi yang lain.');
                }
            },
        ];
    }
}
