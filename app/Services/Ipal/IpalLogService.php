<?php

namespace App\Services\Ipal;

use App\Models\Ipal\IpalBatch;
use App\Models\Ipal\IpalChecklistApproval;
use App\Models\Ipal\IpalChecklistValue;
use App\Models\Ipal\IpalChecklistValueAttachment;
use App\Models\Ipal\IpalDailyLog;
use App\Models\Ipal\IpalProcessApproval;
use App\Models\Ipal\IpalProcessLog;
use App\Models\Ipal\IpalProcessMonthlyApproval;
use App\Models\Ipal\IpalProcessValue;
use App\Models\Ipal\IpalProcessValueAttachment;
use App\Models\Master\BatchItem;
use App\Models\Master\ChecklistItem;
use App\Models\Master\Holiday;
use App\Models\Master\OperationalWeekday;
use App\Models\Master\ProcessItem;
use App\Models\Master\ProcessTemplate;
use App\Models\User;
use App\Support\Ipal\InputType;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class IpalLogService
{
    public function __construct(
        private readonly OperationalCalendarService $operationalCalendarService,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createLog(array $payload, User $operator): IpalDailyLog
    {
        return DB::transaction(function () use ($payload, $operator): IpalDailyLog {
            $logDate = Carbon::parse($payload['tanggal']);
            $dayContext = $this->operationalCalendarService->resolveContext($logDate);
            $isOperational = $dayContext['is_operational'];

            if (! $isOperational && ($payload['action'] ?? 'DRAFT') === 'SUBMIT') {
                throw ValidationException::withMessages([
                    'action' => ['Hari non-operasional tidak dapat di-submit harian.'],
                ]);
            }

            $dailyLog = IpalDailyLog::query()->create([
                'tanggal' => $payload['tanggal'],
                'operator_id' => $operator->id,
                'day_type' => $dayContext['day_type'],
                'is_operational' => $isOperational,
            ]);

            $checklistPayload = $payload['checklist'];
            $checklistTemplateId = (int) $checklistPayload['template_id'];
            $checklist = $dailyLog->checklist()->create([
                'template_id' => $checklistTemplateId,
            ]);

            $checklistItems = ChecklistItem::query()
                ->where('template_id', $checklistTemplateId)
                ->get(['id', 'name']);

            if ($checklistItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'checklist.template_id' => ['Template checklist belum memiliki item.'],
                ]);
            }

            if (! $isOperational) {
                foreach ($checklistItems as $item) {
                    $checklist->values()->create([
                        'item_id' => $item->id,
                        'status' => 'NA',
                        'note' => $dayContext['label'],
                    ]);
                }
            } else {
                if (! isset($checklistPayload['values']) || ! is_array($checklistPayload['values']) || $checklistPayload['values'] === []) {
                    throw ValidationException::withMessages([
                        'checklist.values' => ['Checklist values wajib diisi untuk hari operasional.'],
                    ]);
                }

                $checklistItemIds = $checklistItems->pluck('id')
                    ->map(static fn ($id): int => (int) $id)
                    ->all();

                foreach ($checklistPayload['values'] as $value) {
                    $itemId = (int) $value['item_id'];

                    if (! in_array($itemId, $checklistItemIds, true)) {
                        throw ValidationException::withMessages([
                            'checklist.values' => ['Checklist item tidak sesuai template checklist.'],
                        ]);
                    }

                    $createdValue = $checklist->values()->create([
                        'item_id' => $itemId,
                        'status' => $value['status'],
                        'note' => $value['note'] ?? null,
                    ]);

                    $attachment = $value['attachment'] ?? null;
                    if ($attachment instanceof UploadedFile) {
                        $this->storeChecklistValueAttachment($createdValue, $attachment, $logDate);
                    }
                }
            }

            $processTemplateId = $this->resolveProcessTemplateId($payload, $isOperational);
            $processLog = $dailyLog->processLog()->create([
                'template_id' => $processTemplateId,
                'status' => 'DRAFT',
            ]);

            if ($isOperational) {
                if (! isset($payload['process']) || ! is_array($payload['process'])) {
                    throw ValidationException::withMessages([
                        'process' => ['Data proses wajib diisi untuk hari operasional.'],
                    ]);
                }

                $processPayload = $payload['process'];
                if (! isset($processPayload['values']) || ! is_array($processPayload['values']) || $processPayload['values'] === []) {
                    throw ValidationException::withMessages([
                        'process.values' => ['Nilai proses wajib diisi untuk hari operasional.'],
                    ]);
                }

                $this->replaceProcessValues($processLog, $processPayload['values'], true, $payload['tanggal']);

                $batchItems = BatchItem::query()->select(['id', 'input_type'])->get()->keyBy('id');

                foreach (($payload['batch'] ?? []) as $batchPayload) {
                    $batch = $processLog->batches()->create([
                        'batch_no' => $batchPayload['batch_no'],
                    ]);

                    foreach ($batchPayload['values'] as $value) {
                        $item = $batchItems->get($value['item_id']);

                        if ($item === null) {
                            throw ValidationException::withMessages([
                                'batch.values' => ['Batch item tidak ditemukan.'],
                            ]);
                        }

                        $this->validateAndCreateBatchValue($batch, $item->input_type, $value);
                    }
                }
            }

            $approval = IpalProcessApproval::query()->create([
                'process_log_id' => $processLog->id,
                'operator_id' => $operator->id,
            ]);

            $this->applySubmitAction($payload, $processLog, $approval);

            return $dailyLog->fresh();
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function upsertChecklist(array $payload, User $operator): IpalDailyLog
    {
        return DB::transaction(function () use ($payload, $operator): IpalDailyLog {
            $logDate = Carbon::parse($payload['tanggal']);
            $dayContext = $this->operationalCalendarService->resolveContext($logDate);
            $dailyLog = $this->firstOrCreateDailyLog($operator, $payload['tanggal'], $dayContext);

            if ($this->isChecklistPeriodApproved($logDate)) {
                throw ValidationException::withMessages([
                    'tanggal' => ['Checklist periode ini sudah di-approve HSE Dept Head dan tidak dapat diubah.'],
                ]);
            }

            $processLog = $dailyLog->processLog()->first();
            if ($processLog !== null && in_array($processLog->status, ['SUBMITTED', 'APPROVED'], true)) {
                throw ValidationException::withMessages([
                    'tanggal' => ['Checklist tidak dapat diubah karena catatan proses sudah di-submit/approve.'],
                ]);
            }

            $checklistPayload = $payload['checklist'];
            $checklistTemplateId = (int) $checklistPayload['template_id'];
            $checklist = $dailyLog->checklist()->first();

            if ($checklist === null) {
                $checklist = $dailyLog->checklist()->create([
                    'template_id' => $checklistTemplateId,
                ]);
            } else {
                $checklist->update([
                    'template_id' => $checklistTemplateId,
                ]);
            }

            $checklistItems = ChecklistItem::query()
                ->where('template_id', $checklistTemplateId)
                ->where('is_active', true)
                ->get(['id']);

            if ($checklistItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'checklist.template_id' => ['Template checklist belum memiliki item aktif.'],
                ]);
            }

            $checklistItemIds = $checklistItems->pluck('id')
                ->map(static fn ($id): int => (int) $id)
                ->all();
            $submittedValues = $checklistPayload['values'] ?? [];
            $valuesToCreate = [];

            foreach ($submittedValues as $value) {
                $itemId = (int) $value['item_id'];

                if (! in_array($itemId, $checklistItemIds, true)) {
                    throw ValidationException::withMessages([
                        'checklist.values' => ['Checklist item tidak sesuai template checklist.'],
                    ]);
                }

                $valuesToCreate[] = [
                    'item_id' => $itemId,
                    'status' => $value['status'],
                    'note' => $value['note'] ?? null,
                ];
            }

            $createdValues = collect();
            foreach ($valuesToCreate as $valueData) {
                $createdValues->push($checklist->values()->updateOrCreate(
                    ['item_id' => $valueData['item_id']],
                    ['status' => $valueData['status'], 'note' => $valueData['note']]
                ));
            }

            // Handle per-value attachment uploads
            foreach ($submittedValues as $index => $value) {
                $attachment = $value['attachment'] ?? null;
                if ($attachment instanceof UploadedFile) {
                    $createdValue = $createdValues->get($index);
                    if ($createdValue !== null) {
                        $logDate = Carbon::parse($payload['tanggal']);
                        $this->storeChecklistValueAttachment($createdValue, $attachment, $logDate);
                    }
                }
            }

            if ($processLog === null) {
                $processLog = $this->createDraftProcessLog($dailyLog, null);
            }

            $this->ensureProcessApproval($processLog, $operator);

            return $dailyLog->fresh();
        });
    }

    public function approveMonthlyChecklist(int $month, int $year, User $supervisor): IpalChecklistApproval
    {
        if (! $this->isMonthlyProcessApprovalDay($year, $month)) {
            throw ValidationException::withMessages([
                'period' => ['Approval bulanan checklist hanya dapat dilakukan mulai hari kerja terakhir periode.'],
            ]);
        }

        if ($this->isChecklistPeriodApproved(Carbon::create($year, $month, 1))) {
            throw ValidationException::withMessages([
                'period' => ['Checklist bulanan periode ini sudah di-approve.'],
            ]);
        }

        $approval = IpalChecklistApproval::query()->updateOrCreate(
            [
                'month' => $month,
                'year' => $year,
            ],
            [
                'supervisor_id' => $supervisor->id,
                'approved_at' => now(),
            ],
        );

        return $approval->fresh(['supervisor']) ?? $approval->load('supervisor');
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function upsertProcess(array $payload, User $operator): IpalDailyLog
    {
        return DB::transaction(function () use ($payload, $operator): IpalDailyLog {
            $logDate = Carbon::parse($payload['tanggal']);
            $dayContext = $this->operationalCalendarService->resolveContext($logDate);
            $dailyLog = $this->firstOrCreateDailyLog($operator, $payload['tanggal'], $dayContext);

            $processLog = $dailyLog->processLog()->first();
            if ($processLog !== null && in_array($processLog->status, ['SUBMITTED', 'APPROVED'], true)) {
                throw ValidationException::withMessages([
                    'tanggal' => ['Catatan proses tidak dapat diubah karena sudah di-submit/approve.'],
                ]);
            }

            $processPayload = $payload['process'];
            $processTemplateId = $this->resolveProcessTemplateIdFromPayload($processPayload, $dailyLog->is_operational);

            if ($processLog === null) {
                $processLog = $this->createDraftProcessLog($dailyLog, $processTemplateId);
            } elseif ((int) $processLog->template_id !== $processTemplateId) {
                $processLog->update([
                    'template_id' => $processTemplateId,
                    'status' => 'DRAFT',
                    'submitted_at' => null,
                ]);
                $processLog->values()->delete();
                $processLog->batches()->each(function (IpalBatch $batch): void {
                    $batch->values()->delete();
                    $batch->delete();
                });
            }

            $this->replaceProcessValues($processLog, $processPayload['values'] ?? [], false, $payload['tanggal'] ?? null);

            $hasMixing = (bool) ($payload['has_mixing'] ?? false);
            $this->replaceBatchValues($processLog, $hasMixing ? ($payload['batch'] ?? []) : [], false);

            $approval = $this->ensureProcessApproval($processLog, $operator);
            $action = $payload['action'] ?? 'DRAFT';

            if ($action === 'SUBMIT') {
                if (! $dailyLog->is_operational) {
                    throw ValidationException::withMessages([
                        'action' => ['Hari non-operasional tidak dapat di-submit harian.'],
                    ]);
                }

                $this->assertProcessValuesComplete($processLog);
                if ($hasMixing) {
                    $this->assertBatchValuesComplete($processLog);
                }

                $now = now();
                $processLog->update([
                    'status' => 'SUBMITTED',
                    'submitted_at' => $now,
                ]);

                $approval->update([
                    'operator_signed_at' => $now,
                ]);
            } else {
                $processLog->update([
                    'status' => 'DRAFT',
                    'submitted_at' => null,
                ]);
            }

            $this->ensureChecklistExists($dailyLog);

            return $dailyLog->fresh();
        });
    }

    public function submit(IpalDailyLog $dailyLog, User $operator): IpalProcessLog
    {
        return DB::transaction(function () use ($dailyLog, $operator): IpalProcessLog {
            if (! $dailyLog->is_operational) {
                throw ValidationException::withMessages([
                    'status' => ['Hari non-operasional tidak memiliki submit harian.'],
                ]);
            }

            $processLog = $dailyLog->processLog()->with('approval')->firstOrFail();

            if ($processLog->status === 'APPROVED') {
                throw ValidationException::withMessages([
                    'status' => ['Data sudah berstatus APPROVED.'],
                ]);
            }

            $now = now();

            $processLog->update([
                'status' => 'SUBMITTED',
                'submitted_at' => $now,
            ]);

            $processLog->approval()->updateOrCreate(
                ['process_log_id' => $processLog->id],
                [
                    'operator_id' => $operator->id,
                    'operator_signed_at' => $now,
                ],
            );

            return $processLog->fresh();
        });
    }

    public function approve(IpalDailyLog $dailyLog, User $supervisor): IpalProcessLog
    {
        return DB::transaction(function () use ($dailyLog, $supervisor): IpalProcessLog {
            $processLog = $dailyLog->processLog()->with('approval')->firstOrFail();

            if ($processLog->status !== 'SUBMITTED') {
                throw ValidationException::withMessages([
                    'status' => ['Hanya status SUBMITTED yang dapat di-approve.'],
                ]);
            }

            $processLog->approval()->updateOrCreate(
                ['process_log_id' => $processLog->id],
                [
                    'operator_id' => $processLog->approval?->operator_id ?? $dailyLog->operator_id,
                    'supervisor_id' => $supervisor->id,
                    'supervisor_signed_at' => now(),
                ],
            );

            $processLog->update([
                'status' => 'APPROVED',
            ]);

            return $processLog->fresh();
        });
    }

    /**
     * Re-open a daily log that was already approved by supervisor.
     * Resets process log status to DRAFT and clears supervisor signature.
     * Intended for Superadmin use only.
     */
    public function reopen(IpalDailyLog $dailyLog): IpalProcessLog
    {
        return DB::transaction(function () use ($dailyLog): IpalProcessLog {
            $processLog = $dailyLog->processLog()->with('approval')->firstOrFail();

            if (! in_array($processLog->status, ['APPROVED', 'SUBMITTED'], strict: true)) {
                throw ValidationException::withMessages([
                    'status' => ['Hanya log dengan status APPROVED atau SUBMITTED yang bisa di-reopen.'],
                ]);
            }

            if ($processLog->approval !== null) {
                $processLog->approval()->update([
                    'supervisor_id' => null,
                    'supervisor_signed_at' => null,
                ]);
            }

            $processLog->update([
                'status' => 'DRAFT',
            ]);

            return $processLog->fresh();
        });
    }

    /**
     * Approve all SUBMITTED ipal_process_logs for the given month/year to APPROVED.
     * Only logs still in SUBMITTED status are affected.
     */
    public function approveMonthlyProcess(int $month, int $year, User $supervisor): int
    {
        if (! $this->isMonthlyProcessApprovalDay($year, $month)) {
            throw ValidationException::withMessages([
                'period' => ['Approval bulanan catatan proses hanya dapat dilakukan mulai hari kerja terakhir periode.'],
            ]);
        }

        return DB::transaction(function () use ($month, $year, $supervisor): int {
            $monthlyApproval = IpalProcessMonthlyApproval::query()
                ->where('month', $month)
                ->where('year', $year)
                ->whereNotNull('approved_at')
                ->first();

            if ($monthlyApproval !== null) {
                throw ValidationException::withMessages([
                    'period' => ['Catatan proses bulanan periode ini sudah di-approve.'],
                ]);
            }

            $logs = IpalDailyLog::query()
                ->with(['processLog.approval'])
                ->whereYear('tanggal', $year)
                ->whereMonth('tanggal', $month)
                ->get();

            $processLogs = $logs
                ->map(fn (IpalDailyLog $dailyLog): ?IpalProcessLog => $dailyLog->processLog)
                ->filter();

            if ($processLogs->isEmpty()) {
                throw ValidationException::withMessages([
                    'period' => ['Tidak ada catatan proses pada periode ini untuk di-approve.'],
                ]);
            }

            if ($processLogs->contains(fn (IpalProcessLog $processLog): bool => $processLog->status === 'DRAFT')) {
                throw ValidationException::withMessages([
                    'period' => ['Masih ada catatan proses draft pada periode ini.'],
                ]);
            }

            $count = 0;
            $now = now();

            foreach ($logs as $dailyLog) {
                $processLog = $dailyLog->processLog;

                if ($processLog === null || $processLog->status !== 'SUBMITTED') {
                    continue;
                }

                $processLog->approval()->updateOrCreate(
                    ['process_log_id' => $processLog->id],
                    [
                        'operator_id' => $processLog->approval?->operator_id ?? $dailyLog->operator_id,
                        'supervisor_id' => $supervisor->id,
                        'supervisor_signed_at' => $now,
                    ],
                );

                $processLog->update(['status' => 'APPROVED']);
                $count++;
            }

            IpalProcessMonthlyApproval::query()->updateOrCreate(
                [
                    'month' => $month,
                    'year' => $year,
                ],
                [
                    'supervisor_id' => $supervisor->id,
                    'approved_at' => $now,
                ],
            );

            return $count;
        });
    }

    /**
     * Re-open all APPROVED IPAL process logs for the given month/year.
     * Clears supervisor signatures so Dept Head approval can be run again.
     */
    public function reopenMonthlyProcess(int $month, int $year): int
    {
        return DB::transaction(function () use ($month, $year): int {
            $monthlyApproval = IpalProcessMonthlyApproval::query()
                ->where('month', $month)
                ->where('year', $year)
                ->whereNotNull('approved_at')
                ->first();

            if ($monthlyApproval === null) {
                throw ValidationException::withMessages([
                    'period' => ['Approval bulanan catatan proses periode ini belum ada untuk dibuka kembali.'],
                ]);
            }

            $logs = IpalDailyLog::query()
                ->with(['processLog.approval'])
                ->whereYear('tanggal', $year)
                ->whereMonth('tanggal', $month)
                ->get();

            $count = 0;

            foreach ($logs as $dailyLog) {
                $processLog = $dailyLog->processLog;

                if ($processLog === null || $processLog->status !== 'APPROVED') {
                    continue;
                }

                if ($processLog->approval !== null) {
                    $processLog->approval()->update([
                        'supervisor_id' => null,
                        'supervisor_signed_at' => null,
                    ]);
                }

                $processLog->update(['status' => 'SUBMITTED']);
                $count++;
            }

            if ($count === 0) {
                throw ValidationException::withMessages([
                    'period' => ['Tidak ada catatan proses approved pada periode ini untuk dibuka kembali.'],
                ]);
            }

            $monthlyApproval->delete();

            return $count;
        });
    }

    public function isMonthlyProcessApprovalDay(int $year, int $month): bool
    {
        $today = now()->startOfDay();
        $periodStart = Carbon::create($year, $month, 1)->startOfDay();

        if ($today->lt($periodStart)) {
            return false;
        }

        return $today->greaterThanOrEqualTo($this->monthlyApprovalEffectiveDate($year, $month));
    }

    public function monthlyApprovalEffectiveDate(int $year, int $month): Carbon
    {
        $lastOperationalDay = $this->findLastOperationalDayOfMonth($year, $month);

        return ($lastOperationalDay ?? Carbon::create($year, $month, 1)->endOfMonth())->startOfDay();
    }

    /**
     * Returns true when the given month/year is "completable":
     * - today is strictly past the last calendar day of the month, OR
     * - today is the last operational (non-weekend, non-holiday) weekday of the month.
     */
    public function isMonthCompletable(int $year, int $month): bool
    {
        $today = now()->startOfDay();
        $periodEnd = Carbon::create($year, $month, 1)->endOfMonth()->startOfDay();

        // Month is completely in the past
        if ($today->gt($periodEnd)) {
            return true;
        }

        // Today must be inside the period
        $periodStart = Carbon::create($year, $month, 1)->startOfDay();
        if ($today->lt($periodStart)) {
            return false;
        }

        // Find last operational day of the month
        $lastOperationalDay = $this->findLastOperationalDayOfMonth($year, $month);

        if ($lastOperationalDay === null) {
            return false;
        }

        return $today->greaterThanOrEqualTo($lastOperationalDay);
    }

    private function findLastOperationalDayOfMonth(int $year, int $month): ?Carbon
    {
        $offDayOfWeekIsos = OperationalWeekday::query()
            ->where('is_off', true)
            ->pluck('day_of_week_iso')
            ->all();

        $holidayDates = Holiday::query()
            ->whereYear('holiday_date', $year)
            ->whereMonth('holiday_date', $month)
            ->where('is_active', true)
            ->pluck('holiday_date')
            ->map(fn ($date) => Carbon::parse($date)->toDateString())
            ->all();

        $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;

        for ($day = $daysInMonth; $day >= 1; $day--) {
            $date = Carbon::create($year, $month, $day);

            if (in_array($date->dayOfWeekIso, $offDayOfWeekIsos, true)) {
                continue;
            }

            if (in_array($date->toDateString(), $holidayDates, true)) {
                continue;
            }

            return $date->startOfDay();
        }

        return null;
    }

    public function detail(IpalDailyLog $dailyLog): IpalDailyLog
    {
        return $dailyLog->load([
            'operator:id,external_id,name,is_active,created_at',
            'checklist.template',
            'checklist.values.item',
            'processLog.template',
            'processLog.values.item',
            'processLog.batches.values.item',
            'processLog.approval.operator:id,external_id,name',
            'processLog.approval.supervisor:id,external_id,name',
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function validateAndCreateProcessValue(
        IpalProcessLog $processLog,
        string $inputType,
        array $payload,
        bool $strict = true,
    ): ?IpalProcessValue {
        $numberValue = $payload['value_number'] ?? null;
        $textValue = $payload['value_text'] ?? null;

        if (InputType::storesNumber($inputType)) {
            if ($numberValue === null) {
                if (! $strict) {
                    return null;
                }

                throw ValidationException::withMessages([
                    'process.values' => ['Process item tipe angka wajib mengisi value_number.'],
                ]);
            }

            $this->assertValidNumberForInputType($inputType, $numberValue, 'process.values');

            return $processLog->values()->updateOrCreate(
                ['item_id' => $payload['item_id']],
                [
                    'value_number' => $numberValue,
                    'value_text' => null,
                    'note' => $payload['note'] ?? null,
                ]
            );
        }

        if (! is_string($textValue) || trim($textValue) === '') {
            if (! $strict) {
                return null;
            }

            throw ValidationException::withMessages([
                'process.values' => ['Process item non-number wajib mengisi value_text.'],
            ]);
        }

        return $processLog->values()->updateOrCreate(
            ['item_id' => $payload['item_id']],
            [
                'value_text' => $textValue,
                'value_number' => null,
                'note' => $payload['note'] ?? null,
            ]
        );
    }

    private function storeChecklistValueAttachment(
        IpalChecklistValue $checklistValue,
        UploadedFile $attachment,
        Carbon $logDate,
    ): void {
        $path = $attachment->store(
            'ipal/checklist/'.$logDate->year.'/'.$logDate->month,
            'public',
        );

        IpalChecklistValueAttachment::query()
            ->where('checklist_value_id', $checklistValue->id)
            ->delete();

        IpalChecklistValueAttachment::query()->create([
            'checklist_value_id' => $checklistValue->id,
            'file_path' => $path,
            'original_name' => $attachment->getClientOriginalName(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function validateAndCreateBatchValue(
        IpalBatch $batch,
        string $inputType,
        array $payload,
        bool $strict = true,
    ): void {
        $numberValue = $payload['value_number'] ?? null;
        $textValue = $payload['value_text'] ?? null;

        if (InputType::storesNumber($inputType)) {
            if ($numberValue === null) {
                if (! $strict) {
                    return;
                }

                throw ValidationException::withMessages([
                    'batch.values' => ['Batch item tipe angka wajib mengisi value_number.'],
                ]);
            }

            $this->assertValidNumberForInputType($inputType, $numberValue, 'batch.values');

            $batch->values()->create([
                'item_id' => $payload['item_id'],
                'value_number' => $numberValue,
                'value_text' => null,
            ]);

            return;
        }

        if (! is_string($textValue) || trim($textValue) === '') {
            if (! $strict) {
                return;
            }

            throw ValidationException::withMessages([
                'batch.values' => ['Batch item non-number wajib mengisi value_text.'],
            ]);
        }

        $batch->values()->create([
            'item_id' => $payload['item_id'],
            'value_text' => $textValue,
            'value_number' => null,
        ]);
    }

    private function assertValidNumberForInputType(string $inputType, mixed $numberValue, string $errorKey): void
    {
        if (InputType::canonical($inputType) === InputType::Decimal2 && ! $this->hasValidDecimalScale($numberValue, 2)) {
            throw ValidationException::withMessages([
                $errorKey => ['Item tipe desimal wajib diisi maksimal 2 angka di belakang koma.'],
            ]);
        }

        if (! InputType::requiresInteger($inputType)) {
            return;
        }

        if (filter_var($numberValue, FILTER_VALIDATE_INT) !== false) {
            return;
        }

        throw ValidationException::withMessages([
            $errorKey => ['Item tipe angka bulat wajib diisi tanpa desimal.'],
        ]);
    }

    private function hasValidDecimalScale(mixed $numberValue, int $scale): bool
    {
        if (! is_numeric($numberValue)) {
            return false;
        }

        $value = rtrim(rtrim((string) $numberValue, '0'), '.');
        $decimalPosition = strpos($value, '.');

        return $decimalPosition === false || strlen($value) - $decimalPosition - 1 <= $scale;
    }

    /**
     * @param  array<string, mixed>  $dayContext
     */
    private function firstOrCreateDailyLog(User $operator, string $date, array $dayContext): IpalDailyLog
    {
        $dailyLog = IpalDailyLog::query()
            ->whereDate('tanggal', $date)
            ->where('operator_id', $operator->id)
            ->first();

        if ($dailyLog instanceof IpalDailyLog) {
            return $dailyLog;
        }

        return IpalDailyLog::query()->create([
            'tanggal' => $date,
            'operator_id' => $operator->id,
            'day_type' => $dayContext['day_type'],
            'is_operational' => $dayContext['is_operational'],
        ]);
    }

    private function createDraftProcessLog(IpalDailyLog $dailyLog, ?int $templateId): IpalProcessLog
    {
        $resolvedTemplateId = $templateId;

        if (! is_int($resolvedTemplateId)) {
            $resolvedTemplateId = $this->resolveActiveProcessTemplateId();
        }

        return $dailyLog->processLog()->create([
            'template_id' => $resolvedTemplateId,
            'status' => 'DRAFT',
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $valuesPayload
     */
    private function replaceProcessValues(IpalProcessLog $processLog, array $valuesPayload, bool $strict, ?string $date = null): void
    {
        $processItems = ProcessItem::query()
            ->select(['m_process_items.id', 'm_process_items.input_type'])
            ->join('m_process_sections', 'm_process_sections.id', '=', 'm_process_items.section_id')
            ->where('m_process_sections.template_id', $processLog->template_id)
            ->get()
            ->keyBy('id');

        foreach ($valuesPayload as $value) {
            $item = $processItems->get($value['item_id'] ?? null);

            if ($item === null) {
                throw ValidationException::withMessages([
                    'process.values' => ['Process item tidak sesuai template proses.'],
                ]);
            }

            $createdValue = $this->validateAndCreateProcessValue($processLog, $item->input_type, $value, $strict);

            // Handle optional per-value attachment upload
            $attachment = $value['attachment'] ?? null;
            if ($attachment instanceof UploadedFile && $createdValue !== null) {
                $logDate = $date !== null ? Carbon::parse($date) : now();
                $path = $attachment->store(
                    'ipal/process/'.$logDate->year.'/'.$logDate->month,
                    'public',
                );
                IpalProcessValueAttachment::query()->where('process_value_id', $createdValue->id)->delete();
                IpalProcessValueAttachment::query()->create([
                    'process_value_id' => $createdValue->id,
                    'file_path' => $path,
                    'original_name' => $attachment->getClientOriginalName(),
                ]);
            }
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $batchesPayload
     */
    private function replaceBatchValues(IpalProcessLog $processLog, array $batchesPayload, bool $strict): void
    {
        $processLog->batches()->each(function (IpalBatch $batch): void {
            $batch->values()->delete();
            $batch->delete();
        });

        if ($batchesPayload === []) {
            return;
        }

        $batchItems = BatchItem::query()
            ->select(['id', 'input_type'])
            ->get()
            ->keyBy('id');

        foreach ($batchesPayload as $batchPayload) {
            $batch = $processLog->batches()->create([
                'batch_no' => $batchPayload['batch_no'],
            ]);

            foreach (($batchPayload['values'] ?? []) as $value) {
                $item = $batchItems->get($value['item_id'] ?? null);

                if ($item === null) {
                    throw ValidationException::withMessages([
                        'batch.values' => ['Batch item tidak ditemukan.'],
                    ]);
                }

                $this->validateAndCreateBatchValue($batch, $item->input_type, $value, $strict);
            }
        }
    }

    private function ensureChecklistExists(IpalDailyLog $dailyLog): void
    {
        if ($dailyLog->checklist()->exists()) {
            return;
        }

        $templateId = $this->resolveActiveChecklistTemplateId();
        $dailyLog->checklist()->create([
            'template_id' => $templateId,
        ]);
    }

    private function ensureProcessApproval(IpalProcessLog $processLog, User $operator): IpalProcessApproval
    {
        return $processLog->approval()->updateOrCreate(
            ['process_log_id' => $processLog->id],
            ['operator_id' => $operator->id],
        );
    }

    private function isChecklistPeriodApproved(Carbon $date): bool
    {
        return IpalChecklistApproval::query()
            ->where('month', $date->month)
            ->where('year', $date->year)
            ->whereNotNull('approved_at')
            ->exists();
    }

    private function resolveActiveChecklistTemplateId(): int
    {
        $templateId = ChecklistItem::query()
            ->select('m_checklist_templates.id')
            ->join('m_checklist_templates', 'm_checklist_templates.id', '=', 'm_checklist_items.template_id')
            ->where('m_checklist_templates.is_active', true)
            ->where('m_checklist_items.is_active', true)
            ->orderBy('m_checklist_templates.id')
            ->value('m_checklist_templates.id');

        if (! is_int($templateId)) {
            throw ValidationException::withMessages([
                'checklist.template_id' => ['Template checklist aktif tidak ditemukan.'],
            ]);
        }

        return $templateId;
    }

    private function resolveActiveProcessTemplateId(): int
    {
        $activeTemplate = ProcessTemplate::query()
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        if (! $activeTemplate instanceof ProcessTemplate) {
            throw ValidationException::withMessages([
                'process.template_id' => ['Template proses aktif tidak ditemukan.'],
            ]);
        }

        return $activeTemplate->id;
    }

    /**
     * @param  array<string, mixed>  $processPayload
     */
    private function resolveProcessTemplateIdFromPayload(array $processPayload, bool $isOperational): int
    {
        $templateId = $processPayload['template_id'] ?? null;

        if (is_int($templateId)) {
            return $templateId;
        }

        if (is_string($templateId) && ctype_digit($templateId)) {
            return (int) $templateId;
        }

        if ($isOperational) {
            throw ValidationException::withMessages([
                'process.template_id' => ['Template proses wajib diisi untuk hari operasional.'],
            ]);
        }

        return $this->resolveActiveProcessTemplateId();
    }

    private function assertProcessValuesComplete(IpalProcessLog $processLog): void
    {
        $processItemsCount = ProcessItem::query()
            ->join('m_process_sections', 'm_process_sections.id', '=', 'm_process_items.section_id')
            ->where('m_process_sections.template_id', $processLog->template_id)
            ->count();

        $filledCount = $processLog->values()
            ->where(function ($query): void {
                $query
                    ->whereNotNull('value_number')
                    ->orWhereRaw("TRIM(COALESCE(value_text, '')) <> ''");
            })
            ->count();

        if ($processItemsCount === 0 || $filledCount < $processItemsCount) {
            throw ValidationException::withMessages([
                'process.values' => ['Seluruh item catatan proses wajib terisi sebelum submit.'],
            ]);
        }
    }

    private function assertBatchValuesComplete(IpalProcessLog $processLog): void
    {
        $batchItemIds = BatchItem::query()
            ->orderBy('id')
            ->pluck('id')
            ->all();

        foreach ($processLog->batches as $batch) {
            $valueItemIds = $batch->values()
                ->where(function ($query): void {
                    $query
                        ->whereNotNull('value_number')
                        ->orWhereRaw("TRIM(COALESCE(value_text, '')) <> ''");
                })
                ->pluck('item_id')
                ->all();

            $missing = array_diff($batchItemIds, $valueItemIds);
            if ($missing !== []) {
                throw ValidationException::withMessages([
                    'batch' => ["Batch {$batch->batch_no} belum lengkap. Isi semua item batch atau kosongkan batch tersebut."],
                ]);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveProcessTemplateId(array $payload, bool $isOperational): int
    {
        $templateId = data_get($payload, 'process.template_id');

        if (is_int($templateId)) {
            return $templateId;
        }

        if (is_string($templateId) && ctype_digit($templateId)) {
            return (int) $templateId;
        }

        if ($isOperational) {
            throw ValidationException::withMessages([
                'process.template_id' => ['Template proses wajib diisi untuk hari operasional.'],
            ]);
        }

        return $this->resolveActiveProcessTemplateId();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function applySubmitAction(
        array $payload,
        IpalProcessLog $processLog,
        IpalProcessApproval $approval,
    ): void {
        if (($payload['action'] ?? 'DRAFT') !== 'SUBMIT') {
            return;
        }

        $now = now();
        $processLog->update([
            'status' => 'SUBMITTED',
            'submitted_at' => $now,
        ]);

        $approval->update([
            'operator_signed_at' => $now,
        ]);
    }
}
