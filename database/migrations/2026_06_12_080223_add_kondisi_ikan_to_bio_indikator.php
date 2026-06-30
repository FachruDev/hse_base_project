<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add "Kondisi Ikan" to the Bio Indikator section when master data already exists.
     */
    public function up(): void
    {
        $sectionId = DB::table('m_process_sections')
            ->where('name', 'Bio Indikator')
            ->value('id');

        if ($sectionId === null) {
            return;
        }

        DB::table('m_process_items')->updateOrInsert(
            [
                'section_id' => $sectionId,
                'name' => 'Kondisi Ikan',
            ],
            [
                'standard_condition' => 'Aktif, tidak ada yang mati',
                'input_type' => 'option_standard',
                'order_no' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );
    }

    /**
     * Reverse the migration: remove the "Kondisi Ikan" item.
     */
    public function down(): void
    {
        $sectionId = DB::table('m_process_sections')
            ->where('name', 'Bio Indikator')
            ->value('id');

        if ($sectionId === null) {
            return;
        }

        DB::table('m_process_items')
            ->where('section_id', $sectionId)
            ->where('name', 'Kondisi Ikan')
            ->delete();
    }
};
