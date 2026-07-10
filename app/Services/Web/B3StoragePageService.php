<?php

namespace App\Services\Web;

use App\Models\B3Storage\B3StorageInitiatorDepartment;
use App\Models\B3Storage\B3StorageLog;
use App\Models\B3Storage\B3StorageMonthlyApproval;
use App\Models\B3Storage\B3StorageWasteType;
use App\Models\User;
use App\Services\B3Storage\B3StorageService;
use App\Services\Ipal\IpalLogService;
use App\Support\Reports\FmReportFormatter;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class B3StoragePageService
{
    /**
     * @param  array{search: string, status: string, year: int, date_from: string, date_to: string}  $filters
     * @return array<string, mixed>
     */
    public function buildListing(User $user, array $filters, IpalLogService $ipalLogService): array
    {
        $year = $filters['year'];
        $logs = B3StorageLog::query()
            ->with([
                'wasteType:id,name',
                'initiatorDepartment:id,name',
                'operator:id,name,external_id',
            ])
            ->whereYear('movement_date', $year)
            ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('movement_date', '>=', $filters['date_from']))
            ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('movement_date', '<=', $filters['date_to']))
            ->get();

        $approvals = B3StorageMonthlyApproval::query()
            ->with([
                'environmentSupervisor:id,name,external_id',
                'hseDepartmentHead:id,name,external_id',
            ])
            ->where('year', $year)
            ->get()
            ->keyBy('month');

        $currentYear = (int) now()->year;
        $currentMonth = (int) now()->month;

        $startMonth = ($year === 2026) ? 6 : 1;
        $endMonth = ($year === $currentYear) ? $currentMonth : 12;

        $rows = collect($year >= 2026 && $year <= $currentYear && $startMonth <= $endMonth ? range($startMonth, $endMonth) : [])
            ->reverse()
            ->map(fn (int $month): array => $this->mapMonthlyListingRow($user, $year, $month, $logs, $approvals->get($month), $ipalLogService))
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
                'can_approve_b3_monthly' => $user->can('b3storage.monthly-approval.approve'),
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
        $canSelectInitiatorUser = $user->can('b3storage.logs.select-user');

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
                    'email' => $user->email,
                    'department_name' => $user->department?->name,
                ],
            ],
            'capabilities' => [
                'select_initiator_user' => $canSelectInitiatorUser,
                'view_monthly_report' => $user->can('b3storage.monthly-report.view'),
            ],
            'options' => [
                'movement_types' => [
                    ['value' => 'MASUK', 'label' => 'Masuk'],
                    ['value' => 'KELUAR', 'label' => 'Keluar'],
                ],
                'waste_types' => $wasteTypeOptions,
                'initiator_departments' => $initiatorDepartmentOptions,
                'initiator_users' => [],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    /**
     * @param  array{date_from: string, date_to: string}  $filters
     * @return array<string, mixed>
     */
    public function buildMonthlyDetail(
        User $user,
        int $year,
        int $month,
        B3StorageService $b3StorageService,
        IpalLogService $ipalLogService,
        array $filters = [],
    ): array {
        $filters = [
            'date_from' => (string) ($filters['date_from'] ?? ''),
            'date_to' => (string) ($filters['date_to'] ?? ''),
        ];
        $report = $b3StorageService->monthlyReport($month, $year, $filters);
        $approvalStatus = (string) $report['approval']['status'];
        $nextApprovalRole = $this->resolveNextApprovalRole($approvalStatus);
        $hasLogs = B3StorageLog::query()
            ->whereMonth('movement_date', $month)
            ->whereYear('movement_date', $year)
            ->exists();
        $canApprovePeriod = $ipalLogService->isMonthCompletable($year, $month);
        $canApproveRole = $nextApprovalRole !== null && $this->canApproveRole($user, $nextApprovalRole);
        $canApprove = $user->can('b3storage.monthly-approval.approve')
            && $approvalStatus !== 'APPROVED'
            && $canApproveRole
            && $canApprovePeriod
            && $hasLogs;

        return [
            'module' => [
                'title' => 'Detail Bulanan Penyimpanan Limbah B3',
                'subtitle' => 'Laporan penyimpanan limbah B3 sesuai format rekap fisik.',
            ],
            ...$report,
            'summary' => $this->mapMonthlyDetailSummary($report),
            'approval' => $this->mapMonthlyApprovalPayload($report['approval'], $ipalLogService, $year, $month),
            'filters' => $filters,
            'capabilities' => [
                'can_approve_period' => $canApprovePeriod,
                'approve_monthly' => $canApprove,
                'next_approval_role' => $nextApprovalRole,
                'next_approval_label' => $this->resolveNextApprovalLabel($approvalStatus),
                'approval_blocked_reason' => $canApprove ? null : $this->resolveApprovalBlockedReason($user, $approvalStatus, $nextApprovalRole, $canApprovePeriod, $hasLogs),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $monthlyDetail
     * @return array<int, array<int, float|int|string|null>>
     */
    public function buildMonthlyExcelRows(array $monthlyDetail): array
    {
        $wasteTypes = $monthlyDetail['columns']['waste_types'] ?? [];
        $rows = [
            ['FM.HSE.038.02', 'PENYIMPANAN LIMBAH B3'],
            ['Tgl. Berlaku', '23 April 2018'],
            ['Bulan', (string) ($monthlyDetail['period']['label'] ?? '-')],
            ['Rentang Data', ($monthlyDetail['period']['date_from'] ?? '-').' s/d '.($monthlyDetail['period']['date_to'] ?? '-')],
            [],
        ];

        $header = [
            'No',
            'Tanggal',
        ];

        foreach ($wasteTypes as $wasteType) {
            $header[] = (string) ($wasteType['name'] ?? '-').' (Kg)';
        }

        if (($monthlyDetail['columns']['has_other_column'] ?? false) === true) {
            $header[] = 'Lain-lain (Kg)';
        }

        array_push(
            $header,
            'No. Dokumen',
            'Dept. Inisiator',
            'Paraf Petugas Dept. Inisiator',
            'Paraf Operator TPS LB3',
            'Approval Environment SPV',
            'Approval HSE Dept Head',
        );

        $rows[] = $header;

        foreach ($monthlyDetail['rows'] as $row) {
            $line = [
                $row['no'],
                $row['movement_date'] ?? '-',
            ];

            foreach ($wasteTypes as $wasteType) {
                $wasteTypeId = $wasteType['id'] ?? null;
                $line[] = FmReportFormatter::decimal($row['weights_by_waste_type'][$wasteTypeId] ?? null);
            }

            if (($monthlyDetail['columns']['has_other_column'] ?? false) === true) {
                $line[] = FmReportFormatter::decimal($row['weight_other'] ?? null);
            }

            array_push(
                $line,
                $row['document_number'] ?? '-',
                $row['initiator_department'] ?? '-',
                $row['initiator_user_name'] ?? '-',
                $row['operator_name'] ?? '-',
                $monthlyDetail['approval']['environment_supervisor']['name'] ?? '-',
                $monthlyDetail['approval']['hse_department_head']['name'] ?? '-',
            );

            $rows[] = $line;
        }

        $totalRow = [
            'TOTAL',
            '',
        ];

        foreach ($wasteTypes as $wasteType) {
            $wasteTypeId = $wasteType['id'] ?? null;
            $totalRow[] = FmReportFormatter::decimal($monthlyDetail['totals']['by_waste_type'][$wasteTypeId] ?? 0);
        }

        if (($monthlyDetail['columns']['has_other_column'] ?? false) === true) {
            $totalRow[] = FmReportFormatter::decimal($monthlyDetail['totals']['other'] ?? 0);
        }

        $totalRow = [
            ...$totalRow,
            '',
            '',
            '',
            '',
            '',
            '',
        ];

        $rows[] = $totalRow;

        return $rows;
    }

    /**
     * @return array<string, mixed>
     */
    public function buildLogPdfDetail(B3StorageLog $log): array
    {
        $log->loadMissing([
            'wasteType:id,name',
            'initiatorDepartment:id,name',
            'initiatorUser:id,name',
            'operator:id,external_id,name',
        ]);

        return [
            'id' => $log->id,
            'movement_type' => $log->movement_type,
            'movement_date' => $log->movement_date?->toDateString(),
            'movement_time' => $log->movement_time,
            'waste_type_name' => $log->wasteType?->name ?? $log->waste_type_other ?? '-',
            'weight_kg' => $log->weight_kg,
            'document_number' => $log->document_number,
            'initiator_department' => $log->initiatorDepartment?->name ?? $log->initiator_department_other,
            'initiator_user_name' => $log->initiator_user_name ?? $log->initiatorUser?->name,
            'operator_name' => $log->operator?->name,
            'operator_external_id' => $log->operator?->external_id,
            'note' => $log->note,
            'created_at' => $log->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * @param  Collection<int, B3StorageLog>  $logs
     * @return array<string, mixed>
     */
    private function mapMonthlyListingRow(
        User $user,
        int $year,
        int $month,
        Collection $logs,
        ?B3StorageMonthlyApproval $approval,
        IpalLogService $ipalLogService,
    ): array {
        $monthLogs = $logs->filter(fn (B3StorageLog $log): bool => (int) $log->movement_date?->month === $month);
        $period = Carbon::create($year, $month, 1);
        $approvalStatus = $this->resolveApprovalStatus($approval);
        $nextApprovalRole = $this->resolveNextApprovalRole($approvalStatus);
        $canApprovePeriod = $ipalLogService->isMonthCompletable($year, $month);
        $canApproveForUser = $nextApprovalRole !== null && $this->canApproveRole($user, $nextApprovalRole);

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
            'environment_supervisor_signed_at' => $approval?->environment_supervisor_signed_at !== null
                ? $ipalLogService->monthlyApprovalEffectiveDate($year, $month)->format('Y-m-d')
                : null,
            'hse_department_head' => $approval?->hseDepartmentHead?->name,
            'hse_department_head_signed_at' => $approval?->hse_department_head_signed_at !== null
                ? $ipalLogService->monthlyApprovalEffectiveDate($year, $month)->format('Y-m-d')
                : null,
            'can_approve_period' => $canApprovePeriod,
            'can_approve_monthly' => $user->can('b3storage.monthly-approval.approve') && $canApprovePeriod && $canApproveForUser && $monthLogs->isNotEmpty(),
            'next_approval_role' => $nextApprovalRole,
            'next_approval_label' => $this->resolveNextApprovalLabel($approvalStatus),
            'approval_blocked_label' => $this->resolveListingApprovalBlockedLabel($user, $approvalStatus, $nextApprovalRole, $canApprovePeriod, $monthLogs->isNotEmpty()),
        ];
    }

    /**
     * @param  array{search: string, status: string, year: int, date_from: string, date_to: string}  $filters
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

        if ($filters['date_from'] !== '' || $filters['date_to'] !== '') {
            $monthStart = Carbon::create($row['year'], $row['month'], 1)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();

            if ($filters['date_from'] !== '') {
                $dateFrom = Carbon::parse($filters['date_from'])->startOfDay();

                if ($monthEnd->lt($dateFrom)) {
                    return false;
                }
            }

            if ($filters['date_to'] !== '') {
                $dateTo = Carbon::parse($filters['date_to'])->endOfDay();

                if ($monthStart->gt($dateTo)) {
                    return false;
                }
            }

            if ((int) $row['total_logs_count'] === 0) {
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
    private function mapMonthlyApprovalPayload(array $approval, IpalLogService $ipalLogService, int $year, int $month): array
    {
        return [
            'status' => $approval['status'],
            'status_label' => $this->resolveApprovalStatusLabel((string) $approval['status']),
            'environment_supervisor' => [
                'id' => $approval['environment_supervisor']['id'],
                'name' => $approval['environment_supervisor']['name'],
                'signed_at' => $approval['environment_supervisor']['signed_at'] !== null
                    ? $ipalLogService->monthlyApprovalEffectiveDate($year, $month)->format('Y-m-d')
                    : null,
            ],
            'hse_department_head' => [
                'id' => $approval['hse_department_head']['id'],
                'name' => $approval['hse_department_head']['name'],
                'signed_at' => $approval['hse_department_head']['signed_at'] !== null
                    ? $ipalLogService->monthlyApprovalEffectiveDate($year, $month)->format('Y-m-d')
                    : null,
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

    private function canApproveRole(User $user, string $approvalRole): bool
    {
        if ($user->hasAnyRole(['superadmin', 'admin'])) {
            return true;
        }

        return match ($approvalRole) {
            'ENVIRONMENT_SUPERVISOR' => $user->hasRole('supervisor'),
            'HSE_DEPARTMENT_HEAD' => $user->hasRole('hse_dept_head'),
            default => false,
        };
    }

    private function resolveApprovalBlockedReason(User $user, string $status, ?string $nextApprovalRole, bool $canApprovePeriod = true, bool $hasLogs = true): ?string
    {
        if ($status === 'APPROVED') {
            return null;
        }

        if (! $hasLogs) {
            return 'Belum ada log B3.';
        }

        if (! $canApprovePeriod) {
            return 'Belum masuk periode approval.';
        }

        if ($nextApprovalRole === 'ENVIRONMENT_SUPERVISOR' && $user->hasRole('hse_dept_head')) {
            return 'Menunggu approve Environment SPV.';
        }

        if ($nextApprovalRole === 'HSE_DEPARTMENT_HEAD' && $user->hasRole('supervisor')) {
            return 'Menunggu approve HSE Dept Head.';
        }

        if ($nextApprovalRole !== null && ! $this->canApproveRole($user, $nextApprovalRole)) {
            return 'User ini tidak sesuai role approval tahap ini.';
        }

        return null;
    }

    private function resolveListingApprovalBlockedLabel(User $user, string $status, ?string $nextApprovalRole, bool $canApprovePeriod, bool $hasLogs): ?string
    {
        if ($status === 'APPROVED') {
            return null;
        }

        if (! $hasLogs) {
            return 'Belum ada log B3';
        }

        if (! $canApprovePeriod) {
            return 'Belum masuk periode approval';
        }

        return $this->resolveApprovalBlockedReason($user, $status, $nextApprovalRole);
    }
}
