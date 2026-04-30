<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveProcessSectionRequest;
use App\Models\ProcessSection;
use Illuminate\Http\JsonResponse;

class ProcessSectionController extends Controller
{
    public function index(): JsonResponse
    {
        $sections = ProcessSection::query()
            ->with('template:id,name')
            ->orderBy('template_id')
            ->orderBy('order_no')
            ->paginate(50);

        return response()->json($sections);
    }

    public function store(SaveProcessSectionRequest $request): JsonResponse
    {
        $section = ProcessSection::query()->create($request->validated());

        return response()->json([
            'message' => 'Section process berhasil dibuat.',
            'data' => $section,
        ], 201);
    }

    public function show(ProcessSection $processSection): JsonResponse
    {
        return response()->json([
            'data' => $processSection->load('template:id,name'),
        ]);
    }

    public function update(SaveProcessSectionRequest $request, ProcessSection $processSection): JsonResponse
    {
        $processSection->update($request->validated());

        return response()->json([
            'message' => 'Section process berhasil diperbarui.',
            'data' => $processSection->fresh(),
        ]);
    }

    public function destroy(ProcessSection $processSection): JsonResponse
    {
        $processSection->delete();

        return response()->json([
            'message' => 'Section process berhasil dihapus.',
        ]);
    }
}
