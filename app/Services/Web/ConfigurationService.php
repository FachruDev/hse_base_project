<?php

namespace App\Services\Web;

use App\Models\Master\Holiday;
use App\Models\Master\OperationalWeekday;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ConfigurationService
{
    /**
     * @return array<string, mixed>
     */
    public function buildWeekendPage(bool $canManage): array
    {
        $weekdays = OperationalWeekday::query()
            ->orderBy('day_of_week_iso')
            ->get();

        return [
            'module' => [
                'title' => 'Konfigurasi Weekend',
                'description' => 'Atur hari yang dianggap libur mingguan (Senin sampai Minggu).',
            ],
            'capabilities' => [
                'manage' => $canManage,
            ],
            'rows' => $weekdays->map(function (OperationalWeekday $weekday): array {
                return [
                    'id' => $weekday->id,
                    'day_of_week_iso' => $weekday->day_of_week_iso,
                    'day_name' => $weekday->day_name,
                    'is_off' => $weekday->is_off,
                ];
            })->all(),
        ];
    }

    /**
     * @param  array{search: string, per_page: int, edit: int|null}  $filters
     * @return array<string, mixed>
     */
    public function buildHolidayPage(array $filters, bool $canManage): array
    {
        $editingRecord = $filters['edit'] !== null
            ? Holiday::query()->find($filters['edit'])
            : null;

        $query = Holiday::query()
            ->orderByDesc('holiday_date')
            ->orderByDesc('id');

        if ($filters['search'] !== '') {
            $search = $filters['search'];

            $query->where(function (Builder $innerQuery) use ($search): void {
                $innerQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('holiday_date', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($filters['per_page'])->withQueryString();

        return [
            'module' => [
                'title' => 'Konfigurasi Holiday',
                'description' => 'Kelola hari libur khusus (di luar weekend).',
            ],
            'capabilities' => [
                'manage' => $canManage,
            ],
            'filters' => $filters,
            'table' => [
                'rows' => $this->mapHolidayRows($paginator->getCollection()),
                'meta' => $this->mapPagination($paginator),
            ],
            'form' => [
                'mode' => $editingRecord instanceof Holiday ? 'edit' : 'create',
                'editing_id' => $editingRecord?->id,
                'title' => $editingRecord instanceof Holiday ? 'Ubah Holiday' : 'Tambah Holiday',
                'submit_label' => $editingRecord instanceof Holiday ? 'Perbarui Holiday' : 'Simpan Holiday',
                'cancel_edit' => $editingRecord instanceof Holiday,
                'values' => [
                    'holiday_date' => $editingRecord?->holiday_date?->format('Y-m-d') ?? '',
                    'name' => $editingRecord?->name ?? '',
                    'description' => $editingRecord?->description ?? '',
                    'is_active' => $editingRecord?->is_active ?? true,
                ],
            ],
        ];
    }

    /**
     * @param  Collection<int, Holiday>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function mapHolidayRows(Collection $rows): array
    {
        return $rows->map(function (Holiday $holiday): array {
            return [
                'id' => $holiday->id,
                'holiday_date' => $holiday->holiday_date?->format('Y-m-d'),
                'name' => $holiday->name,
                'description' => $holiday->description,
                'status' => $holiday->is_active ? 'Aktif' : 'Nonaktif',
                'is_active' => $holiday->is_active,
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
