<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $sectionIds = DB::table('m_batch_sections')
            ->whereIn('name', ['Netralisasi', 'Koagulasi', 'Flokulasi'])
            ->pluck('id');

        foreach ($sectionIds as $sectionId) {
            $durationItem = DB::table('m_batch_items')
                ->where('section_id', $sectionId)
                ->where('name', 'Durasi (menit)')
                ->orderBy('id')
                ->first();

            $durationItemId = $durationItem?->id;

            if ($durationItem === null) {
                $waktuItem = DB::table('m_batch_items')
                    ->where('section_id', $sectionId)
                    ->where('name', 'Waktu')
                    ->orderBy('id')
                    ->first();

                if ($waktuItem === null) {
                    continue;
                }

                DB::table('m_batch_items')
                    ->where('id', $waktuItem->id)
                    ->update([
                        'name' => 'Durasi (menit)',
                        'input_type' => 'duration_minutes',
                        'updated_at' => now(),
                    ]);

                $durationItemId = $waktuItem->id;
            } else {
                DB::table('m_batch_items')
                    ->where('id', $durationItemId)
                    ->update([
                        'input_type' => 'duration_minutes',
                        'updated_at' => now(),
                    ]);
            }

            $duplicateWaktuIds = DB::table('m_batch_items')
                ->where('section_id', $sectionId)
                ->where('name', 'Waktu')
                ->pluck('id');

            foreach ($duplicateWaktuIds as $duplicateWaktuId) {
                DB::table('ipal_batch_values')
                    ->where('item_id', $duplicateWaktuId)
                    ->update(['item_id' => $durationItemId]);

                DB::table('m_batch_items')
                    ->where('id', $duplicateWaktuId)
                    ->delete();
            }
        }
    }

    public function down(): void
    {
        // Data cleanup migration. Recreating duplicate "Waktu" rows on rollback
        // would reintroduce the invalid master state, so this is intentionally a no-op.
    }
};
