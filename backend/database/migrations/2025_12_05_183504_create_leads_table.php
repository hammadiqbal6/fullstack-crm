<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['NEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CONVERTED'])->default('NEW');
            $table->string('source')->nullable();
            $table->string('onboarding_token')->nullable();
            $table->timestamp('onboarding_expires_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('status');
            $table->index('email');
            $table->index('onboarding_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};

