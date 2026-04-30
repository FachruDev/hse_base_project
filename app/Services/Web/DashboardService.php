<?php

namespace App\Services\Web;

use App\Models\Ipal\IpalDailyLog;
use App\Models\Master\BatchItem;
use App\Models\Master\ChecklistItem;
use App\Models\Master\ChecklistTemplate;
use App\Models\Master\ProcessItem;
use App\Models\Master\ProcessSection;
use App\Models\Master\ProcessTemplate;
use App\Models\User;
use Illuminate\Support\Collection;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function build(?User $user): array
    {
        $today = now()->toDateString();

        $latestLogs = IpalDailyLog::query()
            ->with([
                'operator:id,name,external_id',
                'processLog:id,log_id,status,submitted_at',
            ])
            ->latest('tanggal')
            ->limit(5)
            ->get();

        return [
            'hero' => [
                'title' => 'Ringkasan Operasional IPAL',
                'subtitle' => 'Pemantauan cepat untuk operator, supervisor, dan admin dalam satu layar.',
                'today' => now()->translatedFormat('d F Y'),
            ],
            'stats' => [
                [
                    'label' => 'Log Hari Ini',
                    'value' => IpalDailyLog::query()->whereDate('tanggal', $today)->count(),
                    'description' => 'Jumlah log IPAL yang dibuat hari ini.',
                ],
                [
                    'label' => 'Template Checklist',
                    'value' => ChecklistTemplate::query()->where('is_active', true)->count(),
                    'description' => 'Template checklist aktif untuk inspeksi harian.',
                ],
                [
                    'label' => 'Section Proses',
                    'value' => ProcessSection::query()->count(),
                    'description' => 'Tahapan proses yang sudah tersedia di master data.',
                ],
                [
                    'label' => 'Item Batch',
                    'value' => BatchItem::query()->count(),
                    'description' => 'Parameter batch yang bisa diinput operator.',
                ],
            ],
            'moduleSummary' => [
                [
                    'title' => 'Checklist',
                    'count' => ChecklistItem::query()->where('is_active', true)->count(),
                    'caption' => 'Item checklist aktif',
                    'permission' => 'master.checklist.view',
                ],
                [
                    'title' => 'Proses',
                    'count' => ProcessItem::query()->count(),
                    'caption' => 'Parameter proses',
                    'permission' => 'master.process.view',
                ],
                [
                    'title' => 'Template Proses',
                    'count' => ProcessTemplate::query()->where('is_active', true)->count(),
                    'caption' => 'Template proses aktif',
                    'permission' => 'master.process.view',
                ],
                [
                    'title' => 'Approval',
                    'count' => IpalDailyLog::query()
                        ->whereHas('processLog', fn ($query) => $query->where('status', 'SUBMITTED'))
                        ->count(),
                    'caption' => 'Menunggu persetujuan supervisor',
                    'permission' => 'ipal.logs.approve',
                ],
            ],
            'latestLogs' => $this->mapLatestLogs($latestLogs),
            'viewer' => [
                'external_id' => $user?->external_id,
                'name' => $user?->name,
            ],
        ];
    }

    /**
     * @param  Collection<int, IpalDailyLog>  $latestLogs
     * @return array<int, array<string, mixed>>
     */
    private function mapLatestLogs(Collection $latestLogs): array
    {
        return $latestLogs->map(function (IpalDailyLog $log): array {
            return [
                'id' => $log->id,
                'tanggal' => $log->tanggal?->format('Y-m-d'),
                'operator' => $log->operator?->name,
                'operator_external_id' => $log->operator?->external_id,
                'status' => $log->processLog?->status ?? 'DRAFT',
                'submitted_at' => $log->processLog?->submitted_at?->format('Y-m-d H:i:s'),
            ];
        })->all();
    }
}
