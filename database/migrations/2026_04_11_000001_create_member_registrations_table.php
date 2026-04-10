<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_registrations', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            // --- Personal Information ---
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('contact_number');
            $table->string('address_street');
            $table->string('address_barangay');
            $table->string('address_city');
            $table->string('address_province');
            $table->string('source_of_income');
            $table->date('date_of_birth');
            $table->string('gender'); // male, female
            $table->string('id_number'); // NIC / Government ID Number

            // --- Status Workflow ---
            // pending → seminar_scheduled → seminar_attended → for_bod_approval → approved | rejected
            $table->string('status')->default('pending');

            // --- Seminar Link ---
            // Assigned when admin schedules the applicant for a seminar
            $table->foreignId('seminar_id')
                ->nullable()
                ->constrained('seminars')
                ->nullOnDelete();

            // --- Audit ---
            $table->foreignId('registered_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_registrations');
    }
};
