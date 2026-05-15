<?php

namespace App\Services\Web;

use App\Models\B3Storage\B3StorageInitiatorDepartment;
use App\Models\B3Storage\B3StorageLog;
use App\Models\B3Storage\B3StorageWasteType;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class B3StoragePageService
{
    /**
     * @param  array{search: string, movement_type: string, month: int, year: int, per_page: int}  $filters
     * @return array<string, mixed>
     */
    public function buildListing(User $user, array $filters): array
    {
        $query = B3StorageLog::query()
            ->with([
                'wasteType:id,name',
                'initiatorDepartment:id,name',
                'operator:id,name,external_id',
            ])
            ->whereBelongsTo($user, 'operator')
            ->whereMonth('movement_date', $filters['month'])
            ->whereYear('movement_date', $filters['year'])
            ->orderByDesc('movement_date')
            ->orderByDesc('id');

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function (Builder $builder) use ($search): void {
                $builder
                    ->where('document_number', 'like', "%{$search}%")
                    ->orWhere('waste_type_other', 'like', "%{$search}%")
                    ->orWhere('initiator_department_other', 'like', "%{$search}%")
                    ->orWhereHas('wasteType', function (Builder $relationQuery) use ($search): void {
                        $relationQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('initiatorDepartment', function (Builder $relationQuery) use ($search): void {
                        $relationQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($filters['movement_type'] !== '') {
            $query->where('movement_type', $filters['movement_type']);
        }

        $paginator = $query->paginate($filters['per_page'])->withQueryString();

        return [
            'module' => [
                'title' => 'Penyimpanan Limbah B3',
                'subtitle' => 'Riwayat pencatatan masuk dan keluar limbah B3.',
            ],
            'filters' => $filters,
            'table' => [
                'data' => $this->mapRows($paginator->getCollection()),
                'meta' => $this->mapPagination($paginator),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function buildForm(User $user): array
    {
        $wasteTypeOptions = B3StorageWasteType::query()
            ->where('is_active', true)
            ->orderBy('order_no')
            ->orderBy('id')
            ->get(['id', 'name'])
            ->map(static fn (B3StorageWasteType $record): array => [
                'value' => $record->id,
                'label' => $record->name,
            ])
            ->all();

        $initiatorDepartmentOptions = B3StorageInitiatorDepartment::query()
            ->where('is_active', true)
            ->orderBy('order_no')
            ->orderBy('id')
            ->get(['id', 'name'])
            ->map(static fn (B3StorageInitiatorDepartment $record): array => [
                'value' => $record->id,
                'label' => $record->name,
            ])
            ->all();

        return [
            'module' => [
                'title' => 'Form Penyimpanan Limbah B3',
                'subtitle' => 'Input data harian untuk kebutuhan rekap dan approval bulanan.',
            ],
            'entry' => [
                'tanggal_default' => now()->toDateString(),
                'jam_default' => now()->format('H:i'),
                'operator' => [
                    'name' => $user->name,
                    'external_id' => $user->external_id,
                    'department_name' => $user->department?->name,
                ],
            ],
            'options' => [
                'movement_types' => [
                    ['value' => 'MASUK', 'label' => 'Masuk'],
                    ['value' => 'KELUAR', 'label' => 'Keluar'],
                ],
                'waste_types' => $wasteTypeOptions,
                'initiator_departments' => $initiatorDepartmentOptions,
            ],
        ];
    }

    /**
     * @param  Collection<int, B3StorageLog>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function mapRows(Collection $rows): array
    {
        return $rows->map(static function (B3StorageLog $log): array {
            return [
                'id' => $log->id,
                'movement_date' => $log->movement_date?->format('Y-m-d'),
                'movement_time' => $log->movement_time,
                'movement_type' => $log->movement_type,
                'waste_type' => $log->wasteType?->name ?? $log->waste_type_other,
                'initiator_department' => $log->initiatorDepartment?->name ?? $log->initiator_department_other,
                'weight_kg' => $log->weight_kg,
                'document_number' => $log->document_number,
                'photo_path' => $log->photo_path,
            ];
        })->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function mapPagination(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'links' => $paginator->linkCollection()->toArray(),
        ];
    }
}
