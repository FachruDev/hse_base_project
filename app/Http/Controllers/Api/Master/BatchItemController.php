<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveBatchItemRequest;
use App\Models\Master\BatchItem;
use Illuminate\Http\JsonResponse;

class BatchItemController extends Controller
{
    public function index(): JsonResponse
    {
        $items = BatchItem::query()
            ->orderBy('order_no')
            ->paginate(50);

        return response()->json($items);
    }

    public function store(SaveBatchItemRequest $request): JsonResponse
    {
        $item = BatchItem::query()->create($request->validated());

        return response()->json([
            'message' => 'Batch item berhasil dibuat.',
            'data' => $item,
        ], 201);
    }

    public function show(BatchItem $batchItem): JsonResponse
    {
        return response()->json([
            'data' => $batchItem,
        ]);
    }

    public function update(SaveBatchItemRequest $request, BatchItem $batchItem): JsonResponse
    {
        $batchItem->update($request->validated());

        return response()->json([
            'message' => 'Batch item berhasil diperbarui.',
            'data' => $batchItem->fresh(),
        ]);
    }

    public function destroy(BatchItem $batchItem): JsonResponse
    {
        $batchItem->delete();

        return response()->json([
            'message' => 'Batch item berhasil dihapus.',
        ]);
    }
}
