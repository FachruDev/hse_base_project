<?php

namespace App\Http\Requests\Web;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ManagementIndexRequest extends FormRequest
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
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'in:10,25,50'],
            'edit' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array{search: string, per_page: int, edit: int|null}
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'search' => (string) ($validated['search'] ?? ''),
            'per_page' => (int) ($validated['per_page'] ?? 10),
            'edit' => array_key_exists('edit', $validated) ? (int) $validated['edit'] : null,
        ];
    }
}
