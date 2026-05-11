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
        Schema::table('annual_meetings', function (Blueprint $table) {
            $table->foreignId('seminar_id')->nullable()->constrained('seminars')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('annual_meetings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('seminar_id');
        });
    }
};
