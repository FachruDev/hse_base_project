<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Move "Masukan udara" (id=11) from Sedimentasi Kimia (section_id=4)
     * to the very beginning of Aerasi (Lumpur Aktif) (section_id=5).
     *
     * We set order_no=0 so it appears before the existing items (order_no 1,2,3).
     */
    public function up(): void
    {
        DB::table('m_process_items')
            ->where('id', 11)
            ->update([
                'section_id' => 5,
                'order_no' => 0,
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migration: move "Masukan udara" back to Sedimentasi Kimia.
     */
    public function down(): void
    {
        DB::table('m_process_items')
            ->where('id', 11)
            ->update([
                'section_id' => 4,
                'order_no' => 4,
                'updated_at' => now(),
            ]);
    }
};
