<?php

namespace App\Http\Requests\Web;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class B3StorageMonthlyApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'month' => $this->route('month'),
            'year' => $this->route('year'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'between:2000,2100'],
            'approval_role' => ['required', 'in:ENVIRONMENT_SUPERVISOR,HSE_DEPARTMENT_HEAD'],
            'note' => ['nullable', 'string'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d'],
        ];
    }

    /**
     * @return array{month: int, year: int, approval_role: string, note?: string|null}
     */
    public function approvalPayload(): array
    {
        $validated = $this->validated();

        return [
            'month' => (int) $validated['month'],
            'year' => (int) $validated['year'],
            'approval_role' => (string) $validated['approval_role'],
            'note' => $validated['note'] ?? null,
        ];
    }

    public function month(): int
    {
        return (int) $this->validated('month');
    }

    public function year(): int
    {
        return (int) $this->validated('year');
    }

    /**
     * @return array{date_from: string, date_to: string}
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'date_from' => (string) ($validated['date_from'] ?? ''),
            'date_to' => (string) ($validated['date_to'] ?? ''),
        ];
    }
}
