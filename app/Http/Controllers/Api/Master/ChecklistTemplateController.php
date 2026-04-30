<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveChecklistTemplateRequest;
use App\Models\Master\ChecklistTemplate;
use Illuminate\Http\JsonResponse;

class ChecklistTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        $templates = ChecklistTemplate::query()
            ->withCount('items')
            ->orderBy('name')
            ->paginate(20);

        return response()->json($templates);
    }

    public function store(SaveChecklistTemplateRequest $request): JsonResponse
    {
        $template = ChecklistTemplate::query()->create($request->validated());

        return response()->json([
            'message' => 'Template checklist berhasil dibuat.',
            'data' => $template,
        ], 201);
    }

    public function show(ChecklistTemplate $checklistTemplate): JsonResponse
    {
        return response()->json([
            'data' => $checklistTemplate->load('items'),
        ]);
    }

    public function update(SaveChecklistTemplateRequest $request, ChecklistTemplate $checklistTemplate): JsonResponse
    {
        $checklistTemplate->update($request->validated());

        return response()->json([
            'message' => 'Template checklist berhasil diperbarui.',
            'data' => $checklistTemplate->fresh(),
        ]);
    }

    public function destroy(ChecklistTemplate $checklistTemplate): JsonResponse
    {
        $checklistTemplate->delete();

        return response()->json([
            'message' => 'Template checklist berhasil dihapus.',
        ]);
    }
}
