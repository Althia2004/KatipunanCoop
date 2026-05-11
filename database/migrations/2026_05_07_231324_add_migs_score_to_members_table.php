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
        Schema::table('members', function (Blueprint $table) {
            $table->integer('migs_score')->default(0)->after('share_capital');
            $table->string('migs_classification')->default('non_migs')->after('migs_score');
            $table->json('migs_breakdown')->nullable()->after('migs_classification');
            $table->timestamp('migs_calculated_at')->nullable()->after('migs_breakdown');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['migs_score', 'migs_classification', 'migs_breakdown', 'migs_calculated_at']);
        });
    }
};
