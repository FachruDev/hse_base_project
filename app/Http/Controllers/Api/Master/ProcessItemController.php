<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveProcessItemRequest;
use App\Models\Master\ProcessItem;
use Illuminate\Http\JsonResponse;

class ProcessItemController extends Controller
{
    public function index(): JsonResponse
    {
        $items = ProcessItem::query()
            ->with('section:id,template_id,name')
            ->orderBy('section_id')
            ->orderBy('order_no')
            ->paginate(50);

        return response()->json($items);
    }

    public function store(SaveProcessItemRequest $request): JsonResponse
    {
        $item = ProcessItem::query()->create($request->validated());

        return response()->json([
            'message' => 'Process item berhasil dibuat.',
            'data' => $item,
        ], 201);
    }

    public function show(ProcessItem $processItem): JsonResponse
    {
        return response()->json([
            'data' => $processItem->load('section:id,template_id,name'),
        ]);
    }

    public function update(SaveProcessItemRequest $request, ProcessItem $processItem): JsonResponse
    {
        $processItem->update($request->validated());

        return response()->json([
            'message' => 'Process item berhasil diperbarui.',
            'data' => $processItem->fresh(),
        ]);
    }

    public function destroy(ProcessItem $processItem): JsonResponse
    {
        $processItem->delete();

        return response()->json([
            'message' => 'Process item berhasil dihapus.',
        ]);
    }
}
