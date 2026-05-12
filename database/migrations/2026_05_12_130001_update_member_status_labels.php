<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Rename 'active' → 'member' and 'suspended' → 'inactive'
        // SQLite does not support ALTER COLUMN for enums — use raw UPDATE statements.
        DB::statement("UPDATE members SET status = 'member' WHERE status = 'active'");
        DB::statement("UPDATE members SET status = 'inactive' WHERE status = 'suspended'");
    }

    public function down(): void
    {
        DB::statement("UPDATE members SET status = 'member' WHERE status = 'active'");
        DB::statement("UPDATE members SET status = 'inactive' WHERE status = 'suspended'");

        DB::statement("UPDATE members SET status = 'active' WHERE status = 'member'");
        DB::statement("UPDATE members SET status = 'suspended' WHERE status = 'inactive'");
    }
};
