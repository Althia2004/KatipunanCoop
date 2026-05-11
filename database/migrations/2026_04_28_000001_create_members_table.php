<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('member_registration_id')->nullable()->constrained()->onDelete('set null');
            
            $table->string('name');
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->enum('membership_status', ['good', 'warning', 'non-compliant'])->default('good');
            $table->string('standing')->default('active');
            
            $table->date('start_date')->nullable();
            $table->dateTime('last_login')->nullable();
            
            // Add these missing columns that your Model uses:
            $table->decimal('savings_balance', 15, 2)->default(0);
            $table->decimal('share_capital', 15, 2)->default(0);
            $table->decimal('copra_sales_ytd', 15, 2)->default(0);
            $table->decimal('patronage_amount', 15, 2)->default(0);
            $table->integer('migs_score')->default(0);
            $table->string('migs_classification')->default('non_migs');
            $table->json('migs_breakdown')->nullable();
            $table->dateTime('migs_calculated_at')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
