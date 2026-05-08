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
        Schema::table('members', function (Blueprint $table) {
            $table->decimal('savings_balance', 12, 2)->default(0)->after('standing');
            $table->decimal('share_capital', 12, 2)->default(0)->after('savings_balance');
            $table->decimal('copra_sales_ytd', 12, 2)->default(0)->after('share_capital');
            $table->decimal('patronage_amount', 12, 2)->default(0)->after('copra_sales_ytd');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['savings_balance', 'share_capital', 'copra_sales_ytd', 'patronage_amount']);
        });
    }
};
