<?php

// database/migrations/2026_05_11_000000_create_share_accounts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Main balance tracker for each member
        Schema::create('share_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->bigInteger('paid_up_balance')->default(0); // Stored in centavos
            $table->timestamps();
        });

        // Immutable ledger of all capital movements
        Schema::create('share_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('share_account_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['deposit', 'withdrawal', 'dividend', 'patronage_refund']);
            $table->bigInteger('amount'); // Always positive integer
            $table->string('reference_number')->nullable(); // OR Number or Check #
            $table->timestamp('processed_at');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('share_transactions');
        Schema::dropIfExists('share_accounts');
    }
};

