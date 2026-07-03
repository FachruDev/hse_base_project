<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveBatchSectionRequest;
use App\Models\Master\BatchSection;
use Illuminate\Http\JsonResponse;

class BatchSectionController extends Controller
{
    public function index(): JsonResponse
    {
        $sections = BatchSection::query()
            ->withCount('items')
            ->orderBy('order_no')
            ->orderBy('id')
            ->paginate(50);

        return response()->json($sections);
    }

    public function store(SaveBatchSectionRequest $request): JsonResponse
    {
        $section = BatchSection::query()->create($request->validated());

        return response()->json([
            'message' => 'Batch section berhasil dibuat.',
            'data' => $section,
        ], 201);
    }

    public function show(BatchSection $batchSection): JsonResponse
    {
        return response()->json([
            'data' => $batchSection->loadCount('items'),
        ]);
    }

    public function update(SaveBatchSectionRequest $request, BatchSection $batchSection): JsonResponse
    {
        $batchSection->update($request->validated());

        return response()->json([
            'message' => 'Batch section berhasil diperbarui.',
            'data' => $batchSection->fresh()->loadCount('items'),
        ]);
    }

    public function destroy(BatchSection $batchSection): JsonResponse
    {
        $batchSection->delete();

        return response()->json([
            'message' => 'Batch section berhasil dihapus.',
        ]);
    }
}
