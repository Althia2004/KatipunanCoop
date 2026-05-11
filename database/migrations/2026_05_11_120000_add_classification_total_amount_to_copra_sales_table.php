<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('copra_sales', function (Blueprint $table) {
            if (! Schema::hasColumn('copra_sales', 'classification')) {
                $table->string('classification')->default('NON-MIGS')->after('sale_date');
            }

            if (! Schema::hasColumn('copra_sales', 'total_amount')) {
                $table->decimal('total_amount', 12, 2)->nullable()->after('price_per_kilo');
            }
        });

        DB::table('copra_sales')
            ->whereNull('total_amount')
            ->update(['total_amount' => DB::raw('gross_amount')]);
    }

    public function down(): void
    {
        Schema::table('copra_sales', function (Blueprint $table) {
            if (Schema::hasColumn('copra_sales', 'classification')) {
                $table->dropColumn('classification');
            }

            if (Schema::hasColumn('copra_sales', 'total_amount')) {
                $table->dropColumn('total_amount');
            }
        });
    }
};
