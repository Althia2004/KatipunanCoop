<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->decimal('capital_share_target', 12, 2)->default(10000.00)->after('share_capital');
            $table->date('capital_share_subscription_date')->nullable()->after('capital_share_target');
            $table->string('capital_share_payment_frequency')->nullable()->after('capital_share_subscription_date');
            // Allowed values: weekly, semi_monthly, monthly, quarterly, semi_annually
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'capital_share_target',
                'capital_share_subscription_date',
                'capital_share_payment_frequency',
            ]);
        });
    }
};
