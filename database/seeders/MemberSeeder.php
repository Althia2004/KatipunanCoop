<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\MemberRegistration;
use App\Models\User;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    /**
     * Seed a test member account for the member portal.
     *
     * Login: 09171234567@kscf.local / Member@2026
     */
    public function run(): void
    {
        $registration = MemberRegistration::firstOrCreate(
            ['contact_number' => '09171234567'],
            [
                'first_name'       => 'Juan',
                'middle_name'      => 'Santos',
                'last_name'        => 'Dela Cruz',
                'address_street'   => '123 Coconut Street',
                'address_barangay' => 'Barangay Katipunan',
                'address_city'     => 'Katipunan',
                'address_province' => 'Zamboanga del Norte',
                'source_of_income' => 'Coconut Farming',
                'date_of_birth'    => '1985-06-15',
                'gender'           => 'male',
                'id_number'        => 'TEST-001-2026',
                'status'           => 'approved',
            ]
        );

        $user = User::firstOrCreate(
            ['email' => '09171234567@kscf.local'],
            [
                'name'              => 'Juan Dela Cruz',
                'password'          => 'Member@2026',
                'role'              => 'member',
                'email_verified_at' => now(),
            ]
        );

        Member::firstOrCreate(
            ['member_registration_id' => $registration->id],
            [
                'user_id'            => $user->id,
                'name'                => 'Juan Dela Cruz',
                'gender'              => 'male',
                'status'              => Member::STATUS_APPROVED,
                'membership_status'   => Member::MEMBERSHIP_GOOD,
                'standing'            => 'active',
                'start_date'          => '2024-01-15',
                'savings_balance'     => 5000.00,
                'share_capital'       => 10000.00,
                'copra_sales_ytd'     => 25000.00,
                'migs_score'          => 75,
                'migs_classification' => 'migs_eligible',
            ]
        );
    }
}
