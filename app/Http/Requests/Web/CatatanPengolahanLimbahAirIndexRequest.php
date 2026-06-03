<?php

namespace App\Http\Requests\Web;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CatatanPengolahanLimbahAirIndexRequest extends FormRequest
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
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', Rule::in(['DRAFT', 'SUBMITTED', 'APPROVED'])],
            'year' => ['nullable', 'integer', 'between:2000,2100'],
            'per_page' => ['nullable', 'integer', Rule::in([10, 25, 50])],
        ];
    }

    /**
     * @return array{search: string, status: string, year: int, per_page: int}
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'search' => (string) ($validated['search'] ?? ''),
            'status' => (string) ($validated['status'] ?? ''),
            'year' => (int) ($validated['year'] ?? now()->year),
            'per_page' => (int) ($validated['per_page'] ?? 10),
        ];
    }
}
