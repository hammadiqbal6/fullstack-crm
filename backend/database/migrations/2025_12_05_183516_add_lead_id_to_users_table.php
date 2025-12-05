<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('lead_id')->nullable()->after('id');
            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('set null');
            $table->index('lead_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['lead_id']);
            $table->dropIndex(['lead_id']);
            $table->dropColumn('lead_id');
        });
    }
};

