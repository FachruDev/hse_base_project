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
        Schema::create('m_checklist_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('m_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('m_checklist_templates')->cascadeOnDelete();
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('standard_condition')->nullable();
            $table->unsignedInteger('order_no')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('m_process_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('m_process_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('m_process_templates')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('order_no')->default(1);
            $table->timestamps();
        });

        Schema::create('m_process_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('m_process_sections')->cascadeOnDelete();
            $table->string('name');
            $table->string('standard_condition')->nullable();
            $table->string('input_type');
            $table->unsignedInteger('order_no')->default(1);
            $table->timestamps();
        });

        Schema::create('m_batch_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('input_type');
            $table->unsignedInteger('order_no')->default(1);
            $table->timestamps();
        });

        Schema::create('ipal_daily_log', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('operator_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['tanggal', 'operator_id']);
        });

        Schema::create('ipal_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('log_id')->unique()->constrained('ipal_daily_log')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('m_checklist_templates')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('ipal_checklist_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_id')->constrained('ipal_checklists')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('m_checklist_items')->restrictOnDelete();
            $table->string('status');
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('ipal_process_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('log_id')->unique()->constrained('ipal_daily_log')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('m_process_templates')->restrictOnDelete();
            $table->string('status')->default('DRAFT');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ipal_process_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('process_log_id')->constrained('ipal_process_logs')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('m_process_items')->restrictOnDelete();
            $table->text('value_text')->nullable();
            $table->decimal('value_number', 15, 4)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('ipal_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('process_log_id')->constrained('ipal_process_logs')->cascadeOnDelete();
            $table->unsignedInteger('batch_no');
            $table->timestamps();

            $table->unique(['process_log_id', 'batch_no']);
        });

        Schema::create('ipal_batch_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('ipal_batches')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('m_batch_items')->restrictOnDelete();
            $table->text('value_text')->nullable();
            $table->decimal('value_number', 15, 4)->nullable();
            $table->timestamps();
        });

        Schema::create('ipal_process_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('process_log_id')->unique()->constrained('ipal_process_logs')->cascadeOnDelete();
            $table->foreignId('operator_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('operator_signed_at')->nullable();
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('supervisor_signed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('ipal_checklist_approvals', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->foreignId('supervisor_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->unique(['month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ipal_checklist_approvals');
        Schema::dropIfExists('ipal_process_approvals');
        Schema::dropIfExists('ipal_batch_values');
        Schema::dropIfExists('ipal_batches');
        Schema::dropIfExists('ipal_process_values');
        Schema::dropIfExists('ipal_process_logs');
        Schema::dropIfExists('ipal_checklist_values');
        Schema::dropIfExists('ipal_checklists');
        Schema::dropIfExists('ipal_daily_log');
        Schema::dropIfExists('m_batch_items');
        Schema::dropIfExists('m_process_items');
        Schema::dropIfExists('m_process_sections');
        Schema::dropIfExists('m_process_templates');
        Schema::dropIfExists('m_checklist_items');
        Schema::dropIfExists('m_checklist_templates');
    }
};
