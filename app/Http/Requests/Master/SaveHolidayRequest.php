<?php

namespace App\Http\Requests\Master;

use App\Models\Master\Holiday;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveHolidayRequest extends FormRequest
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
        $holiday = $this->route('holiday');
        $ignoreId = $holiday instanceof Holiday ? $holiday->id : null;

        return [
            'holiday_date' => [
                'required',
                Rule::date()->format('Y-m-d'),
                Rule::unique('m_holidays', 'holiday_date')->ignore($ignoreId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
