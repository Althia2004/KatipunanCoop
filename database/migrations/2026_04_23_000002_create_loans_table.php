<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('member_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('loan_request_id')
                ->constrained('loan_requests')
                ->cascadeOnDelete();

            $table->decimal('principal_amount', 15, 2);
            $table->integer('term_months'); 
            $table->decimal('interest_rate', 5, 2);
            $table->decimal('total_payable', 15, 2);
            $table->decimal('remaining_balance', 15, 2);
            $table->string('status')->default('active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
