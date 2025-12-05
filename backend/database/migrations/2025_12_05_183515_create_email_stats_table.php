<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_stats', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->integer('sent_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->timestamps();

            $table->unique('date');
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_stats');
    }
};
