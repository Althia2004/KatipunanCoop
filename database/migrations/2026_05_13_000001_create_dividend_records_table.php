<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dividend_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->integer('year');
            $table->decimal('share_capital', 12, 2)->default(0);
            $table->decimal('capital_pct', 8, 4)->default(0);
            $table->decimal('dividend_amount', 12, 2)->default(0);
            $table->enum('status', ['tentative', 'verified', 'released'])->default('tentative');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('verified_at')->nullable();
            $table->foreignId('released_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('released_at')->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dividend_records');
    }
};
