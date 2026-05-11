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
        // 1. THE IDEAL MEMBER (Demonstrates Active Status & MIGS Compliance)
        $this->createMemberFull(
            '09171234567', 'Juan', 'Santos', 'Dela Cruz', 
            Member::STATUS_APPROVED, 
            [
                'm_status' => Member::MEMBERSHIP_GOOD, 
                'standing' => 'active',
                'savings'  => 5000.00, 
                'share'    => 10000.00, 
                'migs'     => 85, 
                'class'    => 'migs_eligible'
            ]
        );

        // 2. THE NEW APPLICANT (Demonstrates Verification Business Activity)
        $this->createMemberFull(
            '09187654321', 'Maria', 'Clara', 'Ibarra', 
            Member::STATUS_PENDING, 
            [
                'm_status' => Member::MEMBERSHIP_NON_COMPLIANT, 
                'standing' => 'inactive',
                'savings'  => 0, 
                'share'    => 0, 
                'migs'     => 0, 
                'class'    => 'non_migs'
            ]
        );

        // 3. THE DELINQUENT MEMBER (Demonstrates Role-Based Suspension Activity)
        $this->createMemberFull(
            '09190001111', 'Pedro', 'Bagsik', 'Penduko', 
            Member::STATUS_SUSPENDED, 
            [
                'm_status' => Member::MEMBERSHIP_WARNING, 
                'standing' => 'delinquent',
                'savings'  => 150.00, 
                'share'    => 500.00, 
                'migs'     => 15, 
                'class'    => 'non_migs'
            ]
        );
    }

    private function createMemberFull($phone, $fname, $mname, $lname, $status, $financials)
    {
        $reg = MemberRegistration::updateOrCreate(
            ['contact_number' => $phone],
            [
                'first_name' => $fname,
                'middle_name' => $mname,
                'last_name' => $lname,
                'address_street' => '123 Coconut Street',
                'address_barangay' => 'Katipunan',
                'address_city' => 'Katipunan',
                'address_province' => 'Zamboanga del Norte',
                'source_of_income' => 'Coconut Farming',
                'date_of_birth' => '1990-01-01',
                'gender' => 'male',
                'id_number' => "TEST-$phone",
                'status' => $status,
            ]
        );

        $member = Member::updateOrCreate(
            ['member_registration_id' => $reg->id],
            [
                'name'                => "$fname $lname",
                'gender'              => $reg->gender,
                'status'              => $status,
                'membership_status'   => $financials['m_status'], // Uses 'good', 'warning', or 'non-compliant'
                'standing'            => $financials['standing'],
                'start_date'          => now()->subYear(),
                'savings_balance'     => $financials['savings'],
                'share_capital'       => $financials['share'],
                'migs_score'          => $financials['migs'],
                'migs_classification' => $financials['class'],
                'copra_sales_ytd'     => 25000.00,
            ]
        );

        // Only create a portal account for non-pending members
        if ($status !== Member::STATUS_PENDING) {
            User::updateOrCreate(
                ['email' => "$phone@kscf.local"],
                [
                    'name'              => "$fname $lname",
                    'password'          => Hash::make('Member@2026'),
                    'role'              => 'member',
                    'email_verified_at' => now(),
                ]
            );
        }

        return $member;
    }
}