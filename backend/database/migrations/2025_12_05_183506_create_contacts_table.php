<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->uuid('lead_id')->nullable();
            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('set null');
            $table->string('company')->nullable();
            $table->string('primary_contact_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('target_country')->nullable();
            $table->string('visa_type')->nullable();
            $table->date('intended_travel_date')->nullable();
            $table->text('purpose_of_visit')->nullable();
            $table->text('previous_visa_history')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('assigned_to');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
