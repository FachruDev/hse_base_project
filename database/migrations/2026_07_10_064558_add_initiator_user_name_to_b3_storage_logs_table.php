<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('b3_storage_logs', function (Blueprint $table) {
            $table->string('initiator_user_name')->nullable()->after('initiator_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('b3_storage_logs', function (Blueprint $table) {
            $table->dropColumn('initiator_user_name');
        });
    }
};
