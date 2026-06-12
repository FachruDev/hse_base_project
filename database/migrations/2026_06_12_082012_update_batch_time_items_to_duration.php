<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The "Waktu" items (ids 5, 9, 13) inside batch sections Netralisasi,
     * Koagulasi, and Flokulasi are time-string placeholders that should be
     * numeric duration fields measured in minutes.
     *
     * This migration:
     *  - Changes input_type from 'text' to 'number' for these items.
     *  - Renames them to "Durasi (menit)" so the label clearly conveys the unit.
     */
    public function up(): void
    {
        // Retrieve the items whose names are "Waktu" and are the duration placeholders.
        // We identify them by name + section context rather than hard-coding IDs so that
        // the migration is safe to run even if IDs differ across environments.
        $sectionNames = ['Netralisasi', 'Koagulasi', 'Flokulasi'];

        $sectionIds = DB::table('m_batch_sections')
            ->whereIn('name', $sectionNames)
            ->pluck('id');

        DB::table('m_batch_items')
            ->whereIn('section_id', $sectionIds)
            ->where('name', 'Waktu')
            ->where('input_type', 'text')
            ->update([
                'input_type' => 'number',
                'name' => 'Durasi (menit)',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        $sectionNames = ['Netralisasi', 'Koagulasi', 'Flokulasi'];

        $sectionIds = DB::table('m_batch_sections')
            ->whereIn('name', $sectionNames)
            ->pluck('id');

        DB::table('m_batch_items')
            ->whereIn('section_id', $sectionIds)
            ->where('name', 'Durasi (menit)')
            ->where('input_type', 'number')
            ->update([
                'input_type' => 'text',
                'name' => 'Waktu',
                'updated_at' => now(),
            ]);
    }
};
