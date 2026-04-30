<?php

namespace App\Http\Requests\Master;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveProcessItemRequest extends FormRequest
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
            'section_id' => ['required', 'integer', 'exists:m_process_sections,id'],
            'name' => ['required', 'string', 'max:255'],
            'standard_condition' => ['nullable', 'string'],
            'input_type' => ['required', 'in:number,text,select'],
            'order_no' => ['required', 'integer', 'min:1'],
        ];
    }
}
