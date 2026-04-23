<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_requests', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->decimal('amount', 15, 2);
            $table->foreignId('requested_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->date('requested_at');
            $table->string('status')->default('pending');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_requests');
    }
};
