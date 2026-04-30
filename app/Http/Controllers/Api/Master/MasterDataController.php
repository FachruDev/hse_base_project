<?php

namespace App\Http\Controllers\Api\Master;

use App\Models\BatchItem;
use App\Models\ChecklistTemplate;
use App\Http\Controllers\Controller;
use App\Models\ProcessTemplate;
use Illuminate\Http\JsonResponse;

class MasterDataController extends Controller
{
    public function checklist(): JsonResponse
    {
        $templates = ChecklistTemplate::query()
            ->where('is_active', true)
            ->with([
                'items' => fn ($query) => $query
                    ->where('is_active', true)
                    ->orderBy('order_no'),
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $templates,
        ]);
    }

    public function process(): JsonResponse
    {
        $templates = ProcessTemplate::query()
            ->where('is_active', true)
            ->with([
                'sections' => fn ($sections) => $sections
                    ->orderBy('order_no')
                    ->with([
                        'items' => fn ($items) => $items->orderBy('order_no'),
                    ]),
            ])
            ->orderBy('name')
            ->get();

        $batchItems = BatchItem::query()
            ->orderBy('order_no')
            ->get();

        return response()->json([
            'data' => [
                'templates' => $templates,
                'batch_items' => $batchItems,
            ],
        ]);
    }
}
