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
        Schema::create('m_batch_sections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('order_no')->default(1);
            $table->timestamps();
        });

        Schema::table('m_batch_items', function (Blueprint $table) {
            $table->foreignId('section_id')->nullable()->after('id')->constrained('m_batch_sections')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_batch_items', function (Blueprint $table) {
            $table->dropForeign(['section_id']);
            $table->dropColumn('section_id');
        });

        Schema::dropIfExists('m_batch_sections');
    }
};
