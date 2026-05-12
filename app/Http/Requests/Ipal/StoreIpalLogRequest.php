<?php

namespace App\Http\Requests\Ipal;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIpalLogRequest extends FormRequest
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
        $operatorId = $this->user()?->id;

        return [
            'tanggal' => [
                'required',
                'date',
                Rule::unique('ipal_daily_log', 'tanggal')
                    ->where(static fn ($query) => $query->where('operator_id', $operatorId)),
            ],
            'action' => ['sometimes', 'in:DRAFT,SUBMIT'],
            'checklist' => ['required', 'array'],
            'checklist.template_id' => ['required', 'integer', 'exists:m_checklist_templates,id'],
            'checklist.values' => ['nullable', 'array', 'min:1'],
            'checklist.values.*.item_id' => ['required', 'integer', 'exists:m_checklist_items,id'],
            'checklist.values.*.status' => ['required', 'in:OK,NOT_OK,NA'],
            'checklist.values.*.note' => ['nullable', 'string'],
            'process' => ['nullable', 'array'],
            'process.template_id' => ['nullable', 'integer', 'exists:m_process_templates,id'],
            'process.values' => ['nullable', 'array', 'min:1'],
            'process.values.*.item_id' => ['nullable', 'integer', 'exists:m_process_items,id'],
            'process.values.*.value_text' => ['nullable', 'string'],
            'process.values.*.value_number' => ['nullable', 'numeric'],
            'process.values.*.note' => ['nullable', 'string'],
            'batch' => ['nullable', 'array'],
            'batch.*.batch_no' => ['required_with:batch', 'integer', 'min:1', 'distinct'],
            'batch.*.values' => ['required_with:batch', 'array', 'min:1'],
            'batch.*.values.*.item_id' => ['required', 'integer', 'exists:m_batch_items,id'],
            'batch.*.values.*.value_text' => ['nullable', 'string'],
            'batch.*.values.*.value_number' => ['nullable', 'numeric'],
        ];
    }
}
