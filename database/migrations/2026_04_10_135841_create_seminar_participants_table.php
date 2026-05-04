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
        Schema::create('seminar_participants', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('seminar_id')->contrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelte();

            $table->timestamp('attended_at')->nullable(); // Null = absent, Filled = Present
            $table->string('status')->default('registered'); //registered, waitlisted, attended
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seminar_participants');
    }
};
