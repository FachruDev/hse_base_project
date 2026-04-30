<?php

namespace App\Services\Web;

use App\Models\Ipal\IpalDailyLog;
use App\Models\User;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function build(?User $user): array
    {
        $todayLog = $user instanceof User
            ? IpalDailyLog::query()
                ->with('processLog:id,log_id,status,submitted_at')
                ->whereBelongsTo($user, 'operator')
                ->whereDate('tanggal', now()->toDateString())
                ->first()
            : null;

        return [
            'hero' => [
                'title' => 'Workspace Form Operasional',
                'subtitle' => 'Pusat akses seluruh form operasional. Untuk saat ini, fokus utama ada di form Catatan Pengolahan Limbah Air.',
                'today' => now()->translatedFormat('d F Y'),
            ],
            'summary' => [
                'total_forms' => 1,
                'due_today' => $todayLog === null ? 1 : 0,
                'draft_active' => $todayLog !== null && ($todayLog->processLog?->status ?? 'DRAFT') === 'DRAFT' ? 1 : 0,
                'latest_status' => $todayLog?->processLog?->status ?? ($todayLog !== null ? 'DRAFT' : null),
            ],
            'forms' => [
                [
                    'key' => 'catatan-pengolahan-limbah-air',
                    'title' => 'Catatan Pengolahan Limbah Air',
                    'description' => 'Riwayat dan pengisian form harian IPAL.',
                    'frequency' => 'HARIAN',
                    'filled_today' => $todayLog !== null,
                    'today_status' => $todayLog?->processLog?->status ?? ($todayLog !== null ? 'DRAFT' : null),
                    'today_log_id' => $todayLog?->id,
                    'action_label' => $this->resolveActionLabel($todayLog?->processLog?->status, $todayLog !== null),
                ],
            ],
            'viewer' => [
                'external_id' => $user?->external_id,
                'name' => $user?->name,
            ],
        ];
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
}
