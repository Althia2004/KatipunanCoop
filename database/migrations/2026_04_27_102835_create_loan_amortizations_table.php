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
        Schema::create('loan_amortizations', function (Blueprint $table)
        {
            $table->id();
            // Links back to the Loan
            $table->foreignId('loan_id')->constrained()->onDelete('cascade');
            
            $table->date('due_date');
            $table->decimal('amount_to_pay', 15, 2);
            $table->decimal('principal_part', 15, 2);
            $table->decimal('interest_part', 15, 2);
            
            // tracking state
            $table->string('status')->default('pending'); // pending, paid, overdue
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_amortizations');
    }
};
