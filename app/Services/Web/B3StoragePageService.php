<?php

namespace App\Services\Web;

use App\Models\B3Storage\B3StorageInitiatorDepartment;
use App\Models\B3Storage\B3StorageLog;
use App\Models\B3Storage\B3StorageMonthlyApproval;
use App\Models\B3Storage\B3StorageWasteType;
use App\Models\User;
use App\Services\B3Storage\B3StorageService;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class B3StoragePageService
{
    /**
     * @param  array{search: string, status: string, year: int}  $filters
     * @return array<string, mixed>
     */
    public function buildListing(User $user, array $filters): array
    {
        $year = $filters['year'];
        $logs = B3StorageLog::query()
            ->with([
                'wasteType:id,name',
                'initiatorDepartment:id,name',
                'operator:id,name,external_id',
            ])
            ->whereYear('movement_date', $year)
            ->get();

        $approvals = B3StorageMonthlyApproval::query()
            ->with([
                'environmentSupervisor:id,name,external_id',
                'hseDepartmentHead:id,name,external_id',
            ])
            ->where('year', $year)
            ->get()
            ->keyBy('month');

        $rows = collect(range(1, 12))
            ->reverse()
            ->map(fn (int $month): array => $this->mapMonthlyListingRow($year, $month, $logs, $approvals->get($month)))
            ->filter(fn (array $row): bool => $this->matchesMonthlyFilters($row, $filters))
            ->values()
            ->all();

        return [
            'module' => [
                'title' => 'Penyimpanan Limbah B3',
                'subtitle' => 'Laporan bulanan gabungan penyimpanan limbah B3.',
            ],
            'filters' => $filters,
            'capabilities' => [
                'create_log' => $user->can('b3storage.logs.create'),
            ],
            'table' => [
                'data' => $rows,
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
     * @return array<string, mixed>
     */
    public function buildMonthlyDetail(User $user, int $year, int $month, B3StorageService $b3StorageService): array
    {
        $report = $b3StorageService->monthlyReport($month, $year);
        $approvalStatus = (string) $report['approval']['status'];
        $canApprove = $user->can('b3storage.monthly-approval.approve') && $approvalStatus !== 'APPROVED';

        return [
            'module' => [
                'title' => 'Detail Bulanan Penyimpanan Limbah B3',
                'subtitle' => 'Laporan penyimpanan limbah B3 sesuai format rekap fisik.',
            ],
            ...$report,
            'summary' => $this->mapMonthlyDetailSummary($report),
            'approval' => $this->mapMonthlyApprovalPayload($report['approval']),
            'capabilities' => [
                'approve_monthly' => $canApprove,
                'next_approval_role' => $canApprove ? $this->resolveNextApprovalRole($approvalStatus) : null,
                'next_approval_label' => $canApprove ? $this->resolveNextApprovalLabel($approvalStatus) : null,
            ],
        ];
    }

    /**
     * @param  Collection<int, B3StorageLog>  $logs
     * @return array<string, mixed>
     */
    private function mapMonthlyListingRow(
        int $year,
        int $month,
        Collection $logs,
        ?B3StorageMonthlyApproval $approval,
    ): array {
        $monthLogs = $logs->filter(fn (B3StorageLog $log): bool => (int) $log->movement_date?->month === $month);
        $period = Carbon::create($year, $month, 1);
        $approvalStatus = $this->resolveApprovalStatus($approval);

        return [
            'month' => $month,
            'year' => $year,
            'period_label' => $period->translatedFormat('F Y'),
            'total_logs_count' => $monthLogs->count(),
            'incoming_logs_count' => $monthLogs->where('movement_type', 'MASUK')->count(),
            'outgoing_logs_count' => $monthLogs->where('movement_type', 'KELUAR')->count(),
            'total_weight_kg' => $monthLogs->sum(fn (B3StorageLog $log): float => (float) $log->weight_kg),
            'waste_types_count' => $monthLogs
                ->map(fn (B3StorageLog $log): string => $log->wasteType?->name ?? $log->waste_type_other ?? '-')
                ->unique()
                ->count(),
            'departments_count' => $monthLogs
                ->map(fn (B3StorageLog $log): string => $log->initiatorDepartment?->name ?? $log->initiator_department_other ?? '-')
                ->unique()
                ->count(),
            'approval_status' => $approvalStatus,
            'approval_status_label' => $this->resolveApprovalStatusLabel($approvalStatus),
            'environment_supervisor' => $approval?->environmentSupervisor?->name,
            'environment_supervisor_signed_at' => $approval?->environment_supervisor_signed_at?->format('Y-m-d H:i:s'),
            'hse_department_head' => $approval?->hseDepartmentHead?->name,
            'hse_department_head_signed_at' => $approval?->hse_department_head_signed_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * @param  array{search: string, status: string, year: int}  $filters
     */
    private function matchesMonthlyFilters(array $row, array $filters): bool
    {
        if ($filters['search'] !== '') {
            $keyword = mb_strtolower($filters['search']);
            $matchesPeriod = str_contains(mb_strtolower((string) $row['period_label']), $keyword);
            $matchesMonth = str_contains((string) $row['month'], $keyword);

            if (! $matchesPeriod && ! $matchesMonth) {
                return false;
            }
        }

        if ($filters['status'] !== '') {
            return $row['approval_status'] === $filters['status'];
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $report
     * @return array<string, mixed>
     */
    private function mapMonthlyDetailSummary(array $report): array
    {
        $rows = collect($report['rows']);

        return [
            'total_logs_count' => $rows->count(),
            'incoming_logs_count' => $rows->filter(fn (array $row): bool => $row['tanggal_masuk'] !== null)->count(),
            'outgoing_logs_count' => $rows->filter(fn (array $row): bool => $row['tanggal_keluar'] !== null)->count(),
            'total_weight_kg' => $report['totals']['overall'],
            'departments_count' => $rows->pluck('initiator_department')->filter()->unique()->count(),
        ];
    }

    /**
     * @param  array<string, mixed>  $approval
     * @return array<string, mixed>
     */
    private function mapMonthlyApprovalPayload(array $approval): array
    {
        return [
            'status' => $approval['status'],
            'status_label' => $this->resolveApprovalStatusLabel((string) $approval['status']),
            'environment_supervisor' => [
                'id' => $approval['environment_supervisor']['id'],
                'name' => $approval['environment_supervisor']['name'],
                'signed_at' => $this->formatDateTime($approval['environment_supervisor']['signed_at']),
            ],
            'hse_department_head' => [
                'id' => $approval['hse_department_head']['id'],
                'name' => $approval['hse_department_head']['name'],
                'signed_at' => $this->formatDateTime($approval['hse_department_head']['signed_at']),
            ],
            'note' => $approval['note'],
        ];
    }

    private function resolveApprovalStatus(?B3StorageMonthlyApproval $approval): string
    {
        if (! $approval instanceof B3StorageMonthlyApproval) {
            return 'NOT_SUBMITTED';
        }

        if ($approval->environment_supervisor_signed_at === null && $approval->hse_department_head_signed_at === null) {
            return 'NOT_SUBMITTED';
        }

        if ($approval->environment_supervisor_signed_at !== null && $approval->hse_department_head_signed_at !== null) {
            return 'APPROVED';
        }

        return 'PARTIALLY_APPROVED';
    }

    private function resolveApprovalStatusLabel(string $status): string
    {
        return match ($status) {
            'APPROVED' => 'Approved',
            'PARTIALLY_APPROVED' => 'Menunggu HSE Dept Head',
            default => 'Belum Approved',
        };
    }

    private function resolveNextApprovalRole(string $status): ?string
    {
        return match ($status) {
            'NOT_SUBMITTED' => 'ENVIRONMENT_SUPERVISOR',
            'PARTIALLY_APPROVED' => 'HSE_DEPARTMENT_HEAD',
            default => null,
        };
    }

    private function resolveNextApprovalLabel(string $status): ?string
    {
        return match ($status) {
            'NOT_SUBMITTED' => 'Approve Environment Supervisor',
            'PARTIALLY_APPROVED' => 'Approve HSE Dept Head',
            default => null,
        };
    }

    private function formatDateTime(mixed $value): ?string
    {
        if ($value instanceof Carbon) {
            return $value->format('Y-m-d H:i:s');
        }

        if ($value === null) {
            return null;
        }

        return (string) $value;
    }
}
