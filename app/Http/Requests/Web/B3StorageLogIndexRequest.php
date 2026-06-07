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
            'status' => ['nullable', Rule::in(['NOT_SUBMITTED', 'PARTIALLY_APPROVED', 'APPROVED'])],
            'year' => ['nullable', 'integer', 'between:2000,2100'],
        ];
    }

    /**
     * @return array{search: string, status: string, year: int}
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'search' => (string) ($validated['search'] ?? ''),
            'status' => (string) ($validated['status'] ?? ''),
            'year' => (int) ($validated['year'] ?? now()->year),
        ];
    }
}
