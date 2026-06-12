<?php

namespace App\Services\B3Storage;

use App\Models\B3Storage\B3StorageLog;
use App\Models\B3Storage\B3StorageMonthlyApproval;
use App\Models\B3Storage\B3StorageWasteType;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class B3StorageService
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function createLog(array $payload, User $operator, ?UploadedFile $photo): B3StorageLog
    {
        return DB::transaction(function () use ($payload, $operator, $photo): B3StorageLog {
            $logPayload = $this->normalizeLogPayload($payload, $operator, $photo);

            $log = B3StorageLog::query()->create($logPayload);

            return $this->detail($log);
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function updateLog(
        B3StorageLog $log,
        array $payload,
        User $operator,
        ?UploadedFile $photo,
    ): B3StorageLog {
        return DB::transaction(function () use ($log, $payload, $operator, $photo): B3StorageLog {
            $logPayload = $this->normalizeLogPayload($payload, $operator, $photo, $log);

            $log->update($logPayload);

            return $this->detail($log->fresh());
        });
    }

    public function deleteLog(B3StorageLog $log): void
    {
        if (is_string($log->photo_path) && $log->photo_path !== '') {
            Storage::disk('public')->delete($log->photo_path);
        }

        $log->delete();
    }

    public function detail(B3StorageLog $log): B3StorageLog
    {
        return $log->load([
            'wasteType:id,name',
            'initiatorDepartment:id,name',
            'operator:id,external_id,name',
        ]);
    }

    public function logsIndex(?int $month, ?int $year, int $perPage = 50): LengthAwarePaginator
    {
        $query = B3StorageLog::query()
            ->with(['wasteType:id,name', 'initiatorDepartment:id,name', 'operator:id,external_id,name'])
            ->orderByDesc('movement_date')
            ->orderByDesc('id');

        if ($month !== null) {
            $query->whereMonth('movement_date', $month);
        }

        if ($year !== null) {
            $query->whereYear('movement_date', $year);
        }

        return $query->paginate($perPage);
    }

    /**
     * @return array<string, mixed>
     */
    public function monthlyReport(int $month, int $year): array
    {
        $wasteTypes = B3StorageWasteType::query()
            ->where('is_active', true)
            ->orderBy('order_no')
            ->orderBy('id')
            ->get(['id', 'name', 'order_no']);

        $wasteTypeColumns = $wasteTypes->map(static function (B3StorageWasteType $type): array {
            return [
                'id' => $type->id,
                'name' => $type->name,
                'order_no' => $type->order_no,
            ];
        })->values()->all();

        $logs = B3StorageLog::query()
            ->with(['wasteType:id,name', 'initiatorDepartment:id,name', 'operator:id,external_id,name', 'initiatorUser:id,name'])
            ->whereMonth('movement_date', $month)
            ->whereYear('movement_date', $year)
            ->orderBy('movement_date')
            ->orderBy('id')
            ->get();

        $rows = [];
        $totalsByWasteType = $wasteTypes
            ->mapWithKeys(static fn (B3StorageWasteType $type): array => [$type->id => 0.0])
            ->all();
        $totalOther = 0.0;

        foreach ($logs as $index => $log) {
            $weightsByWasteType = [];
            foreach ($wasteTypes as $type) {
                $weightsByWasteType[$type->id] = null;
            }

            $otherWeight = null;

            if (is_int($log->waste_type_id) && array_key_exists($log->waste_type_id, $weightsByWasteType)) {
                $weightsByWasteType[$log->waste_type_id] = $log->weight_kg;
                $totalsByWasteType[$log->waste_type_id] += (float) $log->weight_kg;
            } else {
                $otherWeight = $log->weight_kg;
                $totalOther += (float) $log->weight_kg;
            }

            $rows[] = [
                'no' => $index + 1,
                'id' => $log->id,
                'tanggal_masuk' => $log->movement_type === 'MASUK' ? $log->movement_date?->toDateString() : null,
                'tanggal_keluar' => $log->movement_type === 'KELUAR' ? $log->movement_date?->toDateString() : null,
                'jam' => $log->movement_time,
                'weights_by_waste_type' => $weightsByWasteType,
                'weight_other' => $otherWeight,
                'waste_type_other' => $log->waste_type_other,
                'document_number' => $log->document_number,
                'initiator_department' => $log->initiatorDepartment?->name ?? $log->initiator_department_other,
                'initiator_user_id' => $log->initiator_user_id,
                'initiator_user_name' => $log->initiatorUser?->name,
                'operator_name' => $log->operator?->name,
                'photo_path' => $log->photo_path,
                'note' => $log->note,
            ];
        }

        $approval = B3StorageMonthlyApproval::query()
            ->with([
                'environmentSupervisor:id,external_id,name',
                'hseDepartmentHead:id,external_id,name',
            ])
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        return [
            'period' => [
                'month' => $month,
                'year' => $year,
                'label' => Carbon::create($year, $month, 1)->translatedFormat('F Y'),
            ],
            'columns' => [
                'waste_types' => $wasteTypeColumns,
                'has_other_column' => true,
            ],
            'rows' => $rows,
            'totals' => [
                'by_waste_type' => $totalsByWasteType,
                'other' => $totalOther,
                'overall' => array_sum($totalsByWasteType) + $totalOther,
            ],
            'approval' => [
                'status' => $this->resolveApprovalStatus($approval),
                'environment_supervisor' => [
                    'id' => $approval?->environment_supervisor_id,
                    'name' => $approval?->environmentSupervisor?->name,
                    'signed_at' => $approval?->environment_supervisor_signed_at,
                ],
                'hse_department_head' => [
                    'id' => $approval?->hse_department_head_id,
                    'name' => $approval?->hseDepartmentHead?->name,
                    'signed_at' => $approval?->hse_department_head_signed_at,
                ],
                'note' => $approval?->note,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function approveMonthly(array $payload, User $signedUser): B3StorageMonthlyApproval
    {
        return DB::transaction(function () use ($payload, $signedUser): B3StorageMonthlyApproval {
            $month = (int) $payload['month'];
            $year = (int) $payload['year'];
            $approvalRole = $payload['approval_role'];
            $note = $payload['note'] ?? null;

            $approval = B3StorageMonthlyApproval::query()->firstOrCreate(
                ['month' => $month, 'year' => $year],
            );

            if ($approvalRole === 'HSE_DEPARTMENT_HEAD' && $approval->environment_supervisor_signed_at === null) {
                throw ValidationException::withMessages([
                    'approval_role' => ['Approval HSE Department Head menunggu approval Environment Supervisor.'],
                ]);
            }

            if ($approvalRole === 'ENVIRONMENT_SUPERVISOR') {
                $approval->update([
                    'environment_supervisor_id' => $signedUser->id,
                    'environment_supervisor_signed_at' => now(),
                    'note' => is_string($note) ? $note : $approval->note,
                ]);
            }

            if ($approvalRole === 'HSE_DEPARTMENT_HEAD') {
                $approval->update([
                    'hse_department_head_id' => $signedUser->id,
                    'hse_department_head_signed_at' => now(),
                    'note' => is_string($note) ? $note : $approval->note,
                ]);
            }

            return $approval->fresh()->load([
                'environmentSupervisor:id,external_id,name',
                'hseDepartmentHead:id,external_id,name',
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizeLogPayload(
        array $payload,
        User $operator,
        ?UploadedFile $photo,
        ?B3StorageLog $currentLog = null,
    ): array {
        $wasteTypeId = $payload['waste_type_id'] ?? null;
        $wasteTypeOther = isset($payload['waste_type_other']) ? trim((string) $payload['waste_type_other']) : null;
        $initiatorDepartmentId = $payload['initiator_department_id'] ?? null;
        $initiatorDepartmentOther = isset($payload['initiator_department_other']) ? trim((string) $payload['initiator_department_other']) : null;

        if (is_int($wasteTypeId) || ctype_digit((string) $wasteTypeId)) {
            $wasteTypeOther = null;
        }

        if (is_int($initiatorDepartmentId) || ctype_digit((string) $initiatorDepartmentId)) {
            $initiatorDepartmentOther = null;
        }

        $initiatorUserId = $currentLog?->initiator_user_id;
        $initiatorUserExternalId = isset($payload['initiator_user_external_id'])
            ? trim((string) $payload['initiator_user_external_id'])
            : null;

        if ($initiatorUserExternalId !== null && $initiatorUserExternalId !== '') {
            $initiatorUser = User::query()->where('external_id', $initiatorUserExternalId)->first();
            $initiatorUserId = $initiatorUser?->id;
        } elseif ($initiatorUserExternalId === '') {
            $initiatorUserId = null;
        }

        $photoPath = $currentLog?->photo_path;
        if ($photo instanceof UploadedFile) {
            if (is_string($photoPath) && $photoPath !== '') {
                Storage::disk('public')->delete($photoPath);
            }

            $photoPath = $photo->store('b3-storage/photos', 'public');
        }

        return [
            'movement_date' => $payload['movement_date'],
            'movement_time' => $payload['movement_time'] ?? null,
            'movement_type' => $payload['movement_type'],
            'waste_type_id' => $wasteTypeId,
            'waste_type_other' => $wasteTypeOther !== '' ? $wasteTypeOther : null,
            'initiator_department_id' => $initiatorDepartmentId,
            'initiator_department_other' => $initiatorDepartmentOther !== '' ? $initiatorDepartmentOther : null,
            'initiator_user_id' => $initiatorUserId,
            'weight_kg' => $payload['weight_kg'],
            'document_number' => $payload['document_number'],
            'photo_path' => $photoPath,
            'note' => $payload['note'] ?? null,
            'operator_id' => $operator->id,
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
}
