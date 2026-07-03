<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $bioIndicatorSectionIds = DB::table('m_process_sections')
            ->where('name', 'Bio Indikator')
            ->pluck('id');

        if ($bioIndicatorSectionIds->isEmpty()) {
            return;
        }

        DB::table('m_process_items')
            ->whereIn('section_id', $bioIndicatorSectionIds)
            ->where('name', 'Jumlah ikan')
            ->update([
                'input_type' => 'integer',
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $bioIndicatorSectionIds = DB::table('m_process_sections')
            ->where('name', 'Bio Indikator')
            ->pluck('id');

        if ($bioIndicatorSectionIds->isEmpty()) {
            return;
        }

        DB::table('m_process_items')
            ->whereIn('section_id', $bioIndicatorSectionIds)
            ->where('name', 'Jumlah ikan')
            ->where('input_type', 'integer')
            ->update([
                'input_type' => 'decimal_2',
                'updated_at' => now(),
            ]);
    }
};
