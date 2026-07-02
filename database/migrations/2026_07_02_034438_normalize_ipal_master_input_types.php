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
        DB::table('m_process_items')
            ->whereIn('input_type', ['option_standard', 'select'])
            ->update([
                'input_type' => 'option',
                'updated_at' => now(),
            ]);

        DB::table('m_process_items')
            ->where('input_type', 'number')
            ->update([
                'input_type' => 'decimal_2',
                'updated_at' => now(),
            ]);

        DB::table('m_batch_items')
            ->where('name', 'Durasi (menit)')
            ->update([
                'input_type' => 'duration_minutes',
                'updated_at' => now(),
            ]);

        DB::table('m_batch_items')
            ->whereIn('input_type', ['option_standard', 'select'])
            ->update([
                'input_type' => 'option',
                'updated_at' => now(),
            ]);

        DB::table('m_batch_items')
            ->where('input_type', 'number')
            ->where('name', '<>', 'Durasi (menit)')
            ->update([
                'input_type' => 'decimal_2',
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Data normalization only. Reverting would reintroduce legacy input types.
    }
};
