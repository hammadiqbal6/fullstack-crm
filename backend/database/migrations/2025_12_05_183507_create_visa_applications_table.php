<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visa_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_id')->constrained()->onDelete('cascade');
            $table->string('country');
            $table->string('visa_type');
            $table->date('travel_dates_start')->nullable();
            $table->date('travel_dates_end')->nullable();
            $table->enum('status', ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])->default('DRAFT');
            $table->date('application_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('contact_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visa_applications');
    }
};

