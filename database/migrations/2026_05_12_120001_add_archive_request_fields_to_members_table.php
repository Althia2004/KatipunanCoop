<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->boolean('archive_requested')->default(false)->after('archive_year');
            $table->timestamp('archive_requested_at')->nullable()->after('archive_requested');
            $table->foreignId('archive_requested_by')->nullable()->constrained('users')->nullOnDelete()->after('archive_requested_at');
            $table->text('archive_request_reason')->nullable()->after('archive_requested_by');
            $table->boolean('restore_requested')->default(false)->after('archive_request_reason');
            $table->timestamp('restore_requested_at')->nullable()->after('restore_requested');
            $table->foreignId('restore_requested_by')->nullable()->constrained('users')->nullOnDelete()->after('restore_requested_at');
            $table->text('restore_request_reason')->nullable()->after('restore_requested_by');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropConstrainedForeignId('archive_requested_by');
            $table->dropConstrainedForeignId('restore_requested_by');
            $table->dropColumn([
                'archive_requested', 'archive_requested_at', 'archive_request_reason',
                'restore_requested', 'restore_requested_at', 'restore_request_reason',
            ]);
        });
    }
};
