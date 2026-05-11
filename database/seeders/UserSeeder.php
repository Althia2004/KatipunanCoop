<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Member;
use App\Models\MemberRegistration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'role' => 'member',
                'email_verified_at' => now(),
            ]
        );

        $registration = MemberRegistration::firstOrCreate(
            ['first_name' => 'Regular', 'last_name' => 'User'],
            [
                'id_number' => 'MEM-2026-0001',
                'gender' => 'male', // Must be lowercase to match Enum
                'contact_number' => '09123456789',
                'status' => 'approved',
            ]
        );

        Member::firstOrCreate(
            ['user_id' => $user->id], 
            [
                'member_registration_id' => $registration->id,
                'name' => $user->name,
                'gender' => 'male', // Must be lowercase to match Enum
                'status' => 'approved', // Must be 'approved' (NOT 'active') to match Enum
                'membership_status' => 'good',
                'standing' => 'active', 
                'start_date' => now(),
                'savings_balance' => 2500.00,
                'share_capital' => 10000.00,
                'migs_score' => 85,
                'migs_breakdown' => ['attendance' => 20, 'savings' => 30],
            ]
        );
    }
}