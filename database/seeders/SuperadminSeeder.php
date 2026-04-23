<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SuperadminSeeder extends Seeder
{
    /**
     * Seed the application's superadmin user.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Superadmin',
                'password' => 'password',
                'role' => 'superadmin',
                'email_verified_at' => now(),
            ]
        );
    }
}
