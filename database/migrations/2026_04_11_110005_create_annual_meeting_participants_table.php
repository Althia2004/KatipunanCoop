<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annual_meeting_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annual_meeting_id')->constrained('annual_meetings')->cascadeOnDelete();
            $table->string('name');
            $table->string('role'); // e.g. Admin Manager, Board of Directors
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annual_meeting_participants');
    }
};
