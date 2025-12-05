<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaire_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('questionnaire_id')->constrained()->onDelete('cascade');
            $table->text('question_text');
            $table->enum('question_type', ['text', 'textarea', 'select', 'radio', 'checkbox', 'file_upload', 'date'])->default('text');
            $table->json('options')->nullable();
            $table->boolean('required')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index('questionnaire_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaire_questions');
    }
};

