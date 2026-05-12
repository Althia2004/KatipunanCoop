<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->foreignId('member_registration_id')
                ->nullable()
                ->constrained('member_registrations')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropForeignKeyIfExists('members_member_registration_id_foreign');
            $table->dropColumnIfExists('member_registration_id');
        });
    }
};
