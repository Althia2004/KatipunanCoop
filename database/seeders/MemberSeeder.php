<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\MemberRegistration;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        // Juan Dela Cruz — approved, MIGS eligible, will have a loan seeded
        $this->createMemberFull('09171234567', 'Juan', 'Santos', 'Dela Cruz',
            Member::STATUS_APPROVED, [
                'm_status' => Member::MEMBERSHIP_GOOD,
                'standing' => 'active',
                'savings'  => 5000.00,
                'share'    => 25000.00,
                'migs'     => 85,
                'class'    => 'migs',
                'copra'    => 35000.00,
                'patronage'=> 1500.00,
            ]
        );

        // Maria Ibarra — pending registration, no user account yet
        $this->createMemberFull('09187654321', 'Maria', 'Clara', 'Ibarra',
            Member::STATUS_PENDING, [
                'm_status' => Member::MEMBERSHIP_NON_COMPLIANT,
                'standing' => 'inactive',
                'savings'  => 0,
                'share'    => 0,
                'migs'     => 0,
                'class'    => 'non_migs',
                'copra'    => 0,
                'patronage'=> 0,
            ]
        );

        // Pedro Penduko — suspended, will have a defaulted loan seeded
        $this->createMemberFull('09190001111', 'Pedro', 'Bagsik', 'Penduko',
            Member::STATUS_SUSPENDED, [
                'm_status' => Member::MEMBERSHIP_WARNING,
                'standing' => 'delinquent',
                'savings'  => 150.00,
                'share'    => 500.00,
                'migs'     => 15,
                'class'    => 'non_migs',
                'copra'    => 2000.00,
                'patronage'=> 0,
            ]
        );
    }

    private function createMemberFull(
        string $phone,
        string $fname,
        string $mname,
        string $lname,
        string $status,
        array  $financials
    ): Member {
        $reg = MemberRegistration::updateOrCreate(
            ['contact_number' => $phone],
            [
                'first_name'       => $fname,
                'middle_name'      => $mname,
                'last_name'        => $lname,
                'address_street'   => '123 Coconut Street',
                'address_barangay' => 'Katipunan',
                'address_city'     => 'Katipunan',
                'address_province' => 'Davao del Norte',
                'source_of_income' => 'Coconut Farming',
                'date_of_birth'    => '1990-01-01',
                'gender'           => 'male',
                'id_number'        => "TEST-{$phone}",
                'status'           => $status === Member::STATUS_PENDING ? 'pending' : 'approved',
            ]
        );

        // Only create a user account for non-pending members
        $user = null;
        if ($status !== Member::STATUS_PENDING) {
            $user = User::updateOrCreate(
                ['email' => "{$phone}@kscf.local"],
                [
                    'name'              => "{$fname} {$lname}",
                    'password'          => Hash::make('Member@2026'),
                    'role'              => 'member',
                    'email_verified_at' => now(),
                ]
            );
        }

        $member = Member::updateOrCreate(
            ['member_registration_id' => $reg->id],
            [
                'user_id'             => $user?->id,
                'name'                => "{$fname} {$lname}",
                'gender'              => 'male',
                'status'              => $status,
                'membership_status'   => $financials['m_status'],
                'standing'            => $financials['standing'],
                'start_date'          => now()->subYear()->toDateString(),
                'savings_balance'     => $financials['savings'],
                'share_capital'       => $financials['share'],
                'copra_sales_ytd'     => $financials['copra'],
                'patronage_amount'    => $financials['patronage'],
                'migs_score'          => $financials['migs'],
                'migs_classification' => $financials['class'],
            ]
        );

        // Attempt MIGS recalculation if the service exists
        if ($member && $user) {
            try {
                app(\App\Services\MigsScoreService::class)->recalculate($member);
            } catch (\Exception $e) {
                // Service may not be configured yet — seeded score will be used
            }
        }

        return $member;
    }
}
