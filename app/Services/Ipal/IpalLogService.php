<?php

namespace App\Services\Ipal;

use App\Models\Ipal\IpalBatch;
use App\Models\Ipal\IpalDailyLog;
use App\Models\Ipal\IpalProcessApproval;
use App\Models\Ipal\IpalProcessLog;
use App\Models\Master\BatchItem;
use App\Models\Master\ChecklistItem;
use App\Models\Master\ProcessItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class IpalLogService
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function createLog(array $payload, User $operator): IpalDailyLog
    {
        return DB::transaction(function () use ($payload, $operator): IpalDailyLog {
            $dailyLog = IpalDailyLog::query()->create([
                'tanggal' => $payload['tanggal'],
                'operator_id' => $operator->id,
            ]);

            $checklistPayload = $payload['checklist'];
            $checklist = $dailyLog->checklist()->create([
                'template_id' => $checklistPayload['template_id'],
            ]);

            $checklistItems = ChecklistItem::query()
                ->where('template_id', $checklistPayload['template_id'])
                ->pluck('id')
                ->all();

            foreach ($checklistPayload['values'] as $value) {
                if (! in_array($value['item_id'], $checklistItems, true)) {
                    throw ValidationException::withMessages([
                        'checklist.values' => ['Checklist item tidak sesuai template checklist.'],
                    ]);
                }

                $checklist->values()->create([
                    'item_id' => $value['item_id'],
                    'status' => $value['status'],
                    'note' => $value['note'] ?? null,
                ]);
            }

            $processPayload = $payload['process'];
            $processLog = $dailyLog->processLog()->create([
                'template_id' => $processPayload['template_id'],
                'status' => 'DRAFT',
            ]);

            $processItems = ProcessItem::query()
                ->select(['m_process_items.id', 'm_process_items.input_type'])
                ->join('m_process_sections', 'm_process_sections.id', '=', 'm_process_items.section_id')
                ->where('m_process_sections.template_id', $processPayload['template_id'])
                ->get()
                ->keyBy('id');

            foreach ($processPayload['values'] as $value) {
                $item = $processItems->get($value['item_id']);

                if ($item === null) {
                    throw ValidationException::withMessages([
                        'process.values' => ['Process item tidak sesuai template proses.'],
                    ]);
                }

                $this->validateAndCreateProcessValue($processLog, $item->input_type, $value);
            }

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

            $approval = IpalProcessApproval::query()->create([
                'process_log_id' => $processLog->id,
                'operator_id' => $operator->id,
            ]);

            if (($payload['action'] ?? 'DRAFT') === 'SUBMIT') {
                $now = now();
                $processLog->update([
                    'status' => 'SUBMITTED',
                    'submitted_at' => $now,
                ]);
                $approval->update([
                    'operator_signed_at' => $now,
                ]);
            }

            return $dailyLog->fresh();
        });
    }

    public function submit(IpalDailyLog $dailyLog, User $operator): IpalProcessLog
    {
        return DB::transaction(function () use ($dailyLog, $operator): IpalProcessLog {
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
    private function validateAndCreateProcessValue(IpalProcessLog $processLog, string $inputType, array $payload): void
    {
        $numberValue = $payload['value_number'] ?? null;
        $textValue = $payload['value_text'] ?? null;

        if ($inputType === 'number') {
            if ($numberValue === null) {
                throw ValidationException::withMessages([
                    'process.values' => ['Process item tipe number wajib mengisi value_number.'],
                ]);
            }

            $processLog->values()->create([
                'item_id' => $payload['item_id'],
                'value_number' => $numberValue,
                'value_text' => null,
                'note' => $payload['note'] ?? null,
            ]);

            return;
        }

        if (! is_string($textValue) || trim($textValue) === '') {
            throw ValidationException::withMessages([
                'process.values' => ['Process item non-number wajib mengisi value_text.'],
            ]);
        }

        $processLog->values()->create([
            'item_id' => $payload['item_id'],
            'value_text' => $textValue,
            'value_number' => null,
            'note' => $payload['note'] ?? null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function validateAndCreateBatchValue(IpalBatch $batch, string $inputType, array $payload): void
    {
        $numberValue = $payload['value_number'] ?? null;
        $textValue = $payload['value_text'] ?? null;

        if ($inputType === 'number') {
            if ($numberValue === null) {
                throw ValidationException::withMessages([
                    'batch.values' => ['Batch item tipe number wajib mengisi value_number.'],
                ]);
            }

            $batch->values()->create([
                'item_id' => $payload['item_id'],
                'value_number' => $numberValue,
                'value_text' => null,
            ]);

            return;
        }

        if (! is_string($textValue) || trim($textValue) === '') {
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
}
