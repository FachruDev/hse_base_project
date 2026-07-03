<?php

namespace App\Http\Requests\Web;

use App\Services\Web\ManagementCrudService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveManagementRequest extends FormRequest
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
        $record = $this->route('record');
        $recordId = is_numeric($record) ? (int) $record : null;

        return app(ManagementCrudService::class)->validationRules(
            (string) $this->route('module'),
            $recordId,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function payload(): array
    {
        return $this->validated();
    }
}
