<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\SaveChecklistItemRequest;
use App\Models\Master\ChecklistItem;
use Illuminate\Http\JsonResponse;

class ChecklistItemController extends Controller
{
    public function index(): JsonResponse
    {
        $items = ChecklistItem::query()
            ->with('template:id,name')
            ->orderBy('template_id')
            ->orderBy('order_no')
            ->paginate(50);

        return response()->json($items);
    }

    public function store(SaveChecklistItemRequest $request): JsonResponse
    {
        $item = ChecklistItem::query()->create($request->validated());

        return response()->json([
            'message' => 'Checklist item berhasil dibuat.',
            'data' => $item,
        ], 201);
    }

    public function show(ChecklistItem $checklistItem): JsonResponse
    {
        return response()->json([
            'data' => $checklistItem->load('template:id,name'),
        ]);
    }

    public function update(SaveChecklistItemRequest $request, ChecklistItem $checklistItem): JsonResponse
    {
        $checklistItem->update($request->validated());

        return response()->json([
            'message' => 'Checklist item berhasil diperbarui.',
            'data' => $checklistItem->fresh(),
        ]);
    }

    public function destroy(ChecklistItem $checklistItem): JsonResponse
    {
        $checklistItem->delete();

        return response()->json([
            'message' => 'Checklist item berhasil dihapus.',
        ]);
    }
}
