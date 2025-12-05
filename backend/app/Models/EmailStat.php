<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'sent_count',
        'failed_count',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'sent_count' => 'integer',
            'failed_count' => 'integer',
        ];
    }

    public static function incrementSentCount(): void
    {
        $today = now()->toDateString();
        self::updateOrCreate(
            ['date' => $today],
            ['sent_count' => \DB::raw('sent_count + 1')]
        );
    }

    public static function incrementFailedCount(): void
    {
        $today = now()->toDateString();
        self::updateOrCreate(
            ['date' => $today],
            ['failed_count' => \DB::raw('failed_count + 1')]
        );
    }

    public static function getTodayCount(): int
    {
        $stat = self::where('date', now()->toDateString())->first();
        return $stat ? $stat->sent_count : 0;
    }
}

