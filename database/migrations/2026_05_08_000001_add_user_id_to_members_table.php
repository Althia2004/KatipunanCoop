<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('id')
                ->constrained('users')
                ->nullOnDelete();
        });

        // Backfill user_id for existing members via @kscf.local email pattern
        DB::table('members')
            ->join('member_registrations', 'members.member_registration_id', '=', 'member_registrations.id')
            ->select('members.id', 'member_registrations.contact_number')
            ->get()
            ->each(function ($m) {
                $email = preg_replace('/\s+/', '', $m->contact_number) . '@kscf.local';
                $user  = DB::table('users')->where('email', $email)->first();
                if ($user) {
                    DB::table('members')->where('id', $m->id)->update(['user_id' => $user->id]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
