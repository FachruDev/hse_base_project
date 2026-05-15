<?php

namespace App\Http\Requests\Web;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class B3StorageLogIndexRequest extends FormRequest
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
            'search' => ['nullable', 'string', 'max:100'],
            'movement_type' => ['nullable', Rule::in(['MASUK', 'KELUAR'])],
            'month' => ['nullable', 'integer', 'between:1,12'],
            'year' => ['nullable', 'integer', 'between:2000,2100'],
            'per_page' => ['nullable', 'integer', Rule::in([10, 25, 50])],
        ];
    }

    /**
     * @return array{search: string, movement_type: string, month: int, year: int, per_page: int}
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'search' => (string) ($validated['search'] ?? ''),
            'movement_type' => (string) ($validated['movement_type'] ?? ''),
            'month' => (int) ($validated['month'] ?? now()->month),
            'year' => (int) ($validated['year'] ?? now()->year),
            'per_page' => (int) ($validated['per_page'] ?? 10),
        ];
    }
}
