<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->boolean('is_archived')->default(false)->after('standing');
            $table->timestamp('archived_at')->nullable()->after('is_archived');
            $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete()->after('archived_at');
            $table->text('archive_reason')->nullable()->after('archived_by');
            $table->integer('archive_year')->nullable()->after('archive_reason');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropConstrainedForeignId('archived_by');
            $table->dropColumn(['is_archived', 'archived_at', 'archive_reason', 'archive_year']);
        });
    }
};
