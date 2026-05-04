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
        Schema::create('loan_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained()->onDelete('cascade');
            
            // Optional: Link to a specific amortization if you want to track which month this payment covers
            $table->foreignId('loan_amortization_id')->nullable()->constrained()->onDelete('set null');

            $table->decimal('amount_paid', 15, 2);
            $table->date('payment_date');
            $table->string('payment_method'); // cash, bank_transfer, check, salary_deduction
            $table->string('reference_number')->nullable(); // Receipt # or Transaction ID
            
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_payments');
    }
};
