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
        Schema::create('store_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->enum('metric_type', ['customer_visits', 'orders', 'revenue']);
            $table->enum('period_type', ['daily', 'weekly', 'monthly', 'yearly']);
            $table->decimal('target_value', 15, 2);
            $table->date('period_start');
            $table->date('period_end')->nullable();
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_targets');
    }
};
