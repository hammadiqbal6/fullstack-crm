<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaire_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('questionnaire_id')->constrained()->onDelete('cascade');
            $table->foreignId('contact_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('submitted_at')->nullable();
            $table->enum('status', ['DRAFT', 'SUBMITTED', 'REVIEWED'])->default('DRAFT');
            $table->timestamps();
            
            $table->index('questionnaire_id');
            $table->index('contact_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaire_responses');
    }
};

