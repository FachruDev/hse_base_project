<?php

namespace App\Http\Requests\Web;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveIpalChecklistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tanggal' => ['required', 'date'],
            'checklist' => ['required', 'array'],
            'checklist.template_id' => ['required', 'integer', 'exists:m_checklist_templates,id'],
            'checklist.values' => ['required', 'array', 'min:1'],
            'checklist.values.*.item_id' => ['required', 'integer', 'exists:m_checklist_items,id'],
            'checklist.values.*.status' => ['required', 'in:OK,NOT_OK,NA'],
            'checklist.values.*.note' => ['nullable', 'string'],
        ];
    }
}
