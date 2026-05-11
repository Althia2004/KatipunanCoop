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
        Schema::table('loan_payments', function (Blueprint $table) {
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete()->after('remarks');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->after('recorded_by');
            $table->string('payment_type')->default('onsite')->after('updated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loan_payments', function (Blueprint $table) {
            $table->dropForeign(['recorded_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['recorded_by', 'updated_by', 'payment_type']);
        });
    }
};
