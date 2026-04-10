<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('member_registration_id')
                ->constrained('member_registrations')
                ->cascadeOnDelete();

            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('contact_number');
            $table->string('address_street');
            $table->string('address_barangay');
            $table->string('address_city');
            $table->string('address_province');
            $table->string('relationship'); // e.g. Father, Mother, Spouse, Brother
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
    }
};
