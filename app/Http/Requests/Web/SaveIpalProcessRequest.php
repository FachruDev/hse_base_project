<?php

namespace App\Http\Requests\Web;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveIpalProcessRequest extends FormRequest
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
            'action' => ['nullable', 'in:DRAFT,SUBMIT'],
            'has_mixing' => ['required', 'boolean'],
            'process' => ['required', 'array'],
            'process.template_id' => ['required', 'integer', 'exists:m_process_templates,id'],
            'process.values' => ['required', 'array', 'min:1'],
            'process.values.*.item_id' => ['required', 'integer', 'exists:m_process_items,id'],
            'process.values.*.value_text' => ['nullable', 'required_without:process.values.*.value_number', 'string'],
            'process.values.*.value_number' => ['nullable', 'required_without:process.values.*.value_text', 'numeric'],
            'process.values.*.note' => ['nullable', 'string'],
            'batch' => ['nullable', 'array', 'required_if:has_mixing,1'],
            'batch.*.batch_no' => ['required_with:batch', 'integer', 'between:1,7', 'distinct'],
            'batch.*.values' => ['required_with:batch', 'array', 'min:1'],
            'batch.*.values.*.item_id' => ['required', 'integer', 'exists:m_batch_items,id'],
            'batch.*.values.*.value_text' => ['nullable', 'required_without:batch.*.values.*.value_number', 'string'],
            'batch.*.values.*.value_number' => ['nullable', 'required_without:batch.*.values.*.value_text', 'numeric'],
        ];
    }
}
