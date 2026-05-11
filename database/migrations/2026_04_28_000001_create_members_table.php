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
        $table->timestamps();

        $table->string('name');
        $table->enum('gender', ['male', 'female', 'other'])->nullable();
        
        // UPDATED: Added active, suspended, and pending_deletion
        $table->enum('status', [
            'pending', 
            'approved', 
            'rejected', 
            'active', 
            'suspended', 
            'pending_deletion'
        ])->default('pending');


        $table->integer('migs_score')->default(0);
        $table->string('migs_classification')->default('non_migs');
        $table->json('migs_breakdown')->nullable(); 
        $table->timestamp('migs_calculated_at')->nullable();

        $table->enum('membership_status', ['good', 'warning', 'non-compliant'])->default('good');
        
        // UPDATED: Standardized string or you can use enum here too
        $table->string('standing')->default('active'); 
        
        $table->date('start_date')->nullable();
        $table->dateTime('last_login')->nullable();
        
        
        $table->decimal('savings_balance', 15, 2)->default(0);
        $table->decimal('share_capital', 15, 2)->default(0);
        $table->decimal('copra_sales_ytd', 15, 2)->default(0);
        $table->decimal('patronage_amount', 12, 2)->default(0);
    });
}

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
