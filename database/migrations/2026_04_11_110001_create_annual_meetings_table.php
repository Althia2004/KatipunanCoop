<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annual_meetings', function (Blueprint $table) {
            $table->id();
            $table->string('topic');
            $table->string('host');
            $table->date('date');
            $table->time('time_start');
            $table->time('time_end')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, completed, cancelled, overdue
            $table->text('overview')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annual_meetings');
    }
};
