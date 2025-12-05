<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaire_response_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('response_id')->constrained('questionnaire_responses')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questionnaire_questions')->onDelete('cascade');
            $table->text('answer_text')->nullable();
            $table->string('answer_file_path')->nullable();
            $table->timestamps();

            $table->index('response_id');
            $table->index('question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaire_response_answers');
    }
};
