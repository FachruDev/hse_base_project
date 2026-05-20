<?php

namespace App\Services\Web;

use App\Models\Ipal\IpalDailyLog;
use App\Models\Master\BatchItem;
use App\Models\Master\ChecklistTemplate;
use App\Models\Master\ProcessTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class CatatanPengolahanLimbahAirPageService
{
    /**
     * @param  array{search: string, status: string, per_page: int}  $filters
     * @return array<string, mixed>
     */
    public function buildListing(User $user, array $filters): array
    {
        $todayLog = $this->findTodayLog($user);

        $listingQuery = IpalDailyLog::query()
            ->with([
                'operator:id,name,external_id',
                'processLog:id,log_id,status,submitted_at',
            ])
            ->whereBelongsTo($user, 'operator')
            ->orderByDesc('tanggal')
            ->orderByDesc('id');

        if ($filters['search'] !== '') {
            $search = $filters['search'];

            $listingQuery->where(function (Builder $query) use ($search): void {
                $query
                    ->where('tanggal', 'like', "%{$search}%")
                    ->orWhereHas('processLog', function (Builder $processQuery) use ($search): void {
                        $processQuery->where('status', 'like', "%{$search}%");
                    });
            });
        }

        if ($filters['status'] !== '') {
            $this->applyStatusFilter($listingQuery, $filters['status']);
        }

        $paginator = $listingQuery
            ->paginate($filters['per_page'])
            ->withQueryString();

        return [
            'module' => [
                'title' => 'Catatan Pengolahan Limbah Air',
                'subtitle' => 'Riwayat entri operator untuk checklist, proses, dan batch IPAL.',
            ],
            'today_entry' => [
                'filled_today' => $todayLog !== null,
                'status' => $todayLog?->processLog?->status ?? ($todayLog !== null ? 'DRAFT' : null),
                'log_id' => $todayLog?->id,
                'action_label' => $this->resolveActionLabel($todayLog?->processLog?->status, $todayLog !== null),
            ],
            'filters' => $filters,
            'table' => [
                'data' => $this->mapListingRows($paginator->getCollection()),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                    'links' => $paginator->linkCollection()->toArray(),
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function buildForm(User $user): array
    {
        $todayLog = IpalDailyLog::query()
            ->with([
                'checklist.values:id,checklist_id,item_id,status,note',
                'processLog.values:id,process_log_id,item_id,value_text,value_number,note',
                'processLog.batches.values:id,batch_id,item_id,value_text,value_number',
            ])
            ->whereBelongsTo($user, 'operator')
            ->whereDate('tanggal', now()->toDateString())
            ->first();

        $checklistTemplate = ChecklistTemplate::query()
            ->where('is_active', true)
            ->with([
                'items' => fn ($query) => $query
                    ->where('is_active', true)
                    ->orderBy('order_no')
                    ->orderBy('id'),
            ])
            ->orderBy('id')
            ->first();

        $processTemplate = ProcessTemplate::query()
            ->where('is_active', true)
            ->with([
                'sections' => fn ($sectionQuery) => $sectionQuery
                    ->orderBy('order_no')
                    ->orderBy('id')
                    ->with([
                        'items' => fn ($itemQuery) => $itemQuery
                            ->orderBy('order_no')
                            ->orderBy('id'),
                    ]),
            ])
            ->orderBy('id')
            ->first();

        $batchItems = BatchItem::query()
            ->orderBy('order_no')
            ->orderBy('id')
            ->get();

        $checklistValueMap = $todayLog?->checklist?->values
            ? $todayLog->checklist->values->keyBy('item_id')
            : collect();

        $processValueMap = $todayLog?->processLog?->values
            ? $todayLog->processLog->values->keyBy('item_id')
            : collect();

        $batchGroups = $todayLog?->processLog?->batches
            ? $todayLog->processLog->batches
            : collect();

        $checklistItems = $checklistTemplate?->items
            ? $this->mapChecklistItems($checklistTemplate->items, $checklistValueMap)
            : [];

        $processSections = $processTemplate?->sections
            ? $processTemplate->sections->map(function ($section) use ($processValueMap): array {
                return [
                    'id' => $section->id,
                    'name' => $section->name,
                    'items' => $section->items->map(function ($item) use ($processValueMap): array {
                        $value = $processValueMap->get($item->id);

                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'standard_condition' => $item->standard_condition,
                            'input_type' => $item->input_type,
                            'value_text' => $value?->value_text,
                            'value_number' => $value?->value_number,
                            'note' => $value?->note,
                        ];
                    })->all(),
                ];
            })->all()
            : [];

        return [
            'module' => [
                'title' => 'Catatan Pengolahan Limbah Air',
                'subtitle' => 'Workspace pengisian form harian operator IPAL.',
            ],
            'entry' => [
                'tanggal' => now()->toDateString(),
                'operator' => [
                    'name' => $user->name,
                    'external_id' => $user->external_id,
                    'department_name' => $user->department?->name,
                ],
                'mode' => $this->resolveEntryMode($todayLog?->processLog?->status, $todayLog !== null),
                'status' => $todayLog?->processLog?->status ?? ($todayLog !== null ? 'DRAFT' : null),
                'log_id' => $todayLog?->id,
                'action_label' => $this->resolveActionLabel($todayLog?->processLog?->status, $todayLog !== null),
                'read_only' => in_array($todayLog?->processLog?->status, ['SUBMITTED', 'APPROVED'], true),
            ],
            'checklist' => [
                'template_id' => $checklistTemplate?->id,
                'template_name' => $checklistTemplate?->name,
                'items' => $checklistItems,
            ],
            'process' => [
                'template_id' => $processTemplate?->id,
                'template_name' => $processTemplate?->name,
                'sections' => $processSections,
            ],
            'batch' => [
                'max_batch_no' => 7,
                'items' => $batchItems->map(function (BatchItem $item): array {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'input_type' => $item->input_type,
                    ];
                })->all(),
                'groups' => $this->mapBatchGroups($batchGroups, $batchItems),
            ],
        ];
    }

    private function findTodayLog(User $user): ?IpalDailyLog
    {
        return IpalDailyLog::query()
            ->with('processLog:id,log_id,status,submitted_at')
            ->whereBelongsTo($user, 'operator')
            ->whereDate('tanggal', now()->toDateString())
            ->first();
    }

    private function applyStatusFilter(Builder $query, string $status): void
    {
        if ($status === 'DRAFT') {
            $query->where(function (Builder $draftQuery): void {
                $draftQuery
                    ->whereDoesntHave('processLog')
                    ->orWhereHas('processLog', function (Builder $processQuery): void {
                        $processQuery->where('status', 'DRAFT');
                    });
            });

            return;
        }

        $query->whereHas('processLog', function (Builder $processQuery) use ($status): void {
            $processQuery->where('status', $status);
        });
    }

    /**
     * @param  Collection<int, IpalDailyLog>  $logs
     * @return array<int, array<string, mixed>>
     */
    private function mapListingRows(Collection $logs): array
    {
        return $logs->map(function (IpalDailyLog $log): array {
            return [
                'id' => $log->id,
                'tanggal' => $log->tanggal?->format('Y-m-d'),
                'status' => $log->processLog?->status ?? 'DRAFT',
                'created_at' => $log->created_at?->format('Y-m-d H:i:s'),
                'submitted_at' => $log->processLog?->submitted_at?->format('Y-m-d H:i:s'),
            ];
        })->all();
    }

    /**
     * @param  Collection<int, mixed>  $items
     * @param  Collection<int|string, mixed>  $valueMap
     * @return array<int, array<string, mixed>>
     */
    private function mapChecklistItems(Collection $items, Collection $valueMap): array
    {
        return $items->map(function ($item) use ($valueMap): array {
            $value = $valueMap->get($item->id);

            return [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'standard_condition' => $item->standard_condition,
                'status' => $value?->status,
                'note' => $value?->note,
            ];
        })->all();
    }

    /**
     * @param  Collection<int, mixed>  $batches
     * @param  Collection<int, BatchItem>  $batchItems
     * @return array<int, array<string, mixed>>
     */
    private function mapBatchGroups(Collection $batches, Collection $batchItems): array
    {
        if ($batches->isEmpty()) {
            return [];
        }

        return $batches->map(function ($batch) use ($batchItems): array {
            $valueMap = $batch->values->keyBy('item_id');

            return [
                'batch_no' => $batch->batch_no,
                'values' => $batchItems->map(function (BatchItem $item) use ($valueMap): array {
                    $value = $valueMap->get($item->id);

                    return [
                        'item_id' => $item->id,
                        'value_text' => $value?->value_text,
                        'value_number' => $value?->value_number,
                    ];
                })->all(),
            ];
        })->all();
    }

    private function resolveActionLabel(?string $status, bool $filledToday): string
    {
        if (! $filledToday) {
            return 'Isi Harian';
        }

        return match ($status) {
            'SUBMITTED' => 'Lihat Entri Hari Ini',
            'APPROVED' => 'Lihat Entri Hari Ini',
            default => 'Lanjutkan Draft',
        };
    }

    private function resolveEntryMode(?string $status, bool $filledToday): string
    {
        if (! $filledToday) {
            return 'baru';
        }

        if (in_array($status, ['SUBMITTED', 'APPROVED'], true)) {
            return 'lihat';
        }

        return 'draft';
    }
}
