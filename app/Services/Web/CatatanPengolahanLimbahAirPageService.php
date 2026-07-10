<?php

namespace App\Services\Web;

use App\Models\Ipal\IpalChecklistApproval;
use App\Models\Ipal\IpalDailyLog;
use App\Models\Ipal\IpalProcessMonthlyApproval;
use App\Models\Master\BatchItem;
use App\Models\Master\BatchSection;
use App\Models\Master\ChecklistTemplate;
use App\Models\Master\ProcessTemplate;
use App\Models\User;
use App\Services\Ipal\IpalLogService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\URL;

class CatatanPengolahanLimbahAirPageService
{
    /**
     * @param  array{search: string, status: string, year: int, per_page: int, date_from: string, date_to: string}  $filters
     * @return array<string, mixed>
     */
    public function buildListing(User $user, array $filters, IpalLogService $ipalLogService): array
    {
        $todayLog = $this->findDailyLog($user, now()->toDateString());
        $year = $filters['year'];

        $logs = IpalDailyLog::query()
            ->with([
                'checklist:id,log_id,template_id',
                'processLog:id,log_id,status,submitted_at',
                'processLog.batches:id,process_log_id,batch_no',
            ])
            ->whereYear('tanggal', $year)
            ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('tanggal', '>=', $filters['date_from']))
            ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('tanggal', '<=', $filters['date_to']))
            ->get();

        $approvals = IpalChecklistApproval::query()
            ->with('supervisor:id,name,external_id')
            ->where('year', $year)
            ->get()
            ->keyBy('month');

        $processApprovals = IpalProcessMonthlyApproval::query()
            ->with('supervisor:id,name,external_id')
            ->where('year', $year)
            ->get()
            ->keyBy('month');

        $currentYear = (int) now()->year;
        $currentMonth = (int) now()->month;

        $startMonth = ($year === 2026) ? 6 : 1;
        $endMonth = ($year === $currentYear) ? $currentMonth : 12;

        $months = ($year >= 2026 && $year <= $currentYear && $startMonth <= $endMonth)
            ? range($startMonth, $endMonth)
            : [];

        $rows = collect($months)
            ->reverse()
            ->map(fn (int $month): array => $this->mapMonthlyListingRow(
                $year,
                $month,
                $logs,
                $approvals->get($month),
                $processApprovals->get($month),
                $ipalLogService,
            ))
            ->filter(fn (array $row): bool => $this->matchesMonthlyFilters($row, $filters))
            ->values()
            ->all();

        return [
            'module' => [
                'title' => 'Catatan Pengolahan Limbah Air',
                'subtitle' => 'Laporan bulanan gabungan checklist, catatan proses, dan batch mixing IPAL.',
            ],
            'today_entry' => [
                'filled_today' => $todayLog !== null,
                'status' => $todayLog?->processLog?->status ?? ($todayLog !== null ? 'DRAFT' : null),
                'log_id' => $todayLog?->id,
                'action_label' => $this->resolveActionLabel($todayLog?->processLog?->status, $todayLog !== null),
            ],
            'filters' => $filters,
            'capabilities' => [
                'can_approve_process_monthly' => $user->can('ipal.logs.approve'),
                'can_reopen_process_monthly' => $user->can('ipal.logs.reopen-monthly'),
            ],
            'table' => [
                'data' => $rows,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    /**
     * @param  array{date_from?: string, date_to?: string}  $filters
     * @return array<string, mixed>
     */
    public function buildMonthlyDetail(User $user, int $year, int $month, IpalLogService $ipalLogService, array $filters = []): array
    {
        $period = Carbon::create($year, $month, 1)->startOfMonth();
        [$effectiveStart, $effectiveEnd] = $this->resolveEffectivePeriodRange($period, $filters);
        $logs = IpalDailyLog::query()
            ->with([
                'operator:id,name,external_id,department_id',
                'operator.department:id,name',
                'checklist.values.item:id,name,category,standard_condition,order_no',
                'checklist.values.attachments',
                'processLog.approval.operator:id,name,external_id',
                'processLog.approval.supervisor:id,name,external_id',
                'processLog.batches:id,process_log_id,batch_no',
                'processLog.batches.values.item.section:id,name,order_no',
            ])
            ->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->when($effectiveStart->lte($effectiveEnd), fn ($query) => $query->whereDate('tanggal', '>=', $effectiveStart->toDateString()))
            ->when($effectiveStart->lte($effectiveEnd), fn ($query) => $query->whereDate('tanggal', '<=', $effectiveEnd->toDateString()))
            ->when($effectiveStart->gt($effectiveEnd), fn ($query) => $query->whereRaw('1 = 0'))
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->get();

        $approval = IpalChecklistApproval::query()
            ->with('supervisor:id,name,external_id')
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        return [
            'module' => [
                'title' => 'Detail Bulanan IPAL',
                'subtitle' => 'Rekap checklist pemeriksaan unit dan daftar catatan proses harian.',
            ],
            'period' => [
                'month' => $month,
                'year' => $year,
                'label' => $period->translatedFormat('F Y'),
                'date_from' => $effectiveStart->lte($period->copy()->endOfMonth()) ? $effectiveStart->toDateString() : $period->copy()->startOfMonth()->toDateString(),
                'date_to' => $effectiveEnd->gte($period->copy()->startOfMonth()) ? $effectiveEnd->toDateString() : $period->copy()->endOfMonth()->toDateString(),
                'days' => $this->mapPeriodDays($period, $effectiveStart, $effectiveEnd),
            ],
            'filters' => [
                'date_from' => (string) ($filters['date_from'] ?? ''),
                'date_to' => (string) ($filters['date_to'] ?? ''),
            ],
            'summary' => $this->mapMonthlySummary($logs, $approval),
            'checklist_matrix' => $this->buildChecklistMatrix($period, $logs, $user, $effectiveStart, $effectiveEnd),
            'process_rows' => $this->mapMonthlyProcessRows($logs),
            'approval' => $this->mapChecklistApproval($approval, $ipalLogService, $year, $month),
            'capabilities' => [
                'approve_checklist' => ($user->can('ipal.logs.approve')
                    && $ipalLogService->isMonthlyProcessApprovalDay($year, $month)
                    && ! $this->isChecklistApprovalComplete($approval)),
                'can_approve_period' => $ipalLogService->isMonthlyProcessApprovalDay($year, $month),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function buildForm(User $user, string $date): array
    {
        return $this->buildEntryPayload(
            $user,
            $date,
            $this->findDailyLog($user, $date),
            false,
            $user,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function buildDailyDetail(IpalDailyLog $log, User $viewer): array
    {
        $log->loadMissing([
            'operator.department',
            'checklist.values:id,checklist_id,item_id,status,note',
            'checklist.values.attachments',
            'processLog.values:id,process_log_id,item_id,value_text,value_number,note',
            'processLog.values.attachments',
            'processLog.batches.values:id,batch_id,item_id,value_text,value_number',
            'processLog.approval',
        ]);

        $processStatus = $log->processLog?->status;
        $isApprovedBySupervisor = $log->processLog?->approval?->supervisor_signed_at !== null;
        $canApproveDailyProcess = $viewer->can('ipal.logs.approve')
            && $processStatus === 'SUBMITTED'
            && ! $isApprovedBySupervisor;
        $canReopenDailyProcess = $viewer->can('ipal.logs.reopen')
            && in_array($processStatus, ['APPROVED', 'SUBMITTED'], strict: true)
            && $isApprovedBySupervisor;

        $payload = $this->buildEntryPayload(
            $log->operator,
            $log->tanggal?->format('Y-m-d') ?? now()->toDateString(),
            $log,
            true,
            $viewer,
        );

        $payload['capabilities']['approve_daily_process'] = $canApproveDailyProcess;
        $payload['capabilities']['reopen_daily_process'] = $canReopenDailyProcess;

        return $payload;
    }

    private function findDailyLog(User $user, string $date): ?IpalDailyLog
    {
        return IpalDailyLog::query()
            ->with([
                'checklist.values:id,checklist_id,item_id,status,note',
                'checklist.values.attachments',
                'processLog.values:id,process_log_id,item_id,value_text,value_number,note',
                'processLog.values.attachments',
                'processLog.batches.values:id,batch_id,item_id,value_text,value_number',
            ])
            ->whereBelongsTo($user, 'operator')
            ->whereDate('tanggal', $date)
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function buildEntryPayload(User $user, string $date, ?IpalDailyLog $log, bool $forceReadOnly, ?User $viewer = null): array
    {
        $user->loadMissing('department');
        $viewer ??= $user;

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

        $batchSections = BatchSection::query()
            ->with(['items' => fn ($itemQuery) => $itemQuery->orderBy('order_no')->orderBy('id')])
            ->orderBy('order_no')
            ->orderBy('id')
            ->get();

        $batchItems = $batchSections->flatMap->items->values();

        $processStatus = $log?->processLog?->status;
        $isApprovedBySupervisor = $log?->processLog?->approval?->supervisor_signed_at !== null;
        $processReadOnly = $forceReadOnly
            || in_array($processStatus, ['APPROVED', 'SUBMITTED'], true)
            || $isApprovedBySupervisor;
        $checklistReadOnly = $processReadOnly || $this->isChecklistPeriodApproved($date);

        return [
            'module' => [
                'title' => 'Catatan Pengolahan Limbah Air',
                'subtitle' => $forceReadOnly
                    ? 'Detail read-only catatan proses dan batch mixing harian.'
                    : 'Workspace pengisian form harian operator IPAL.',
            ],
            'entry' => [
                'tanggal' => $date,
                'operator' => [
                    'name' => $user->name,
                    'external_id' => $user->external_id,
                    'department_name' => $user->department?->name,
                ],
                'mode' => $this->resolveEntryMode($processStatus, $log !== null, $forceReadOnly, $isApprovedBySupervisor),
                'status' => $processStatus ?? ($log !== null ? 'DRAFT' : null),
                'log_id' => $log?->id,
                'action_label' => $this->resolveActionLabel($processStatus, $log !== null),
                'read_only' => $forceReadOnly || $processReadOnly,
            ],
            'checklist' => [
                'template_id' => $checklistTemplate?->id,
                'template_name' => $checklistTemplate?->name,
                'read_only' => $checklistReadOnly,
                'items' => $checklistTemplate?->items
                    ? $this->mapChecklistItems(
                        $checklistTemplate->items,
                        $log?->checklist?->values ? $log->checklist->values->keyBy('item_id') : collect(),
                        $viewer,
                    )
                    : [],
            ],
            'process' => [
                'template_id' => $processTemplate?->id,
                'template_name' => $processTemplate?->name,
                'read_only' => $processReadOnly,
                'sections' => $processTemplate?->sections
                    ? $this->mapProcessSections(
                        $processTemplate->sections,
                        $log?->processLog?->values ? $log->processLog->values->keyBy('item_id') : collect(),
                        $viewer,
                    )
                    : [],
            ],
            'batch' => [
                'max_batch_no' => 7,
                'sections' => $batchSections->map(fn (BatchSection $section): array => [
                    'id' => $section->id,
                    'name' => $section->name,
                    'items' => $section->items->map(fn (BatchItem $item): array => [
                        'id' => $item->id,
                        'name' => $item->name,
                        'input_type' => $item->input_type,
                    ])->all(),
                ])->all(),
                'groups' => $this->mapBatchGroups(
                    $log?->processLog?->batches ? $log->processLog->batches : collect(),
                    $batchItems,
                ),
            ],
            'capabilities' => [
                'approve_daily_process' => false,
                'reopen_daily_process' => false,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    /**
     * @param  array{date_from?: string, date_to?: string}  $filters
     * @return array<string, mixed>
     */
    public function buildMonthlyPdfDetail(User $user, int $year, int $month, IpalLogService $ipalLogService, array $filters = []): array
    {
        $detail = $this->buildMonthlyDetail($user, $year, $month, $ipalLogService, $filters);
        $period = Carbon::create($year, $month, 1)->startOfMonth();
        [$effectiveStart, $effectiveEnd] = $this->resolveEffectivePeriodRange($period, $filters);
        $detail['checklist_note_rows'] = $this->mapChecklistNoteRows($detail['checklist_matrix'] ?? []);

        $logs = IpalDailyLog::query()
            ->with([
                'operator:id,name,external_id,department_id',
                'operator.department:id,name',
                'processLog.batches.values.item.section:id,name,order_no',
            ])
            ->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->when($effectiveStart->lte($effectiveEnd), fn ($query) => $query->whereDate('tanggal', '>=', $effectiveStart->toDateString()))
            ->when($effectiveStart->lte($effectiveEnd), fn ($query) => $query->whereDate('tanggal', '<=', $effectiveEnd->toDateString()))
            ->when($effectiveStart->gt($effectiveEnd), fn ($query) => $query->whereRaw('1 = 0'))
            ->orderBy('tanggal')
            ->orderBy('id')
            ->get();

        $detail['batch_rows'] = $this->mapMonthlyBatchRows($logs);

        return $detail;
    }

    /**
     * @param  array<int, array<string, mixed>>  $matrix
     * @return array<int, array{date: string, item_name: string, operator: string|null, note: string}>
     */
    private function mapChecklistNoteRows(array $matrix): array
    {
        return collect($matrix)
            ->flatMap(function (array $row): array {
                return collect($row['cells'] ?? [])
                    ->flatMap(function (array $cell) use ($row): array {
                        return collect($cell['details'] ?? [])
                            ->filter(fn (array $detail): bool => is_string($detail['note'] ?? null) && trim((string) $detail['note']) !== '')
                            ->map(fn (array $detail): array => [
                                'date' => (string) ($cell['date'] ?? ''),
                                'item_name' => (string) ($row['name'] ?? '-'),
                                'operator' => $detail['operator'] ?? null,
                                'note' => trim((string) $detail['note']),
                            ])
                            ->all();
                    })
                    ->all();
            })
            ->sortBy([
                ['date', 'asc'],
                ['item_name', 'asc'],
                ['operator', 'asc'],
            ])
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, IpalDailyLog>  $logs
     * @return array<string, mixed>
     */
    private function mapMonthlyListingRow(
        int $year,
        int $month,
        Collection $logs,
        ?IpalChecklistApproval $approval,
        ?IpalProcessMonthlyApproval $processApproval,
        IpalLogService $ipalLogService,
    ): array {
        $monthLogs = $logs->filter(fn (IpalDailyLog $log): bool => (int) $log->tanggal?->month === $month);
        $period = Carbon::create($year, $month, 1);

        return [
            'month' => $month,
            'year' => $year,
            'period_label' => $period->translatedFormat('F Y'),
            'checklist_days_count' => $monthLogs
                ->filter(fn (IpalDailyLog $log): bool => $log->checklist !== null)
                ->pluck('tanggal')
                ->map(fn ($date) => $date?->format('Y-m-d'))
                ->unique()
                ->count(),
            'process_logs_count' => $monthLogs->filter(fn (IpalDailyLog $log): bool => $log->processLog !== null)->count(),
            'process_draft_count' => $monthLogs->filter(fn (IpalDailyLog $log): bool => ($log->processLog?->status ?? 'DRAFT') === 'DRAFT')->count(),
            'process_pending_count' => $monthLogs->filter(fn (IpalDailyLog $log): bool => $log->processLog?->status === 'SUBMITTED')->count(),
            'process_approved_count' => $monthLogs->filter(fn (IpalDailyLog $log): bool => $log->processLog?->status === 'APPROVED')->count(),
            'batch_mixing_days_count' => $monthLogs
                ->filter(fn (IpalDailyLog $log): bool => ($log->processLog?->batches->count() ?? 0) > 0)
                ->pluck('tanggal')
                ->map(fn ($date) => $date?->format('Y-m-d'))
                ->unique()
                ->count(),
            'checklist_approval_status' => $this->isChecklistApprovalComplete($approval) ? 'APPROVED' : 'NOT_APPROVED',
            'checklist_approved_at' => $approval?->approved_at !== null
                ? $ipalLogService->monthlyApprovalEffectiveDate($year, $month)->format('Y-m-d')
                : null,
            'checklist_approved_by' => $approval?->supervisor?->name,
            'process_approval_status' => $this->isProcessMonthlyApprovalComplete($processApproval) ? 'APPROVED' : 'NOT_APPROVED',
            'process_approved_at' => $processApproval?->approved_at !== null
                ? $ipalLogService->monthlyApprovalEffectiveDate($year, $month)->format('Y-m-d')
                : null,
            'process_approved_by' => $processApproval?->supervisor?->name,
            'can_approve_period' => $ipalLogService->isMonthlyProcessApprovalDay($year, $month),
        ];
    }

    /**
     * @param  array{search: string, status: string, year: int, per_page: int, date_from: string, date_to: string}  $filters
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

            if (
                (int) $row['checklist_days_count'] === 0
                && (int) $row['process_logs_count'] === 0
                && (int) $row['batch_mixing_days_count'] === 0
            ) {
                return false;
            }
        }

        return match ($filters['status']) {
            'DRAFT' => $row['process_draft_count'] > 0,
            'SUBMITTED' => $row['process_pending_count'] > 0,
            'APPROVED' => $row['process_approval_status'] === 'APPROVED',
            default => true,
        };
    }

    /**
     * @return array<int, array{date: string, day: int}>
     */
    private function mapPeriodDays(Carbon $period, Carbon $effectiveStart, Carbon $effectiveEnd): array
    {
        return collect(range(1, $period->daysInMonth))
            ->map(fn (int $day): Carbon => $period->copy()->day($day))
            ->filter(fn (Carbon $date): bool => $date->betweenIncluded($effectiveStart, $effectiveEnd))
            ->map(fn (Carbon $date): array => [
                'date' => $date->format('Y-m-d'),
                'day' => (int) $date->day,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array{date_from?: string, date_to?: string}  $filters
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolveEffectivePeriodRange(Carbon $period, array $filters): array
    {
        $periodStart = $period->copy()->startOfMonth();
        $periodEnd = $period->copy()->endOfMonth();
        $dateFrom = isset($filters['date_from']) && $filters['date_from'] !== ''
            ? Carbon::parse($filters['date_from'])->startOfDay()
            : null;
        $dateTo = isset($filters['date_to']) && $filters['date_to'] !== ''
            ? Carbon::parse($filters['date_to'])->endOfDay()
            : null;

        $effectiveStart = $dateFrom !== null && $dateFrom->gt($periodStart) ? $dateFrom : $periodStart;
        $effectiveEnd = $dateTo !== null && $dateTo->lt($periodEnd) ? $dateTo : $periodEnd;

        return [$effectiveStart, $effectiveEnd];
    }

    /**
     * @param  Collection<int, IpalDailyLog>  $logs
     * @return array<string, mixed>
     */
    private function mapMonthlySummary(Collection $logs, ?IpalChecklistApproval $approval): array
    {
        return [
            'checklist_days_count' => $logs
                ->filter(fn (IpalDailyLog $log): bool => $log->checklist !== null)
                ->pluck('tanggal')
                ->map(fn ($date) => $date?->format('Y-m-d'))
                ->unique()
                ->count(),
            'process_logs_count' => $logs->filter(fn (IpalDailyLog $log): bool => $log->processLog !== null)->count(),
            'batch_mixing_logs_count' => $logs->filter(fn (IpalDailyLog $log): bool => ($log->processLog?->batches->count() ?? 0) > 0)->count(),
            'checklist_approval_status' => $this->isChecklistApprovalComplete($approval) ? 'APPROVED' : 'NOT_APPROVED',
        ];
    }

    /**
     * @param  Collection<int, IpalDailyLog>  $logs
     * @return array<int, array<string, mixed>>
     */
    private function buildChecklistMatrix(Carbon $period, Collection $logs, User $viewer, Carbon $effectiveStart, Carbon $effectiveEnd): array
    {
        $template = ChecklistTemplate::query()
            ->where('is_active', true)
            ->with([
                'items' => fn ($query) => $query
                    ->where('is_active', true)
                    ->orderBy('order_no')
                    ->orderBy('id'),
            ])
            ->orderBy('id')
            ->first();

        if (! $template?->items) {
            return [];
        }

        $values = $logs->flatMap(function (IpalDailyLog $log) use ($viewer): array {
            if ($log->checklist === null) {
                return [];
            }

            return $log->checklist->values->map(function ($value) use ($log, $viewer): array {
                $attachment = $value->attachments->first();

                return [
                    'date' => $log->tanggal?->format('Y-m-d'),
                    'operator' => $log->operator?->name,
                    'item_id' => $value->item_id,
                    'status' => $value->status,
                    'status_label' => $this->resolveChecklistStatusLabel($value->status),
                    'note' => $value->note,
                    'attachment_url' => $attachment !== null ? $this->buildChecklistAttachmentUrl($attachment->id, $viewer) : null,
                    'attachment_original_name' => $attachment?->original_name,
                ];
            })->all();
        });

        $periodDays = $this->mapPeriodDays($period, $effectiveStart, $effectiveEnd);

        return $template->items->map(function ($item) use ($periodDays, $values): array {
            return [
                'item_id' => $item->id,
                'name' => $item->name,
                'standard_condition' => $item->standard_condition,
                'cells' => collect($periodDays)
                    ->map(function (array $periodDay) use ($item, $values): array {
                        $date = (string) $periodDay['date'];
                        $cellValues = $values
                            ->filter(fn (array $value): bool => $value['date'] === $date && (int) $value['item_id'] === (int) $item->id)
                            ->values();
                        $status = $this->resolveWorstChecklistStatus($cellValues->pluck('status')->filter()->all());

                        return [
                            'date' => $date,
                            'day' => (int) $periodDay['day'],
                            'status' => $status,
                            'status_label' => $this->resolveChecklistStatusLabel($status),
                            'operators' => $cellValues->pluck('operator')->filter()->unique()->values()->all(),
                            'notes' => $cellValues
                                ->filter(fn (array $value): bool => is_string($value['note']) && trim($value['note']) !== '')
                                ->map(fn (array $value): string => trim(($value['operator'] ? $value['operator'].': ' : '').$value['note']))
                                ->values()
                                ->all(),
                            'details' => $cellValues
                                ->map(fn (array $value): array => [
                                    'operator' => $value['operator'],
                                    'status' => $value['status'],
                                    'status_label' => $value['status_label'],
                                    'note' => $value['note'],
                                    'attachment_url' => $value['attachment_url'],
                                    'attachment_original_name' => $value['attachment_original_name'],
                                ])
                                ->values()
                                ->all(),
                        ];
                    })
                    ->all(),
            ];
        })->all();
    }

    /**
     * @param  Collection<int, IpalDailyLog>  $logs
     * @return array<int, array<string, mixed>>
     */
    private function mapMonthlyProcessRows(Collection $logs): array
    {
        return $logs->map(fn (IpalDailyLog $log): array => [
            'id' => $log->id,
            'tanggal' => $log->tanggal?->format('Y-m-d'),
            'operator' => [
                'name' => $log->operator?->name,
                'external_id' => $log->operator?->external_id,
                'department_name' => $log->operator?->department?->name,
            ],
            'status' => $log->processLog?->status ?? 'DRAFT',
            'submitted_at' => $log->processLog?->submitted_at?->format('Y-m-d H:i:s'),
            'checked_by' => $log->processLog?->approval?->supervisor?->name,
            'checked_at' => $log->processLog?->approval?->supervisor_signed_at?->format('Y-m-d H:i:s'),
            'has_batch_mixing' => ($log->processLog?->batches->count() ?? 0) > 0,
            'batch_count' => $log->processLog?->batches->count() ?? 0,
        ])->all();
    }

    /**
     * @param  Collection<int, IpalDailyLog>  $logs
     * @return array<int, array<string, mixed>>
     */
    private function mapMonthlyBatchRows(Collection $logs): array
    {
        return $logs
            ->filter(fn (IpalDailyLog $log): bool => ($log->processLog?->batches->count() ?? 0) > 0)
            ->map(fn (IpalDailyLog $log): array => [
                'tanggal' => $log->tanggal?->format('Y-m-d'),
                'operator' => [
                    'name' => $log->operator?->name,
                    'external_id' => $log->operator?->external_id,
                    'department_name' => $log->operator?->department?->name,
                ],
                'batches' => $log->processLog?->batches
                    ->sortBy('batch_no')
                    ->map(fn ($batch): array => [
                        'batch_no' => $batch->batch_no,
                        'sections' => $batch->values
                            ->filter(fn ($value): bool => $value->item !== null)
                            ->sortBy(fn ($value): string => sprintf(
                                '%04d-%04d-%08d',
                                $value->item?->section?->order_no ?? 999,
                                $value->item?->order_no ?? 999,
                                $value->item?->id ?? 0,
                            ))
                            ->groupBy(fn ($value): string => (string) ($value->item?->section_id ?? 0))
                            ->map(fn (Collection $values): array => [
                                'name' => $values->first()?->item?->section?->name ?? 'Batch',
                                'values' => $values->map(fn ($value): array => [
                                    'name' => $value->item?->name,
                                    'input_type' => $value->item?->input_type,
                                    'unit' => $this->batchItemUnit($value->item?->name),
                                    'value_text' => $value->value_text,
                                    'value_number' => $value->value_number,
                                ])->values()->all(),
                            ])
                            ->values()
                            ->all(),
                    ])
                    ->values()
                    ->all() ?? [],
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function mapChecklistApproval(?IpalChecklistApproval $approval, IpalLogService $ipalLogService, int $year, int $month): array
    {
        return [
            'status' => $this->isChecklistApprovalComplete($approval) ? 'APPROVED' : 'NOT_APPROVED',
            'approved_at' => $approval?->approved_at !== null
                ? $ipalLogService->monthlyApprovalEffectiveDate($year, $month)->format('Y-m-d')
                : null,
            'approved_by' => [
                'id' => $approval?->supervisor_id,
                'name' => $approval?->supervisor?->name,
                'external_id' => $approval?->supervisor?->external_id,
                'role_label' => 'HSE Dept Head',
            ],
        ];
    }

    /**
     * @param  Collection<int, mixed>  $items
     * @param  Collection<int|string, mixed>  $valueMap
     * @return array<int, array<string, mixed>>
     */
    private function mapChecklistItems(Collection $items, Collection $valueMap, User $viewer): array
    {
        return $items->map(function ($item) use ($valueMap, $viewer): array {
            $value = $valueMap->get($item->id);
            $attachment = $value?->attachments?->first();

            return [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'standard_condition' => $item->standard_condition,
                'status' => $value?->status,
                'status_label' => $this->resolveChecklistStatusLabel($value?->status),
                'note' => $value?->note,
                'attachment_path' => $attachment?->file_path,
                'attachment_url' => $attachment !== null ? $this->buildChecklistAttachmentUrl($attachment->id, $viewer) : null,
                'attachment_original_name' => $attachment?->original_name,
            ];
        })->all();
    }

    /**
     * @param  Collection<int, mixed>  $sections
     * @param  Collection<int|string, mixed>  $valueMap
     * @return array<int, array<string, mixed>>
     */
    private function mapProcessSections(Collection $sections, Collection $valueMap, User $viewer): array
    {
        return $sections->map(fn ($section): array => [
            'id' => $section->id,
            'name' => $section->name,
            'items' => $section->items->map(function ($item) use ($valueMap, $viewer): array {
                $value = $valueMap->get($item->id);
                $attachment = $value?->attachments?->first();

                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'standard_condition' => $item->standard_condition,
                    'input_type' => $item->input_type,
                    'value_text' => $value?->value_text,
                    'value_number' => $value?->value_number,
                    'note' => $value?->note,
                    'attachment_path' => $attachment?->file_path,
                    'attachment_url' => $attachment !== null ? $this->buildProcessAttachmentUrl($attachment->id, $viewer) : null,
                    'attachment_original_name' => $attachment?->original_name,
                ];
            })->all(),
        ])->all();
    }

    private function buildChecklistAttachmentUrl(int $attachmentId, User $viewer): string
    {
        return URL::route('dashboard.forms.catatan-pengolahan-limbah-air.attachments.checklist', [
            'attachment' => $attachmentId,
            'user_id' => $viewer->external_id,
        ]);
    }

    private function buildProcessAttachmentUrl(int $attachmentId, User $viewer): string
    {
        return URL::route('dashboard.forms.catatan-pengolahan-limbah-air.attachments.process', [
            'attachment' => $attachmentId,
            'user_id' => $viewer->external_id,
        ]);
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
                        'unit' => $this->batchItemUnit($item->name),
                        'value_text' => $value?->value_text,
                        'value_number' => $value?->value_number,
                    ];
                })->all(),
            ];
        })->all();
    }

    private function batchItemUnit(?string $name): ?string
    {
        return trim(mb_strtolower((string) $name)) === 'jumlah chemical' ? 'Liter' : null;
    }

    /**
     * @param  array<int, string>  $statuses
     */
    private function resolveWorstChecklistStatus(array $statuses): ?string
    {
        if (in_array('NOT_OK', $statuses, true)) {
            return 'NOT_OK';
        }

        if (in_array('OK', $statuses, true)) {
            return 'OK';
        }

        if (in_array('NA', $statuses, true)) {
            return 'NA';
        }

        return null;
    }

    private function resolveChecklistStatusLabel(?string $status): ?string
    {
        return match ($status) {
            'OK' => 'Berfungsi',
            'NOT_OK' => 'Tidak Berfungsi',
            'NA' => 'Tidak Berlaku',
            default => $status,
        };
    }

    private function isChecklistApprovalComplete(?IpalChecklistApproval $approval): bool
    {
        return $approval instanceof IpalChecklistApproval && $approval->approved_at !== null;
    }

    private function isProcessMonthlyApprovalComplete(?IpalProcessMonthlyApproval $approval): bool
    {
        return $approval instanceof IpalProcessMonthlyApproval && $approval->approved_at !== null;
    }

    private function isChecklistPeriodApproved(string $date): bool
    {
        $period = Carbon::parse($date);

        return IpalChecklistApproval::query()
            ->where('month', $period->month)
            ->where('year', $period->year)
            ->whereNotNull('approved_at')
            ->exists();
    }

    private function resolveActionLabel(?string $status, bool $filledToday): string
    {
        if (! $filledToday) {
            return 'Isi Harian';
        }

        return 'Lihat Isian Hari Ini';
    }

    private function resolveEntryMode(?string $status, bool $filledToday, bool $forceReadOnly, bool $isApprovedBySupervisor = false): string
    {
        if ($forceReadOnly) {
            return 'lihat';
        }

        if (! $filledToday) {
            return 'baru';
        }

        if ($status === 'APPROVED') {
            return 'lihat';
        }

        if ($status === 'SUBMITTED') {
            return 'lihat';
        }

        return 'draft';
    }
}
