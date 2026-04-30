<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveProcessTemplateRequest;
use App\Models\ProcessTemplate;
use Illuminate\Http\JsonResponse;

class ProcessTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        $templates = ProcessTemplate::query()
            ->withCount('sections')
            ->orderBy('name')
            ->paginate(20);

        return response()->json($templates);
    }

    public function store(SaveProcessTemplateRequest $request): JsonResponse
    {
        $template = ProcessTemplate::query()->create($request->validated());

        return response()->json([
            'message' => 'Template process berhasil dibuat.',
            'data' => $template,
        ], 201);
    }

    public function show(ProcessTemplate $processTemplate): JsonResponse
    {
        return response()->json([
            'data' => $processTemplate->load('sections'),
        ]);
    }

    public function update(SaveProcessTemplateRequest $request, ProcessTemplate $processTemplate): JsonResponse
    {
        $processTemplate->update($request->validated());

        return response()->json([
            'message' => 'Template process berhasil diperbarui.',
            'data' => $processTemplate->fresh(),
        ]);
    }

    public function destroy(ProcessTemplate $processTemplate): JsonResponse
    {
        $processTemplate->delete();

        return response()->json([
            'message' => 'Template process berhasil dihapus.',
        ]);
    }
}
