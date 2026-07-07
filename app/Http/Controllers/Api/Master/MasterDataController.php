<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\BatchItem;
use App\Models\Master\BatchSection;
use App\Models\Master\ChecklistTemplate;
use App\Models\Master\ProcessTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MasterDataController extends Controller
{
    public function checklist(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('master.checklist.view'), Response::HTTP_FORBIDDEN);

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

    public function process(Request $request): JsonResponse
    {
        abort_unless(
            $request->user()?->can('master.process.view') && $request->user()?->can('master.batch.view'),
            Response::HTTP_FORBIDDEN,
        );

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

        $batchSections = BatchSection::query()
            ->orderBy('order_no')
            ->with([
                'items' => fn ($items) => $items->orderBy('order_no'),
            ])
            ->get();

        return response()->json([
            'data' => [
                'templates' => $templates,
                'batch_sections' => $batchSections,
                'batch_items' => $batchItems,
            ],
        ]);
    }
}
