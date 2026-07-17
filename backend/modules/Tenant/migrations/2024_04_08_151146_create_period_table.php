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
        Schema::create('period', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_current')->default(false);
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->dateTime('enrollment_start_date')->nullable();
            $table->dateTime('enrollment_end_date')->nullable();
            $table->dateTime('classroom_start_date')->nullable();
            $table->dateTime('classroom_end_date')->nullable();
            $table->integer('is_number_to_fail')->default(1);
            $table->decimal('classroom_max_to_fail', 4, 2)->nullable();
            $table->boolean('is_required_enrollment_payment')->default(false);
            $table->dateTime('created_at');
            $table->dateTime('updated_at')->nullable();
            $table->dateTime('deleted_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('period');
    }
};
