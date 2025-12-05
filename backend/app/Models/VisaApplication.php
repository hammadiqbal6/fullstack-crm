<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisaApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id',
        'country',
        'visa_type',
        'travel_dates_start',
        'travel_dates_end',
        'status',
        'application_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'travel_dates_start' => 'date',
            'travel_dates_end' => 'date',
            'application_date' => 'date',
        ];
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function files()
    {
        return $this->morphMany(File::class, 'attachable');
    }
}

