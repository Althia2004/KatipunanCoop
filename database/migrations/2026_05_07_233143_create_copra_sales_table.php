<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copra_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->date('sale_date');
            $table->decimal('kilos', 10, 2);
            $table->decimal('price_per_kilo', 8, 2);
            $table->decimal('gross_amount', 12, 2);
            $table->decimal('deduction_amount', 12, 2)->default(0);
            $table->string('deduction_type')->nullable(); // 'loan_payment', 'savings', 'manual', null
            $table->decimal('net_amount', 12, 2);
            $table->text('remarks')->nullable();
            $table->foreignId('recorded_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copra_sales');
    }
};
