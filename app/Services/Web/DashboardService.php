<?php

namespace App\Services\Web;

use App\Models\B3Storage\B3StorageLog;
use App\Models\Ipal\IpalDailyLog;
use App\Models\User;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function build(?User $user): array
    {
        $todayIpalLog = $user instanceof User
            ? IpalDailyLog::query()
                ->with('processLog:id,log_id,status,submitted_at')
                ->whereBelongsTo($user, 'operator')
                ->whereDate('tanggal', now()->toDateString())
                ->first()
            : null;
        $todayB3Log = $user instanceof User
            ? B3StorageLog::query()
                ->whereBelongsTo($user, 'operator')
                ->whereDate('movement_date', now()->toDateString())
                ->latest('id')
                ->first()
            : null;

        $forms = [
            [
                'key' => 'catatan-pengolahan-limbah-air',
                'title' => 'Catatan Pengolahan Limbah Air',
                'description' => 'Riwayat dan pengisian form harian IPAL.',
                'frequency' => 'HARIAN',
                'filled_today' => $todayIpalLog !== null,
                'today_status' => $todayIpalLog?->processLog?->status ?? ($todayIpalLog !== null ? 'DRAFT' : null),
                'today_log_id' => $todayIpalLog?->id,
                'action_label' => $this->resolveActionLabel($todayIpalLog?->processLog?->status, $todayIpalLog !== null),
            ],
            [
                'key' => 'penyimpanan-limbah-b3',
                'title' => 'Penyimpanan Limbah B3',
                'description' => 'Pencatatan limbah B3 masuk/keluar untuk rekap bulanan.',
                'frequency' => 'HARIAN',
                'filled_today' => $todayB3Log !== null,
                'today_status' => $todayB3Log !== null ? 'TERCATAT' : null,
                'today_log_id' => $todayB3Log?->id,
                'action_label' => $todayB3Log !== null ? 'Tambah/Lihat Entri Hari Ini' : 'Isi Harian',
            ],
        ];

        return [
            'hero' => [
                'title' => 'Workspace Form Operasional',
                'subtitle' => 'Pusat akses seluruh form operasional harian.',
                'today' => now()->translatedFormat('d F Y'),
            ],
            'summary' => [
                'total_forms' => count($forms),
                'due_today' => collect($forms)->where('filled_today', false)->count(),
                'draft_active' => ($todayIpalLog !== null && ($todayIpalLog->processLog?->status ?? 'DRAFT') === 'DRAFT') ? 1 : 0,
                'latest_status' => $todayIpalLog?->processLog?->status ?? ($todayIpalLog !== null ? 'DRAFT' : null),
            ],
            'forms' => $forms,
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
