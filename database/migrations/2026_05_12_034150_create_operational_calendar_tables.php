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
        Schema::create('m_operational_weekdays', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('day_of_week_iso')->unique();
            $table->string('day_name', 16);
            $table->boolean('is_off')->default(false);
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('m_holidays', function (Blueprint $table) {
            $table->id();
            $table->date('holiday_date')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('ipal_daily_log', function (Blueprint $table): void {
            $table->string('day_type', 20)->default('OPERATIONAL')->after('operator_id');
            $table->boolean('is_operational')->default(true)->after('day_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ipal_daily_log', function (Blueprint $table): void {
            $table->dropColumn(['day_type', 'is_operational']);
        });

        Schema::dropIfExists('m_holidays');
        Schema::dropIfExists('m_operational_weekdays');
    }
};
