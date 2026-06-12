<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('b3_storage_logs', function (Blueprint $table): void {
            $table->foreignId('initiator_user_id')->nullable()->after('operator_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('b3_storage_logs', function (Blueprint $table): void {
            $table->dropForeignIdFor(User::class, 'initiator_user_id');
            $table->dropColumn('initiator_user_id');
        });
    }
};
