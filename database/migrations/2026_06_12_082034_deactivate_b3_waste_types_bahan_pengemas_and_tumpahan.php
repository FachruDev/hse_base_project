<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // F2-15: Deactivate "Bahan Pengemas" (ID=3) & "Tumpahan B3" (ID=6)
        // Using soft-delete via is_active flag to preserve historical data integrity
        DB::table('m_b3_storage_waste_types')
            ->whereIn('id', [3, 6])
            ->update(['is_active' => false]);
    }

    public function down(): void
    {
        DB::table('m_b3_storage_waste_types')
            ->whereIn('id', [3, 6])
            ->update(['is_active' => true]);
    }
};
