<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add "Kondisi Ikan" to the Bio Indikator section (section_id=10).
     *
     * Current items in section 10:
     *   order_no=1 → "Air"
     *   order_no=2 → "Jumlah ikan"
     *
     * New item is inserted at order_no=3 (after "Jumlah ikan").
     */
    public function up(): void
    {
        DB::table('m_process_items')->insert([
            'section_id' => 10,
            'name' => 'Kondisi Ikan',
            'standard_condition' => 'Aktif, tidak ada yang mati',
            'input_type' => 'option_standard',
            'order_no' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migration: remove the "Kondisi Ikan" item.
     */
    public function down(): void
    {
        DB::table('m_process_items')
            ->where('section_id', 10)
            ->where('name', 'Kondisi Ikan')
            ->delete();
    }
};
