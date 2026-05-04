<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('seminars', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->string("title");
            $table->text('description')->nullable();
            $table->string('speaker_name')->nullable();

            $table->dateTime('scheduled_at');
            $table->string('location');
            $table->integer('capacity')->default(0)->comment('0 for unlimited');

            $table->string('status')->default('draft'); // draft, published, completed

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seminars');
    }
};
