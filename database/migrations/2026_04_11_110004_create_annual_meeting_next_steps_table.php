<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annual_meeting_next_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annual_meeting_id')->constrained('annual_meetings')->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annual_meeting_next_steps');
    }
};
