<?php

namespace App\Http\Requests\Master;

use App\Models\Master\OperationalWeekday;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveOperationalWeekdayRequest extends FormRequest
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
        $operationalWeekday = $this->route('operationalWeekday');
        $ignoreId = $operationalWeekday instanceof OperationalWeekday ? $operationalWeekday->id : null;

        return [
            'day_of_week_iso' => [
                'required',
                'integer',
                'between:1,7',
                Rule::unique('m_operational_weekdays', 'day_of_week_iso')->ignore($ignoreId),
            ],
            'day_name' => ['required', 'string', 'max:16'],
            'is_off' => ['required', 'boolean'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
