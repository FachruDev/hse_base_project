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
        Schema::create('m_b3_storage_waste_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->unsignedInteger('order_no')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('m_b3_storage_initiator_departments', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->unsignedInteger('order_no')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('b3_storage_logs', function (Blueprint $table) {
            $table->id();

            $table->date('movement_date');
            $table->time('movement_time')->nullable();

            $table->string('movement_type', 10);

            $table->foreignId('waste_type_id')
                ->nullable()
                ->constrained('m_b3_storage_waste_types')
                ->nullOnDelete();

            $table->string('waste_type_other')->nullable();

            $table->foreignId('initiator_department_id')
                ->nullable()
                ->constrained('m_b3_storage_initiator_departments')
                ->nullOnDelete();

            $table->string('initiator_department_other')->nullable();

            $table->decimal('weight_kg', 15, 3);

            $table->string('document_number');

            $table->string('photo_path')->nullable();

            $table->text('note')->nullable();

            $table->foreignId('operator_id')
                ->constrained('users')
                ->noActionOnDelete();

            $table->timestamps();

            $table->index(['movement_date', 'movement_type']);
        });

        Schema::create('b3_storage_monthly_approvals', function (Blueprint $table) {
            $table->id();

            $table->unsignedTinyInteger('month');

            $table->unsignedSmallInteger('year');

            $table->foreignId('environment_supervisor_id')
                ->nullable()
                ->constrained('users')
                ->noActionOnDelete();

            $table->timestamp('environment_supervisor_signed_at')
                ->nullable();

            $table->foreignId('hse_department_head_id')
                ->nullable()
                ->constrained('users')
                ->noActionOnDelete();

            $table->timestamp('hse_department_head_signed_at')
                ->nullable();

            $table->text('note')->nullable();

            $table->timestamps();

            $table->unique(['month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('b3_storage_monthly_approvals');
        Schema::dropIfExists('b3_storage_logs');
        Schema::dropIfExists('m_b3_storage_initiator_departments');
        Schema::dropIfExists('m_b3_storage_waste_types');
    }
};
